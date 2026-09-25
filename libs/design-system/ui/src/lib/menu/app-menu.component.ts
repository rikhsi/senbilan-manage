import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, Directive, input } from '@angular/core';
import { type AppIconName, AppIconComponent } from '@senbilan/design-system/icons';

/**
 * Dropdown menu built on CDK Menu (roving focus, typeahead, aria-menu roles).
 *
 * ```html
 * <button app-icon-button icon="ellipsis-vertical" [label]="t('common.actions')" [appMenuTriggerFor]="menu"></button>
 * <ng-template #menu>
 *   <app-menu>
 *     <button appMenuItem icon="pencil" (click)="edit()">{{ t('common.edit') }}</button>
 *     <app-menu-divider />
 *     <button appMenuItem icon="trash" tone="danger" (click)="remove()">{{ t('common.delete') }}</button>
 *   </app-menu>
 * </ng-template>
 * ```
 */
@Component({
  selector: 'app-menu',
  imports: [CdkMenu],
  template: `<div cdkMenu class="app-menu__list" [attr.aria-label]="ariaLabel() || null">
    <ng-content />
  </div>`,
  styleUrl: './app-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-menu' },
})
export class AppMenuComponent {
  readonly ariaLabel = input('');
}

@Component({
  selector: 'button[appMenuItem], a[appMenuItem]',
  imports: [AppIconComponent],
  hostDirectives: [
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  template: `
    @if (icon(); as name) {
      <app-icon class="app-menu-item__icon" [name]="name" size="sm" />
    }
    <span class="app-menu-item__label"><ng-content /></span>
    @if (shortcut()) {
      <kbd class="app-menu-item__shortcut">{{ shortcut() }}</kbd>
    }
  `,
  styleUrl: './app-menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-menu-item',
    '[attr.data-tone]': 'tone()',
    '[attr.type]': 'isButton ? "button" : null',
  },
})
export class AppMenuItemComponent {
  readonly icon = input<AppIconName | null>(null);
  readonly tone = input<'default' | 'danger'>('default');
  readonly shortcut = input('');
  protected readonly isButton = true;
}

@Component({
  selector: 'app-menu-divider',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-menu-divider', role: 'separator' },
  styles: `
    :host {
      display: block;
      height: 1px;
      margin: var(--app-space-1) 0;
      background: var(--app-color-divider);
    }
  `,
})
export class AppMenuDividerComponent {}

/** Trigger alias over CdkMenuTrigger; keeps CDK out of feature templates. */
@Directive({
  selector: '[appMenuTriggerFor]',
  hostDirectives: [
    {
      directive: CdkMenuTrigger,
      inputs: ['cdkMenuTriggerFor: appMenuTriggerFor', 'cdkMenuPosition: appMenuPosition'],
    },
  ],
  host: { class: 'app-menu-trigger' },
})
export class AppMenuTriggerDirective {}
