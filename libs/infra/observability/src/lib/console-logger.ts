import { Injectable } from '@angular/core';
import { Logger, type LogContext } from '@senbilan/core/application';

@Injectable()
export class ConsoleLogger extends Logger {
  override debug(message: string, context?: LogContext): void {
    console.debug(message, context ?? {});
  }

  override info(message: string, context?: LogContext): void {
    console.info(message, context ?? {});
  }

  override warn(message: string, context?: LogContext): void {
    console.warn(message, context ?? {});
  }

  override error(message: string, error?: unknown, context?: LogContext): void {
    console.error(message, error ?? '', context ?? {});
  }
}
