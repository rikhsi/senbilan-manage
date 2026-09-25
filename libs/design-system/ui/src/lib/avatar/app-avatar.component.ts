import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarRing = 'none' | 'primary' | 'secondary';

const TINT_COUNT = 5;

/**
 * User avatar with initials fallback and a deterministic palette tint per name.
 * Ring colour code: me = primary, others = secondary.
 */
@Component({
  selector: 'app-avatar',
  template: `
    @if (src() && !failed()) {
      <img
        class="app-avatar__image"
        [src]="src()"
        [alt]="name()"
        loading="lazy"
        (error)="failed.set(true)"
      />
    } @else {
      <span class="app-avatar__initials" aria-hidden="true">{{ initials() }}</span>
    }
  `,
  styleUrl: './app-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-avatar',
    role: 'img',
    '[attr.aria-label]': 'name()',
    '[attr.data-size]': 'size()',
    '[attr.data-ring]': 'ring()',
    '[attr.data-tint]': 'tint()',
  },
})
export class AppAvatarComponent {
  readonly name = input.required<string>();
  readonly src = input<string | null>(null);
  readonly size = input<AvatarSize>('md');
  readonly ring = input<AvatarRing>('none');

  protected readonly failed = signal(false);

  protected readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(''),
  );

  /** Stable tint index (1..5) from the name so a person always gets the same colour. */
  protected readonly tint = computed(() => {
    let hash = 0;
    for (const char of this.name()) {
      hash = (hash * 31 + char.charCodeAt(0)) | 0;
    }
    return (Math.abs(hash) % TINT_COUNT) + 1;
  });
}
