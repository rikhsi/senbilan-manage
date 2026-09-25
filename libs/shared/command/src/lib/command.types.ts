import { type PermissionKey } from '@senbilan/core/domain';

export interface Command {
  readonly id: string;
  readonly label: string;
  /** Optional Transloco key; when set, UI should prefer translating `labelKey`. */
  readonly labelKey?: string;
  readonly shortcut?: string;
  readonly group?: string;
  readonly icon?: string;
  readonly permission?: PermissionKey;
  readonly keywords?: readonly string[];
  readonly action: () => void | Promise<void>;
}

export type CommandRegistration = Omit<Command, 'action'> & {
  readonly action: Command['action'];
};
