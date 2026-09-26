import { type AppIconName } from '@senbilan/design-system/icons';
import { type ToastTone } from './toast.service';

export const TOAST_TONE_ICONS: Readonly<Record<ToastTone, AppIconName>> = {
  neutral: 'info',
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'circle-alert',
};
