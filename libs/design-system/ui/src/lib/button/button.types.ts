export const BUTTON_VARIANTS = [
  'primary',
  'secondary',
  'ghost',
  'surface',
  'danger',
  'link',
] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

export type IconButtonVariant = 'ghost' | 'secondary' | 'primary' | 'danger';
