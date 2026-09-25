import { Directive } from '@angular/core';
import { TuiHintDirective } from '@taiga-ui/core';

/**
 * Tooltip = Taiga `tuiHint` behind our own name.
 * Lives in `@senbilan/vendors/ui` (vendor wrapper), not the pure design system.
 *
 * ```html
 * <button app-icon-button icon="trash" [appTooltip]="t('common.delete')"></button>
 * ```
 * If a vendor control needs no API/behavior customization, import it directly
 * in `apps/*` instead of adding a wrapper here.
 */
@Directive({
  selector: '[appTooltip]',
  hostDirectives: [
    {
      directive: TuiHintDirective,
      inputs: ['tuiHint: appTooltip', 'tuiHintAppearance: appTooltipAppearance'],
    },
  ],
})
export class AppTooltipDirective {}
