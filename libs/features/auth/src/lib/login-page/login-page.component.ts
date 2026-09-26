import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  AppButtonComponent,
  AppFormFieldComponent,
  AppIconButtonComponent,
  AppInputDirective,
  AppLocaleToggleComponent,
  AppThemeToggleComponent,
  ToastService,
} from '@senbilan/design-system/ui';
import { AuthStore } from '@senbilan/shared/auth';
import { form, FormField, required, submit } from '@senbilan/shared/ng';
import { NgxMaskDirective } from 'ngx-mask';
import { OrbitHeroComponent } from '../orbit-hero/orbit-hero.component';
import {
  isCompleteUzPhone,
  LOGIN_DEMO_MODEL,
  toE164Phone,
  UZ_PHONE_MASK,
  UZ_PHONE_PREFIX,
} from './login.model';

@Component({
  selector: 'auth-login-page',
  imports: [
    FormField,
    TranslocoPipe,
    AppButtonComponent,
    AppFormFieldComponent,
    AppIconButtonComponent,
    AppInputDirective,
    AppLocaleToggleComponent,
    AppThemeToggleComponent,
    OrbitHeroComponent,
    NgxMaskDirective,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslocoService);
  private readonly auth = inject(AuthStore);
  private readonly toast = inject(ToastService);

  protected readonly phoneMask = UZ_PHONE_MASK;
  protected readonly phonePrefix = UZ_PHONE_PREFIX;

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly model = signal({ ...LOGIN_DEMO_MODEL });

  protected readonly loginForm = form(this.model, (path) => {
    required(path.phone, { message: () => this.t('phoneRequired') });
    required(path.password, { message: () => this.t('passwordRequired') });
  });

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected errorFor(control: 'phone' | 'password'): string {
    const state = this.loginForm[control]();
    // ngx-mask marks the control dirty on init — only show after blur or submit.
    if (!this.submitted() && !state.touched()) {
      return '';
    }
    if (control === 'phone') {
      return isCompleteUzPhone(this.model().phone) ? '' : this.t('phoneRequired');
    }
    return this.model().password.trim() ? '' : this.t('passwordRequired');
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.submitted.set(true);

    const phone = toE164Phone(this.model().phone);
    const password = this.model().password.trim();
    if (!isCompleteUzPhone(phone) || !password) {
      return;
    }

    await submit(this.loginForm, async () => {
      this.submitting.set(true);
      try {
        await this.auth.login({ phone, password });
        await this.router.navigateByUrl('/dashboard');
      } catch {
        this.toast.show({
          tone: 'danger',
          title: this.t('error'),
        });
      } finally {
        this.submitting.set(false);
      }
    });
  }

  /** Scoped auth keys — avoids `auth.*` looking missing before/without the scope merge. */
  private t(key: string): string {
    return this.i18n.translate(key, {}, 'auth');
  }
}
