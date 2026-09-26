import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { type Translation, type TranslocoLoader } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

/**
 * Loads root locale files from `assets/i18n/{lang}.json` and feature scopes
 * from `assets/i18n/{scope}.{lang}.json` (e.g. `common.ru.json`).
 *
 * Eager scopes (`common`, `auth`, …) live in `apps/<app>/public/assets/i18n/`.
 * Feature screens register colocated JSON with `provideInlineTranslocoScope`
 * so titles resolve before a `transloco` pipe is in the template.
 */
@Injectable()
export class AssetsTranslocoLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string): Promise<Translation> {
    // Scoped requests arrive as `{scope}/{lang}` when using path-style scopes,
    // or as `{lang}` for the active root language.
    const slash = lang.indexOf('/');
    if (slash >= 0) {
      const scope = lang.slice(0, slash);
      const locale = lang.slice(slash + 1);
      return this.fetch(`assets/i18n/${scope}.${locale}.json`);
    }
    return this.fetch(`assets/i18n/${lang}.json`);
  }

  private fetch(path: string): Promise<Translation> {
    return firstValueFrom(this.http.get<Translation>(path));
  }
}
