import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IconRegistry } from './icon.registry';
import { type IconSize, isIconNode } from './icon.types';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Renders a registered icon as inline SVG.
 *
 * ```html
 * <app-icon name="users" size="md" />
 * <app-icon name="check" [label]="t('common.done')" />   <!-- announced to screen readers -->
 * ```
 * Without `label` the icon is decorative (`aria-hidden`).
 */
@Component({
  selector: 'app-icon',
  template: '',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'app-icon',
    '[class.app-icon--spin]': 'spin()',
    '[attr.data-size]': 'size()',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
  },
})
export class AppIconComponent {
  readonly name = input.required<string>();
  readonly size = input<IconSize>('md');
  readonly label = input<string>('');
  readonly spin = input(false);

  private readonly registry = inject(IconRegistry);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly definition = computed(() => this.registry.get(this.name()));

  constructor() {
    effect(() => {
      const definition = this.definition();
      const element = this.host.nativeElement;
      element.replaceChildren();

      if (!definition) {
        if (typeof ngDevMode !== 'undefined' && ngDevMode) {
          console.warn(`[app-icon] Unknown icon "${this.name()}". Register it in APP_ICONS.`);
        }
        return;
      }

      if (isIconNode(definition)) {
        const svg = this.renderer.createElement('svg', SVG_NS) as SVGElement;
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('focusable', 'false');
        for (const [tag, attrs] of definition) {
          const child = this.renderer.createElement(tag, SVG_NS) as SVGElement;
          for (const [key, value] of Object.entries(attrs)) {
            child.setAttribute(key, String(value));
          }
          svg.appendChild(child);
        }
        element.appendChild(svg);
      } else {
        // Custom SVG markup registered by developers at build time — trusted by construction.
        const html = this.sanitizer.bypassSecurityTrustHtml(definition);
        element.innerHTML = this.sanitizer.sanitize(1, html) ?? '';
      }
    });
  }
}
