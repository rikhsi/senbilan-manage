import { computed, Injectable, signal } from '@angular/core';
import { type PermissionKey } from '@senbilan/core/domain';
import { type Command } from './command.types';

@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  private readonly commands = signal<readonly Command[]>([]);
  private readonly openState = signal(false);
  private readonly queryState = signal('');

  readonly isOpen = this.openState.asReadonly();
  readonly query = this.queryState.asReadonly();

  readonly all = computed(() => this.commands());

  register(command: Command): () => void {
    this.commands.update((list) => {
      const without = list.filter((item) => item.id !== command.id);
      return [...without, command];
    });
    return () => this.unregister(command.id);
  }

  registerMany(commands: readonly Command[]): () => void {
    const disposers = commands.map((command) => this.register(command));
    return () => {
      for (const dispose of disposers) {
        dispose();
      }
    };
  }

  unregister(id: string): void {
    this.commands.update((list) => list.filter((item) => item.id !== id));
  }

  open(): void {
    this.openState.set(true);
  }

  close(): void {
    this.openState.set(false);
    this.queryState.set('');
  }

  toggle(): void {
    if (this.openState()) {
      this.close();
    } else {
      this.open();
    }
  }

  setQuery(value: string): void {
    this.queryState.set(value);
  }

  /**
   * Filters by query text and optional permission predicate.
   * When `can` is omitted, permission-gated commands are still returned
   * (the UI / caller decides whether to hide them).
   */
  filtered(can?: (permission: PermissionKey) => boolean): Command[] {
    const q = this.queryState().trim().toLowerCase();
    return this.commands().filter((command) => {
      if (command.permission !== undefined && can && !can(command.permission)) {
        return false;
      }
      if (!q) {
        return true;
      }
      const haystack = [command.label, command.labelKey, ...(command.keywords ?? [])]
        .filter((part): part is string => part !== undefined && part.length > 0)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  async run(id: string): Promise<void> {
    const command = this.commands().find((item) => item.id === id);
    if (!command) {
      return;
    }
    this.close();
    await command.action();
  }
}
