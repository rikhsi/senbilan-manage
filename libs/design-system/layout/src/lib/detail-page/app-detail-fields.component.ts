import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppSkeletonComponent } from '@senbilan/design-system/ui';
import { type DetailField } from './detail-page.types';

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

@Component({
  selector: 'app-detail-fields',
  imports: [AppSkeletonComponent],
  template: `
    @if (loading()) {
      <div class="app-detail-fields" aria-busy="true">
        @for (row of skeletonRows; track row) {
          <div class="app-detail-fields__item">
            <app-skeleton width="55%" />
            <app-skeleton [width]="row % 2 === 0 ? '70%' : '40%'" />
          </div>
        }
      </div>
    } @else {
      <dl class="app-detail-fields">
        @for (field of fields(); track field.label) {
          <div class="app-detail-fields__item">
            <dt class="app-detail-fields__label">{{ field.label }}</dt>
            <dd class="app-detail-fields__value">{{ field.value }}</dd>
          </div>
        }
      </dl>
    }
  `,
  styleUrl: './app-detail-fields.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-detail-fields-host' },
})
export class AppDetailFieldsComponent {
  readonly fields = input.required<readonly DetailField[]>();
  readonly loading = input(false);

  protected readonly skeletonRows = SKELETON_ROWS;
}
