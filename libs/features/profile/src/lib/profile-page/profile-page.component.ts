import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { UpdateProfileUseCase, UserRepository } from '@senbilan/core/application';
import { UserId } from '@senbilan/core/domain';
import { UserAvatarComponent } from '@senbilan/entities/user';
import {
  AppButtonComponent,
  AppFormFieldComponent,
  AppInputDirective,
  ToastService,
} from '@senbilan/design-system/ui';

@Component({
  selector: 'profile-page',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    AppButtonComponent,
    AppFormFieldComponent,
    AppInputDirective,
    UserAvatarComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(TranslocoService);
  private readonly toast = inject(ToastService);
  private readonly usersRepo = inject(UserRepository, { optional: true });

  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    avatarUrl: [''],
  });

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.usersRepo) {
      return;
    }
    this.saving.set(true);
    try {
      const value = this.form.getRawValue();
      // TODO: resolve current user id from AuthStore / session.
      await new UpdateProfileUseCase(this.usersRepo).execute(UserId('me'), {
        firstName: value.firstName,
        lastName: value.lastName,
        avatarUrl: value.avatarUrl || null,
      });
      this.toast.show({
        tone: 'success',
        title: this.i18n.translate('profile.saved'),
      });
    } finally {
      this.saving.set(false);
    }
  }
}
