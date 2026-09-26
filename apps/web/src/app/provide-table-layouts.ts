import {
  Injectable,
  inject,
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TableLayoutCatalog } from '@senbilan/shared/ng';
import { type TableLayoutDefinition } from '@senbilan/shared/util';

type LayoutModules = {
  users: typeof import('@senbilan/features/users');
  couples: typeof import('@senbilan/features/couples');
  content: typeof import('@senbilan/features/content');
  broadcasts: typeof import('@senbilan/features/broadcasts');
  media: typeof import('@senbilan/features/media');
};

const loadColumnLabels = (modules: LayoutModules, i18n: TranslocoService): Promise<void[]> =>
  Promise.all([
    modules.users.loadUsersI18n(i18n),
    modules.couples.loadCouplesI18n(i18n),
    modules.content.loadContentI18n(i18n),
    modules.broadcasts.loadBroadcastsI18n(i18n),
    modules.media.loadMediaI18n(i18n),
  ]);

@Injectable()
class WebTableLayoutCatalog extends TableLayoutCatalog {
  private readonly i18n = inject(TranslocoService);
  private modules: Promise<LayoutModules> | null = null;
  private pending: Promise<readonly TableLayoutDefinition[]> | null = null;

  load(): Promise<readonly TableLayoutDefinition[]> {
    this.pending ??= this.fetch();
    return this.pending;
  }

  async refreshTranslations(): Promise<void> {
    const modules = await this.featureModules();
    await loadColumnLabels(modules, this.i18n);
  }

  private async fetch(): Promise<readonly TableLayoutDefinition[]> {
    const modules = await this.featureModules();
    await loadColumnLabels(modules, this.i18n);
    return [
      modules.users.usersTableLayout(),
      modules.couples.couplesTableLayout(),
      modules.content.contentTableLayout(),
      modules.broadcasts.broadcastsTableLayout(),
      modules.media.mediaTableLayout(),
    ];
  }

  private featureModules(): Promise<LayoutModules> {
    this.modules ??= Promise.all([
      import('@senbilan/features/users'),
      import('@senbilan/features/couples'),
      import('@senbilan/features/content'),
      import('@senbilan/features/broadcasts'),
      import('@senbilan/features/media'),
    ]).then(([users, couples, content, broadcasts, media]) => ({
      users,
      couples,
      content,
      broadcasts,
      media,
    }));
    return this.modules;
  }
}

export const provideTableLayouts = (): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: TableLayoutCatalog, useClass: WebTableLayoutCatalog }]);
