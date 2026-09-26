export const TONES = [
  'neutral',
  'primary',
  'secondary',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
] as const;
export type Tone = (typeof TONES)[number];
