// ---- setup -------------------------------------------------------------------
export { provideDesignSystem } from './lib/provide-design-system';
export { ViewportService, type ViewportKind } from './lib/viewport/viewport.service';

// ---- primitives ---------------------------------------------------------------
export {
  AppButtonComponent,
  type ButtonSize,
  type ButtonVariant,
} from './lib/button/app-button.component';
export {
  AppIconButtonComponent,
  type IconButtonVariant,
} from './lib/button/app-icon-button.component';
export {
  AppCardComponent,
  type CardPadding,
  type CardVariant,
} from './lib/card/app-card.component';
export { AppPanelComponent, type PanelPadding } from './lib/panel/app-panel.component';
export { AppBadgeComponent, TONES, type Tone } from './lib/badge/app-badge.component';
export { AppTagComponent } from './lib/tag/app-tag.component';
export { AppStatusComponent } from './lib/status/app-status.component';
export {
  AppAvatarComponent,
  type AvatarRing,
  type AvatarSize,
} from './lib/avatar/app-avatar.component';
export { AppSkeletonComponent, type SkeletonShape } from './lib/skeleton/app-skeleton.component';
export { AppTabsComponent, type TabItem } from './lib/tabs/app-tabs.component';
export { AppStatCardComponent } from './lib/stat/app-stat-card.component';

// ---- states -------------------------------------------------------------------
export { AppEmptyStateComponent } from './lib/states/app-empty-state.component';
export { AppErrorStateComponent } from './lib/states/app-error-state.component';
export { AppLoadingStateComponent } from './lib/states/app-loading-state.component';

// ---- forms --------------------------------------------------------------------
export { APP_CONTROL, type AppControl } from './lib/form/app-control';
export { AppFormFieldComponent } from './lib/form/app-form-field.component';
export { AppInputDirective } from './lib/form/app-input.directive';
export { AppCheckboxComponent } from './lib/form/app-checkbox.component';
export { AppSwitchComponent } from './lib/form/app-switch.component';
export { AppRadioGroupComponent, type RadioOption } from './lib/form/app-radio-group.component';
export {
  AppSelectComponent,
  type SelectLabels,
  type SelectOption,
} from './lib/select/app-select.component';
export { AppSearchInputComponent } from './lib/search/app-search-input.component';
export { AppFilterBarComponent } from './lib/filter/app-filter-bar.component';

// ---- data ---------------------------------------------------------------------
export { AppDataTableComponent, type DataTableMode } from './lib/table/app-data-table.component';
export {
  AppCellDirective,
  AppRowActionsDirective,
  AppRowExpansionDirective,
} from './lib/table/data-table.directives';
export {
  type CellContext,
  type ColumnAlign,
  type ColumnDef,
  compareValues,
  type DataTableLabels,
  nextSort,
  type RowContext,
  type SortDirection,
  type SortState,
} from './lib/table/data-table.types';
export {
  AppPaginationComponent,
  type PaginationLabels,
} from './lib/pagination/app-pagination.component';
export {
  AppChartComponent,
  type AppChartType,
  type ChartPalette,
  readChartPalette,
} from './lib/chart/app-chart.component';

// ---- overlays -----------------------------------------------------------------
export {
  AppModalService,
  type DrawerOptions,
  type ModalOptions,
  type ModalSize,
} from './lib/overlay/app-modal.service';
export { AppDialogShellComponent } from './lib/overlay/app-dialog-shell.component';
export {
  AppConfirmDialogService,
  type ConfirmDialogOptions,
} from './lib/overlay/app-confirm-dialog.service';
export {
  AppActionSheetComponent,
  AppActionSheetService,
  AppSheetService,
  type ActionSheetData,
  type ActionSheetItem,
} from './lib/sheet/app-sheet.service';
export {
  ToastService,
  type Toast,
  type ToastAction,
  type ToastInput,
  type ToastTone,
} from './lib/toast/toast.service';
export { AppToastContainerComponent } from './lib/toast/app-toast-container.component';
export { AppTooltipDirective } from './lib/tooltip/app-tooltip.directive';
export {
  AppMenuComponent,
  AppMenuDividerComponent,
  AppMenuItemComponent,
  AppMenuTriggerDirective,
} from './lib/menu/app-menu.component';
