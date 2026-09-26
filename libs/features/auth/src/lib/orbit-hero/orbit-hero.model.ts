import { type AppIconName } from '@senbilan/design-system/icons';

export interface OrbitSatellite {
  readonly icon: AppIconName;
  readonly ring: 0 | 1;
  readonly angle: number;
}

export interface FloatingHeart {
  readonly left: string;
  readonly delay: string;
  readonly duration: string;
  readonly size: 'sm' | 'md';
}

export const ORBIT_IMAGE_SRC = '/assets/auth/couple_heart.png';

export const ORBIT_SATELLITES: readonly OrbitSatellite[] = [
  { icon: 'heart', ring: 0, angle: -90 },
  { icon: 'mail', ring: 0, angle: 30 },
  { icon: 'calendar', ring: 0, angle: 150 },
  { icon: 'users', ring: 1, angle: -45 },
  { icon: 'shield', ring: 1, angle: 45 },
  { icon: 'bell', ring: 1, angle: 135 },
  { icon: 'layout-dashboard', ring: 1, angle: -135 },
];

export const ORBIT_HEARTS: readonly FloatingHeart[] = [
  { left: '12%', delay: '0s', duration: '7s', size: 'md' },
  { left: '28%', delay: '1.4s', duration: '8s', size: 'sm' },
  { left: '55%', delay: '0.6s', duration: '6.5s', size: 'md' },
  { left: '72%', delay: '2.1s', duration: '7.5s', size: 'sm' },
  { left: '88%', delay: '1s', duration: '9s', size: 'md' },
];
