import { Injectable } from '@angular/core';
import { Telemetry, type LogContext } from '@senbilan/core/application';
import { type AppConfig } from '@senbilan/shared/config';

type SentryModule = typeof import('@sentry/angular');

/**
 * Sentry-backed telemetry. No-ops when `sentry.enabled` is false or DSN is empty.
 */
@Injectable()
export class SentryTelemetry extends Telemetry {
  private enabled = false;
  private sentry: SentryModule | null = null;

  async init(config: AppConfig): Promise<void> {
    if (!config.sentry.enabled || !config.sentry.dsn) {
      this.enabled = false;
      this.sentry = null;
      return;
    }
    const sentry = await import('@sentry/angular');
    sentry.init({
      dsn: config.sentry.dsn,
      environment: config.sentry.environment,
      tracesSampleRate: config.sentry.tracesSampleRate,
      beforeSend(event) {
        if (event.request?.headers) {
          const headers = { ...event.request.headers };
          for (const key of Object.keys(headers)) {
            const lower = key.toLowerCase();
            if (
              lower === 'authorization' ||
              lower === 'cookie' ||
              lower === 'x-api-key' ||
              lower.includes('token')
            ) {
              delete headers[key];
            }
          }
          event.request.headers = headers;
        }
        if (event.user?.email) {
          event.user = { ...event.user, email: '[redacted]' };
        }
        const scrub = (value: unknown): unknown => {
          if (typeof value === 'string') {
            return value
              .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
              .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]');
          }
          if (Array.isArray(value)) {
            return value.map(scrub);
          }
          if (value && typeof value === 'object') {
            const out: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
              out[k] = /password|token|secret|authorization/i.test(k) ? '[redacted]' : scrub(v);
            }
            return out;
          }
          return value;
        };
        if (event.extra) {
          event.extra = scrub(event.extra) as typeof event.extra;
        }
        if (event.contexts) {
          event.contexts = scrub(event.contexts) as typeof event.contexts;
        }
        return event;
      },
    });
    this.sentry = sentry;
    this.enabled = true;
  }

  override captureException(error: unknown, context?: LogContext): void {
    if (!this.enabled || !this.sentry) {
      return;
    }
    this.sentry.captureException(error, context ? { extra: { ...context } } : undefined);
  }

  override addBreadcrumb(message: string, context?: LogContext): void {
    if (!this.enabled || !this.sentry) {
      return;
    }
    this.sentry.addBreadcrumb({
      message,
      level: 'info',
      ...(context !== undefined ? { data: { ...context } } : {}),
    });
  }

  override setUser(user: { id: string } | null): void {
    if (!this.enabled || !this.sentry) {
      return;
    }
    this.sentry.setUser(user);
  }

  override async startSpan<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled || !this.sentry) {
      return fn();
    }
    return this.sentry.startSpan({ name, op: 'function' }, () => fn());
  }
}
