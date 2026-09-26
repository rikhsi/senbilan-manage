import { type AppIconName } from '@senbilan/design-system/icons';

export interface RadioOption<T extends string = string> {
  readonly value: T;
  readonly label: string;
  readonly description?: string;
  readonly icon?: AppIconName;
  readonly disabled?: boolean;
}
