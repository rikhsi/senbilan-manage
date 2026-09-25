export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Readonly<Record<string, string | number | boolean | null | undefined>>;

/** Structured logger. Implementations decide the sink (console, Sentry breadcrumbs…). */
export abstract class Logger {
  abstract debug(message: string, context?: LogContext): void;
  abstract info(message: string, context?: LogContext): void;
  abstract warn(message: string, context?: LogContext): void;
  abstract error(message: string, error?: unknown, context?: LogContext): void;
}

export abstract class Telemetry {
  abstract captureException(error: unknown, context?: LogContext): void;
  abstract addBreadcrumb(message: string, context?: LogContext): void;
  abstract setUser(user: { id: string } | null): void;
  abstract startSpan<T>(name: string, fn: () => Promise<T>): Promise<T>;
}
