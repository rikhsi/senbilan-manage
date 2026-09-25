import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ValidationError } from '@senbilan/core/application';
import {
  AppButtonComponent,
  AppCardComponent,
  AppFormFieldComponent,
  AppInputDirective,
} from '@senbilan/design-system/ui';
import { AuthStore } from '@senbilan/shared/auth';
import { email, form, FormField, required, submit } from '@senbilan/shared/ng';

interface LoginModel {
  email: string;
  password: string;
}

@Component({
  selector: 'auth-login-page',
  imports: [
    FormField,
    TranslocoPipe,
    AppButtonComponent,
    AppCardComponent,
    AppFormFieldComponent,
    AppInputDirective,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslocoService);
  private readonly auth = inject(AuthStore);

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly model = signal<LoginModel>({
    email: 'admin@senbilan.dev',
    password: 'password123',
  });

  protected readonly loginForm = form(this.model, (path) => {
    required(path.email, { message: () => this.i18n.translate('auth.emailRequired') });
    email(path.email, { message: () => this.i18n.translate('auth.error') });
    required(path.password, { message: () => this.i18n.translate('auth.passwordRequired') });
  });

  protected errorFor(control: 'email' | 'password'): string {
    const field = this.loginForm[control];
    const state = field();
    if (!state.touched() && !state.dirty()) {
      return '';
    }
    const first = state.errors()[0];
    return first?.message ?? '';
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.formError.set(null);

    await submit(this.loginForm, async () => {
      this.submitting.set(true);
      try {
        await this.auth.login(this.model());
        await this.router.navigateByUrl('/dashboard');
      } catch (error: unknown) {
        void error;
        this.formError.set(
          this.i18n.translate(error instanceof ValidationError ? 'auth.error' : 'auth.error'),
        );
      } finally {
        this.submitting.set(false);
      }
    });
  }
}
