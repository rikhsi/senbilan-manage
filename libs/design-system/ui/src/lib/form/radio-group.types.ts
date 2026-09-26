import { type AppIconName } from '@senbilan/design-system/icons';
import { type LocaleFlagId } from '../locale/locale-toggle.types';

export interface RadioOption<T extends string = string> {
  readonly value: T;
  readonly label: string;
  readonly description?: string;
  readonly icon?: AppIconName;
  /** Country flag instead of (or in addition to) an icon — used for language pickers. */
  readonly flag?: LocaleFlagId;
  readonly disabled?: boolean;
}
