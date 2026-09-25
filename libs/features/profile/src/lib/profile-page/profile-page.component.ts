import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { UpdateProfileUseCase, UserRepository } from '@senbilan/core/application';
import { UserAvatarComponent } from '@senbilan/entities/user';
import {
  AppButtonComponent,
  AppFormFieldComponent,
  AppInputDirective,
  ToastService,
} from '@senbilan/design-system/ui';
import { AuthStore } from '@senbilan/shared/auth';
import { disabled, form, FormField, required, submit } from '@senbilan/shared/ng';

interface ProfileModel {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

@Component({
  selector: 'profile-page',
  imports: [
    FormField,
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
  private readonly i18n = inject(TranslocoService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthStore);
  private readonly usersRepo = inject(UserRepository, { optional: true });

  protected readonly saving = signal(false);

  private readonly initialUser = this.auth.user();

  protected readonly model = signal<ProfileModel>({
    firstName: this.initialUser?.firstName ?? '',
    lastName: this.initialUser?.lastName ?? '',
    email: this.initialUser?.email ?? '',
    avatarUrl: this.initialUser?.avatarUrl ?? '',
  });

  protected readonly profileForm = form(this.model, (path) => {
    required(path.firstName, { message: () => this.i18n.translate('profile.firstName') });
    required(path.lastName, { message: () => this.i18n.translate('profile.lastName') });
    disabled(path.email);
  });

  protected readonly displayName = computed(() => {
    const value = this.model();
    return `${value.firstName} ${value.lastName}`.trim() || value.email;
  });

  protected errorFor(control: 'firstName' | 'lastName'): string {
    const state = this.profileForm[control]();
    if (!state.touched() && !state.dirty()) {
      return '';
    }
    return state.errors()[0]?.message ?? '';
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    const user = this.auth.user();
    const repo = this.usersRepo;
    if (!user || !repo) {
      return;
    }

    await submit(this.profileForm, async () => {
      this.saving.set(true);
      try {
        const value = this.model();
        await new UpdateProfileUseCase(repo).execute(user.id, {
          firstName: value.firstName,
          lastName: value.lastName,
          avatarUrl: value.avatarUrl || null,
        });
        await this.auth.restore();
        this.toast.show({
          tone: 'success',
          title: this.i18n.translate('profile.saved'),
        });
      } finally {
        this.saving.set(false);
      }
    });
  }
}
