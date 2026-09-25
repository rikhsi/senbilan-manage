import { BreakpointObserver } from '@angular/cdk/layout';
import { computed, inject, Injectable, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BREAKPOINTS, type BreakpointName } from '@senbilan/design-system/tokens';

export type ViewportKind = 'mobile' | 'tablet' | 'desktop';

/**
 * Single source of truth for "which layout are we in". Mirrors the SCSS
 * breakpoints so TS and CSS never disagree.
 *  - mobile  : < md (768)
 *  - tablet  : md ..< lg (1024)
 *  - desktop : >= lg
 */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly observer = inject(BreakpointObserver);

  readonly matches: Readonly<Record<BreakpointName, Signal<boolean>>> = {
    sm: this.observeMin('sm'),
    md: this.observeMin('md'),
    lg: this.observeMin('lg'),
    xl: this.observeMin('xl'),
    '2xl': this.observeMin('2xl'),
  };

  readonly kind = computed<ViewportKind>(() => {
    if (this.matches.lg()) {
      return 'desktop';
    }
    return this.matches.md() ? 'tablet' : 'mobile';
  });

  readonly isMobile = computed(() => this.kind() === 'mobile');
  readonly isTablet = computed(() => this.kind() === 'tablet');
  readonly isDesktop = computed(() => this.kind() === 'desktop');
  /** Mobile or tablet — compact navigation (bottom nav / drawer). */
  readonly isCompact = computed(() => !this.isDesktop());

  readonly canHover = toSignal(
    this.observer.observe('(hover: hover) and (pointer: fine)').pipe(map((state) => state.matches)),
    { initialValue: true },
  );

  private observeMin(name: BreakpointName): Signal<boolean> {
    const query = `(min-width: ${BREAKPOINTS[name]}px)`;
    return toSignal(this.observer.observe(query).pipe(map((state) => state.matches)), {
      initialValue: this.observer.isMatched(query),
    });
  }
}
