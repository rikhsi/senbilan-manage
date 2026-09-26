// ---- setup -------------------------------------------------------------------
export { provideDesignSystem } from './lib/provide-design-system';
export { ViewportService, type ViewportKind } from './lib/viewport/viewport.service';

// ---- primitives ---------------------------------------------------------------
export { AppButtonComponent } from './lib/button/app-button.component';
export {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  type ButtonSize,
  type ButtonVariant,
  type IconButtonVariant,
} from './lib/button/button.types';
export { AppIconButtonComponent } from './lib/button/app-icon-button.component';
export { AppCardComponent } from './lib/card/app-card.component';
export { type CardPadding, type CardVariant } from './lib/card/card.types';
export { AppPanelComponent } from './lib/panel/app-panel.component';
export { type PanelPadding } from './lib/panel/panel.types';
export { AppBadgeComponent } from './lib/badge/app-badge.component';
export { TONES, type Tone } from './lib/badge/badge.types';
export { AppTagComponent } from './lib/tag/app-tag.component';
export { AppStatusComponent } from './lib/status/app-status.component';
export { AppAvatarComponent } from './lib/avatar/app-avatar.component';
export { type AvatarRing, type AvatarSize } from './lib/avatar/avatar.types';
export { AppSkeletonComponent } from './lib/skeleton/app-skeleton.component';
export { type SkeletonShape } from './lib/skeleton/skeleton.types';
export { AppTabsComponent } from './lib/tabs/app-tabs.component';
export { type TabItem } from './lib/tabs/tabs.types';
export { AppStatCardComponent } from './lib/stat/app-stat-card.component';

// ---- states -------------------------------------------------------------------
export {
  AppEmptyStateComponent,
  type EmptyStateIcon,
  type EmptyStateSize,
  type EmptyStateTone,
} from './lib/states/app-empty-state.component';
export { AppErrorStateComponent } from './lib/states/app-error-state.component';
export { AppLoadingStateComponent } from './lib/states/app-loading-state.component';

// ---- forms --------------------------------------------------------------------
export { APP_CONTROL, type AppControl } from './lib/form/app-control';
export { AppFormFieldComponent } from './lib/form/app-form-field.component';
export { AppInputDirective } from './lib/form/app-input.directive';
export { AppCheckboxComponent } from './lib/form/app-checkbox.component';
export { AppSwitchComponent } from './lib/form/app-switch.component';
export { AppRadioGroupComponent } from './lib/form/app-radio-group.component';
export { type RadioOption } from './lib/form/radio-group.types';
export { AppSelectComponent } from './lib/select/app-select.component';
export { type SelectLabels, type SelectOption } from './lib/select/select.types';
export { AppSearchInputComponent } from './lib/search/app-search-input.component';
export { AppFilterBarComponent } from './lib/filter/app-filter-bar.component';
export { AppListFiltersComponent } from './lib/filter/app-list-filters.component';
export { type ListFiltersLabels } from './lib/filter/list-filters.types';

// ---- data ---------------------------------------------------------------------
export { AppDataTableComponent } from './lib/table/app-data-table.component';
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
  type DataTableMode,
  nextSort,
  type RowContext,
  type SortDirection,
  type SortState,
} from './lib/table/data-table.types';
export { AppPaginationComponent } from './lib/pagination/app-pagination.component';
export { type PaginationLabels } from './lib/pagination/pagination.types';
export { AppChartComponent } from './lib/chart/app-chart.component';
export { type AppChartType, type ChartPalette, readChartPalette } from './lib/chart/chart.types';

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
export {
  AppMenuComponent,
  AppMenuDividerComponent,
  AppMenuItemComponent,
  AppMenuTriggerDirective,
} from './lib/menu/app-menu.component';

// ---- preferences ------------------------------------------------------------
export { AppThemeToggleComponent } from './lib/theme/app-theme-toggle.component';
export { APP_THEME_MODE, type AppThemeModeBridge } from './lib/theme/theme-mode.bridge';
export { AppLocaleToggleComponent } from './lib/locale/app-locale-toggle.component';
