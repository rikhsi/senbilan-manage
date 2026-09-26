import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ValidationError } from '@senbilan/core/application';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonSpinner,
  IonText,
} from '@ionic/angular';
import { AuthStore } from '@senbilan/shared/auth';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline, lockClosedOutline } from 'ionicons/icons';
import { MOBILE_LOGIN_DEMO } from './login.model';

addIcons({ eyeOutline, eyeOffOutline, lockClosedOutline });

@Component({
  selector: 'mobile-login-page',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonNote,
    IonSpinner,
    IonText,
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
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: [MOBILE_LOGIN_DEMO.email, [Validators.required, Validators.email]],
    password: [MOBILE_LOGIN_DEMO.password, [Validators.required]],
  });

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    this.formError.set(null);
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    try {
      await this.auth.login(this.form.getRawValue());
      await this.router.navigateByUrl('/');
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
