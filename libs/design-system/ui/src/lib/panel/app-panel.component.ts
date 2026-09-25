import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PanelPadding = 'none' | 'sm' | 'md' | 'lg';

/** Flat panel for dense admin zones (tables, filter bars). Prefer over Card when no elevation needed. */
@Component({
  selector: 'app-panel',
  template: `<ng-content />`,
  styleUrl: './app-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-panel',
    '[attr.data-padding]': 'padding()',
    '[attr.data-bordered]': 'bordered() || null',
  },
})
export class AppPanelComponent {
  readonly padding = input<PanelPadding>('md');
  readonly bordered = input(true);
}
