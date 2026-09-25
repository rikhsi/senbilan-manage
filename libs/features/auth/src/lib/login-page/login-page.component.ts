import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

@Component({
  selector: 'auth-login-page',
  imports: [
    ReactiveFormsModule,
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
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslocoService);
  private readonly auth = inject(AuthStore);

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['admin@senbilan.dev', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required]],
  });

  protected errorFor(control: 'email' | 'password'): string {
    if (!this.submitted() && !this.form.controls[control].touched) {
      return '';
    }
    const c = this.form.controls[control];
    if (c.hasError('required')) {
      return this.i18n.translate(
        control === 'email' ? 'auth.emailRequired' : 'auth.passwordRequired',
      );
    }
    return '';
  }

  protected async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.formError.set(null);
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    try {
      await this.auth.login(this.form.getRawValue());
      await this.router.navigateByUrl('/dashboard');
    } catch (error: unknown) {
      void error;
      this.formError.set(
        this.i18n.translate(error instanceof ValidationError ? 'auth.error' : 'auth.error'),
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
