import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="app-page-header">
      <div class="app-page-header__text">
        @if (eyebrow()) {
          <p class="app-page-header__eyebrow">{{ eyebrow() }}</p>
        }
        <h1 class="app-page-header__title">{{ title() }}</h1>
        @if (description()) {
          <p class="app-page-header__description">{{ description() }}</p>
        }
      </div>
      <div class="app-page-header__actions">
        <ng-content select="[actions]" />
      </div>
    </header>
  `,
  styleUrl: './app-page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-page-header-host' },
})
export class AppPageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly eyebrow = input('');
}
