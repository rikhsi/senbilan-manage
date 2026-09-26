import { Injectable, inject } from '@angular/core';
import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppModalService } from '@senbilan/design-system/ui';
import {
  CatalogPicker,
  type CatalogPick,
  type CatalogPickKind,
  type CatalogPickOutcome,
} from '@senbilan/shared/ng';
import { CatalogPickerDrawerComponent } from './catalog-picker-drawer.component';

@Injectable()
class WebCatalogPicker extends CatalogPicker {
  private readonly modal = inject(AppModalService);

  pick(kind: CatalogPickKind, current: CatalogPick | null): Promise<CatalogPickOutcome> {
    const ref = this.modal.openDrawer<
      CatalogPickOutcome,
      { kind: CatalogPickKind; pick: CatalogPick | null }
    >(CatalogPickerDrawerComponent, {
      width: 'full',
      data: { kind, pick: current },
    });
    return firstValueFrom(ref.closed).then((result) => result ?? { applied: false, pick: null });
  }
}

export const provideCatalogPicker = (): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: CatalogPicker, useClass: WebCatalogPicker }]);
