import { computed, Injectable, signal } from '@angular/core';
import { type Tone } from '../badge/badge.types';

export type ToastTone = Extract<Tone, 'neutral' | 'success' | 'warning' | 'danger' | 'info'>;

export interface ToastAction {
  readonly label: string;
  readonly run: () => void;
}

export interface ToastInput {
  readonly title: string;
  readonly message?: string;
  readonly tone?: ToastTone;
  /** ms; 0 = sticky until dismissed. Defaults: 4000, danger 8000. */
  readonly duration?: number;
  readonly action?: ToastAction;
}

export interface Toast extends Required<Omit<ToastInput, 'action' | 'message'>> {
  readonly id: number;
  readonly message: string;
  readonly action: ToastAction | null;
}

/**
 * Toast queue (signals). Rendered by AppToastContainerComponent placed once in the shell.
 * Keep it free of i18n: callers pass translated strings.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private static nextId = 1;
  private readonly items = signal<readonly Toast[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  readonly toasts = computed(() => this.items());

  show(input: ToastInput): number {
    const tone = input.tone ?? 'neutral';
    const toast: Toast = {
      id: ToastService.nextId++,
      title: input.title,
      message: input.message ?? '',
      tone,
      duration: input.duration ?? (tone === 'danger' ? 8000 : 4000),
      action: input.action ?? null,
    };
    this.items.update((list) => [...list.slice(-4), toast]);
    if (toast.duration > 0) {
      this.timers.set(
        toast.id,
        setTimeout(() => this.dismiss(toast.id), toast.duration),
      );
    }
    return toast.id;
  }

  success(title: string, message?: string): number {
    return this.show({ title, tone: 'success', ...(message !== undefined ? { message } : {}) });
  }
  error(title: string, message?: string): number {
    return this.show({ title, tone: 'danger', ...(message !== undefined ? { message } : {}) });
  }
  info(title: string, message?: string): number {
    return this.show({ title, tone: 'info', ...(message !== undefined ? { message } : {}) });
  }
  warning(title: string, message?: string): number {
    return this.show({ title, tone: 'warning', ...(message !== undefined ? { message } : {}) });
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.items.update((list) => list.filter((toast) => toast.id !== id));
  }

  clear(): void {
    for (const id of [...this.timers.keys()]) {
      this.dismiss(id);
    }
    this.items.set([]);
  }
}
