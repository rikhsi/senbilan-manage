import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';
import {
  ORBIT_HEARTS,
  ORBIT_IMAGE_SRC,
  ORBIT_SATELLITES,
  type OrbitSatellite,
} from './orbit-hero.model';

/**
 * Couple portrait with feature icons orbiting on two rings,
 * plus floating hearts — shared visual language with mobile auth.
 */
@Component({
  selector: 'auth-orbit-hero',
  imports: [AppIconComponent],
  templateUrl: './orbit-hero.component.html',
  styleUrl: './orbit-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrbitHeroComponent {
  protected readonly imageSrc = ORBIT_IMAGE_SRC;
  protected readonly satellites = ORBIT_SATELLITES;
  protected readonly hearts = ORBIT_HEARTS;

  protected innerSatellites(): OrbitSatellite[] {
    return this.satellites.filter((s) => s.ring === 0);
  }

  protected outerSatellites(): OrbitSatellite[] {
    return this.satellites.filter((s) => s.ring === 1);
  }
}
