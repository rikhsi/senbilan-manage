import { Directive } from '@angular/core';
import { TuiHintDirective } from '@taiga-ui/core';

/**
 * Tooltip = Taiga `tuiHint` behind our own name so features never import Taiga.
 *
 * ```html
 * <button app-icon-button icon="trash" [appTooltip]="t('common.delete')"></button>
 * ```
 * Note: tooltips are supplementary. Icon-only controls still need `label`/aria-label.
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
