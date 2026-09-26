import { type NotificationKind } from '@senbilan/core/domain';
import { type AppIconName } from '@senbilan/design-system/icons';
import { type Tone } from '@senbilan/design-system/ui';

export const NOTIFICATION_KIND_TONE: Record<NotificationKind, Tone> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

export const NOTIFICATION_KIND_ICON: Record<NotificationKind, AppIconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'circle-alert',
};
