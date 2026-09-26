/* eslint-disable max-lines -- content form wires steps, units, and field validation */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository } from '@senbilan/core/application';
import { AppDetailPageComponent, type BreadcrumbItem } from '@senbilan/design-system/layout';
import {
  AppButtonComponent,
  AppEmptyStateComponent,
  AppFormFieldComponent,
  AppInputDirective,
  AppSelectComponent,
  AppTagComponent,
  ToastService,
  type SelectLabels,
  type SelectOption,
} from '@senbilan/design-system/ui';
import { injectTranslocoReady, readLoadedTranslation } from '@senbilan/shared/i18n';
import { AppHtmlEditorComponent } from '@senbilan/vendors/ui';
import {
  CONTENT_FORM_STEPS_CREATE,
  CONTENT_FORM_STEPS_EDIT,
  CONTENT_TAG_MAX_COUNT,
  CONTENT_TAG_MAX_LENGTH,
  canDeleteContent,
  contentKindRequiresLinkAndCover,
  contentUnitFieldErrors,
  contentUnitHasErrors,
  draftFromContent,
  EMPTY_CONTENT_FORM,
  EMPTY_CONTENT_UNIT,
  isHttpUrl,
  normalizeContentTag,
  toCreateContentInput,
  toUnitInput,
  toUpdateContentInput,
  type ContentFormDraft,
  type ContentFormStep,
  type ContentUnitFieldErrors,
} from '../content-page/content-form.model';

@Component({
  selector: 'content-form-page',
  imports: [
    FormsModule,
    TranslocoPipe,
    AppDetailPageComponent,
    AppButtonComponent,
    AppEmptyStateComponent,
    AppFormFieldComponent,
    AppInputDirective,
    AppSelectComponent,
    AppTagComponent,
    AppHtmlEditorComponent,
  ],
  templateUrl: './content-form-page.component.html',
  styleUrl: './content-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentFormPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Empty for create; set for edit. */
  readonly id = input<string | undefined>(undefined);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal(false);
  protected readonly draft = signal<ContentFormDraft>({ ...EMPTY_CONTENT_FORM });
  protected readonly tagDraft = signal('');
  protected readonly stepIndex = signal(0);
  protected readonly titleTouched = signal(false);
  protected readonly detailsTouched = signal(false);
  protected readonly unitsAttempted = signal(false);
  protected readonly canDeleteUnits = signal(true);
  protected readonly originalUnitIndexes = signal<readonly number[]>([]);
  protected readonly tagMax = CONTENT_TAG_MAX_COUNT;

  protected readonly isEdit = computed(() => {
    const value = this.id();
    return typeof value === 'string' && value.length > 0;
  });

  protected readonly requiresLinkAndCover = computed(() =>
    contentKindRequiresLinkAndCover(this.draft().kind),
  );

  protected readonly tagSlotsLeft = computed(() =>
    Math.max(0, CONTENT_TAG_MAX_COUNT - this.draft().tags.length),
  );

  protected readonly tagError = computed(() => {
    this.i18nReady();
    if (this.tagDraft().trim().length > CONTENT_TAG_MAX_LENGTH) {
      return this.i18n.translate('content.tagTooLong', { max: CONTENT_TAG_MAX_LENGTH });
    }
    return '';
  });

  protected readonly steps = computed<readonly ContentFormStep[]>(() =>
    this.isEdit() ? CONTENT_FORM_STEPS_EDIT : CONTENT_FORM_STEPS_CREATE,
  );

  protected readonly step = computed(() => this.steps()[this.stepIndex()] ?? 'basics');
  protected readonly isFirstStep = computed(() => this.stepIndex() === 0);
  protected readonly isLastStep = computed(() => this.stepIndex() >= this.steps().length - 1);

  protected readonly titleError = computed(() => {
    this.i18nReady();
    if (!this.titleTouched()) {
      return '';
    }
    return this.draft().title.trim().length === 0
      ? this.i18n.translate('content.validationTitle')
      : '';
  });

  protected readonly urlError = computed(() => {
    this.i18nReady();
    if (!this.detailsTouched()) {
      return '';
    }
    const url = this.draft().url.trim();
    if (this.requiresLinkAndCover() && url.length === 0) {
      return this.i18n.translate('content.validationUrl');
    }
    if (url.length > 0 && !isHttpUrl(url)) {
      return this.i18n.translate('content.validationHttpUrl');
    }
    return '';
  });

  protected readonly coverError = computed(() => {
    this.i18nReady();
    if (!this.detailsTouched() || !this.requiresLinkAndCover()) {
      return '';
    }
    return this.draft().coverMediaId.trim().length === 0
      ? this.i18n.translate('content.validationCover')
      : '';
  });

  protected readonly unitErrors = computed<readonly ContentUnitFieldErrors[]>(() => {
    this.i18nReady();
    const messages = {
      title: this.i18n.translate('content.validationUnitTitle'),
      body: this.i18n.translate('content.validationUnitBody'),
      httpUrl: this.i18n.translate('content.validationHttpUrl'),
    };
    return this.draft().units.map((unit) => {
      const errors = contentUnitFieldErrors(unit, messages);
      if (this.unitsAttempted()) {
        return errors;
      }
      // Live-check optional URL as the user types; title/body wait for submit.
      return { title: '', body: '', url: errors.url };
    });
  });

  protected readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => {
    this.i18nReady();
    const edit = this.isEdit();
    const title = edit
      ? this.draft().title.trim() || readLoadedTranslation(this.i18n, 'content.editTitle')
      : this.i18n.translate('content.createTitle');
    return [
      { labelKey: 'nav.dashboard', route: '/dashboard' },
      { labelKey: 'nav.content', route: '/content' },
      ...(edit ? [{ label: title, route: `/content/${this.id()}` } as BreadcrumbItem] : []),
      {
        label: edit
          ? this.i18n.translate('content.editTitle')
          : this.i18n.translate('content.createTitle'),
      },
    ];
  });

  protected readonly stepItems = computed(() => {
    this.i18nReady();
    const mediaRequired = this.requiresLinkAndCover();
    return this.steps().map((id, index) => ({
      id,
      index,
      label: this.i18n.translate(`content.steps.${id}`),
      required: id === 'basics' || (id === 'details' && mediaRequired),
      current: index === this.stepIndex(),
      done: index < this.stepIndex(),
    }));
  });

  protected readonly selectLabels = computed<SelectLabels>(() => {
    this.i18nReady();
    return {
      placeholder: this.i18n.translate('common.all'),
      searchPlaceholder: this.i18n.translate('common.search'),
      noResults: this.i18n.translate('common.empty'),
      clear: this.i18n.translate('common.reset'),
      close: this.i18n.translate('common.close'),
      selectedCount: (count) => this.i18n.translate('common.selectedCount', { count }),
    };
  });

  protected readonly kindOptions = computed<readonly SelectOption<string>[]>(() => {
    this.i18nReady();
    return [
      { value: 'CONTENT_KIND_ARTICLE', label: this.i18n.translate('content.kindArticle') },
      { value: 'CONTENT_KIND_BOOK', label: this.i18n.translate('content.kindBook') },
      { value: 'CONTENT_KIND_PODCAST', label: this.i18n.translate('content.kindPodcast') },
      { value: 'CONTENT_KIND_VIDEO', label: this.i18n.translate('content.kindVideo') },
    ];
  });

  protected readonly languageOptions = computed<readonly SelectOption<string>[]>(() => {
    this.i18nReady();
    return [
      { value: 'LANGUAGE_RU', label: this.i18n.translate('content.languageRu') },
      { value: 'LANGUAGE_UZ', label: this.i18n.translate('content.languageUz') },
    ];
  });

  constructor() {
    effect(() => {
      const contentId = this.id();
      this.stepIndex.set(0);
      this.titleTouched.set(false);
      this.detailsTouched.set(false);
      this.unitsAttempted.set(false);
      this.tagDraft.set('');
      if (!contentId) {
        this.draft.set({ ...EMPTY_CONTENT_FORM, units: [] });
        this.canDeleteUnits.set(true);
        this.originalUnitIndexes.set([]);
        this.loading.set(false);
        this.error.set(false);
        return;
      }
      void this.load(contentId);
    });
  }

  protected patch<K extends keyof ContentFormDraft>(key: K, value: ContentFormDraft[K]): void {
    this.draft.update((current) => ({ ...current, [key]: value }));
  }

  protected onUrlChange(value: string): void {
    this.detailsTouched.set(true);
    this.patch('url', value);
  }

  protected onKind(value: string | null): void {
    this.patch('kind', value ?? 'CONTENT_KIND_ARTICLE');
  }

  protected onLanguage(value: string | null): void {
    this.patch('language', value ?? 'LANGUAGE_RU');
  }

  protected onTitleChange(value: string): void {
    this.titleTouched.set(true);
    this.patch('title', value);
  }

  protected onTagDraftChange(value: string): void {
    this.tagDraft.set(value);
  }

  protected addTag(): void {
    if (this.tagError() || this.tagSlotsLeft() === 0) {
      return;
    }
    const normalized = normalizeContentTag(this.tagDraft());
    if (!normalized) {
      return;
    }
    const current = this.draft().tags;
    if (current.includes(normalized)) {
      this.tagDraft.set('');
      return;
    }
    this.patch('tags', [...current, normalized]);
    this.tagDraft.set('');
  }

  protected removeTag(tag: string): void {
    this.patch(
      'tags',
      this.draft().tags.filter((item) => item !== tag),
    );
  }

  protected onTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  protected addUnit(): void {
    this.draft.update((current) => ({
      ...current,
      units: [...current.units, { ...EMPTY_CONTENT_UNIT }],
    }));
  }

  protected patchUnit(index: number, key: 'title' | 'body' | 'url', value: string): void {
    this.draft.update((current) => ({
      ...current,
      units: current.units.map((unit, unitIndex) =>
        unitIndex === index ? { ...unit, [key]: value } : unit,
      ),
    }));
  }

  protected canRemoveUnit(index: number): boolean {
    const unit = this.draft().units[index];
    if (!unit) {
      return false;
    }
    if (unit.serverIndex === undefined) {
      return true;
    }
    return this.canDeleteUnits();
  }

  protected removeUnit(index: number): void {
    if (!this.canRemoveUnit(index)) {
      return;
    }
    this.draft.update((current) => ({
      ...current,
      units: current.units.filter((_, unitIndex) => unitIndex !== index),
    }));
  }

  protected goBack(): void {
    this.stepIndex.update((index) => Math.max(0, index - 1));
  }

  protected goNext(): void {
    if (this.step() === 'basics' && !this.validateBasics()) {
      return;
    }
    if (this.step() === 'details' && !this.validateDetails()) {
      return;
    }
    if (this.step() === 'units' && !this.validateUnits()) {
      return;
    }
    if (this.isLastStep()) {
      void this.save();
      return;
    }
    this.stepIndex.update((index) => Math.min(this.steps().length - 1, index + 1));
  }

  protected async save(): Promise<void> {
    if (!this.validateBasics()) {
      this.stepIndex.set(0);
      return;
    }
    if (!this.validateDetails()) {
      const detailsIndex = this.steps().indexOf('details');
      this.stepIndex.set(detailsIndex >= 0 ? detailsIndex : 0);
      return;
    }
    if (!this.validateUnits()) {
      const unitsIndex = this.steps().indexOf('units');
      this.stepIndex.set(unitsIndex >= 0 ? unitsIndex : 0);
      return;
    }
    this.saving.set(true);
    try {
      if (this.isEdit()) {
        const contentId = this.id();
        if (!contentId) {
          return;
        }
        await this.catalog.updateContent(contentId, toUpdateContentInput(this.draft()));
        await this.syncUnits(contentId);
        this.toast.show({
          tone: 'success',
          title: this.i18n.translate('content.saved'),
        });
        void this.router.navigate(['/content', contentId]);
        return;
      }
      const created = await this.catalog.createContent(toCreateContentInput(this.draft()));
      this.toast.show({
        tone: 'success',
        title: this.i18n.translate('content.created'),
      });
      void this.router.navigate(['/content', created.id]);
    } catch {
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('content.saveError'),
        message: this.i18n.translate('content.errorHint'),
      });
    } finally {
      this.saving.set(false);
    }
  }

  private validateBasics(): boolean {
    this.titleTouched.set(true);
    if (this.draft().title.trim().length === 0) {
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('content.validationTitle'),
      });
      return false;
    }
    return true;
  }

  private validateDetails(): boolean {
    this.detailsTouched.set(true);
    const draft = this.draft();
    const url = draft.url.trim();
    if (this.requiresLinkAndCover()) {
      if (url.length === 0 || !isHttpUrl(url)) {
        return false;
      }
      if (draft.coverMediaId.trim().length === 0) {
        return false;
      }
    } else if (url.length > 0 && !isHttpUrl(url)) {
      return false;
    }
    return true;
  }

  private validateUnits(): boolean {
    this.unitsAttempted.set(true);
    const messages = {
      title: this.i18n.translate('content.validationUnitTitle'),
      body: this.i18n.translate('content.validationUnitBody'),
      httpUrl: this.i18n.translate('content.validationHttpUrl'),
    };
    return !this.draft().units.some((unit) =>
      contentUnitHasErrors(contentUnitFieldErrors(unit, messages)),
    );
  }

  private async syncUnits(contentId: string): Promise<void> {
    const units = this.draft().units;
    for (const unit of units) {
      if (unit.serverIndex !== undefined) {
        await this.catalog.updateContentUnit(contentId, unit.serverIndex, toUnitInput(unit));
      }
    }
    if (this.canDeleteUnits()) {
      const kept = new Set(
        units
          .map((unit) => unit.serverIndex)
          .filter((index): index is number => index !== undefined),
      );
      for (const index of [...this.originalUnitIndexes()].sort((left, right) => right - left)) {
        if (!kept.has(index)) {
          await this.catalog.deleteContentUnit(contentId, index);
        }
      }
    }
    for (const unit of units) {
      if (unit.serverIndex === undefined) {
        await this.catalog.addContentUnit(contentId, toUnitInput(unit));
      }
    }
  }

  private async load(contentId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const detail = await this.catalog.getContent(contentId);
      this.draft.set(draftFromContent(detail));
      this.canDeleteUnits.set(canDeleteContent(detail));
      this.originalUnitIndexes.set(detail.units.map((unit) => unit.index));
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
