import { type AppIconName } from '@senbilan/design-system/icons';

export interface TabItem<TId extends string = string> {
  readonly id: TId;
  readonly label: string;
  readonly icon?: AppIconName;
  readonly badge?: string | number;
  readonly disabled?: boolean;
}
