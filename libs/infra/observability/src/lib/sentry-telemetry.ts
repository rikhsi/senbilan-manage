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
          delete event.request.headers['Authorization'];
          delete event.request.headers['authorization'];
          delete event.request.headers['Cookie'];
          delete event.request.headers['cookie'];
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
