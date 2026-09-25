import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { type Role, type User } from '@senbilan/core/domain';
import {
  AppButtonComponent,
  AppDialogShellComponent,
  AppFormFieldComponent,
  AppInputDirective,
} from '@senbilan/design-system/ui';

export interface UserFormDrawerData {
  readonly mode: 'create' | 'edit';
  readonly user?: User;
  readonly roles: readonly Role[];
}

export interface UserFormDrawerResult {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly roleIds: readonly string[];
}

@Component({
  selector: 'users-form-drawer',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    AppButtonComponent,
    AppDialogShellComponent,
    AppFormFieldComponent,
    AppInputDirective,
  ],
  templateUrl: './user-form-drawer.component.html',
  styleUrl: './user-form-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormDrawerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(
    DialogRef<UserFormDrawerResult | undefined, UserFormDrawerComponent>,
  );
  protected readonly data = inject<UserFormDrawerData>(DIALOG_DATA);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: [this.data.user?.firstName ?? '', Validators.required],
    lastName: [this.data.user?.lastName ?? '', Validators.required],
    email: [
      this.data.user?.email ?? '',
      this.data.mode === 'create' ? [Validators.required, Validators.email] : [],
    ],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.ref.close({
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      roleIds: this.data.user?.roleIds ?? [],
    });
  }

  protected cancel(): void {
    this.ref.close(undefined);
  }
}
