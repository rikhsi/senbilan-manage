import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import {
  AppFormFieldComponent,
  AppInputDirective,
  AppLocaleToggleComponent,
  AppThemeToggleComponent,
  ToastService,
} from '@senbilan/design-system/ui';
import { OrbitHeroComponent } from '@senbilan/features/auth';
import { AuthStore } from '@senbilan/shared/auth';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline, lockClosedOutline } from 'ionicons/icons';
import { NgxMaskDirective } from 'ngx-mask';
import { isCompleteUzPhone, toE164Phone, UZ_PHONE_MASK, UZ_PHONE_PREFIX } from './login.model';

addIcons({ eyeOutline, eyeOffOutline, lockClosedOutline });

@Component({
  selector: 'mobile-login-page',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
    NgxMaskDirective,
    OrbitHeroComponent,
    AppFormFieldComponent,
    AppInputDirective,
    AppLocaleToggleComponent,
    AppThemeToggleComponent,
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
  private readonly toast = inject(ToastService);

  protected readonly phoneMask = UZ_PHONE_MASK;
  protected readonly phonePrefix = UZ_PHONE_PREFIX;

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly phoneLockAutofill = signal(true);

  protected readonly form = this.fb.nonNullable.group({
    phone: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected unlockPhoneAutofill(): void {
    if (this.phoneLockAutofill()) {
      this.phoneLockAutofill.set(false);
    }
  }

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected phoneError(): string {
    const control = this.form.controls.phone;
    if (!this.submitted() && !control.touched) {
      return '';
    }
    return isCompleteUzPhone(control.value) ? '' : this.t('phoneRequired');
  }

  protected passwordError(): string {
    const control = this.form.controls.password;
    if (!this.submitted() && !control.touched) {
      return '';
    }
    return control.value.trim() ? '' : this.t('passwordRequired');
  }

  protected async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    const phone = toE164Phone(this.form.controls.phone.value);
    const password = this.form.controls.password.value.trim();
    if (!isCompleteUzPhone(phone)) {
      this.toast.show({ tone: 'danger', title: this.t('phoneRequired') });
      return;
    }
    if (!password) {
      this.toast.show({ tone: 'danger', title: this.t('passwordRequired') });
      return;
    }

    this.submitting.set(true);
    try {
      await this.auth.login({ phone, password });
      await this.router.navigateByUrl('/');
    } catch {
      this.toast.show({ tone: 'danger', title: this.t('error') });
    } finally {
      this.submitting.set(false);
    }
  }

  private t(key: string): string {
    return this.i18n.translate(key, {}, 'auth');
  }
}
