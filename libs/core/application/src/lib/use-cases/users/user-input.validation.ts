import { createEmail, type Email, validateUserName } from '@senbilan/core/domain';
import { type FieldErrors, ValidationError } from '../../errors/app-error';
import { err, ok, type Result } from '@senbilan/core/domain';

export interface UserFormInput {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly roleIds: readonly string[];
}

export interface ValidatedUserInput {
  readonly email: Email;
  readonly firstName: string;
  readonly lastName: string;
  readonly roleIds: readonly string[];
}

/** Field error codes map to `validation.<code>` i18n keys. */
export const USER_VALIDATION_CODES = {
  emailInvalid: 'email.invalid',
  firstNameInvalid: 'firstName.invalid',
  lastNameInvalid: 'lastName.invalid',
  rolesRequired: 'roles.required',
} as const;

/**
 * Single source of truth for user form validation. Used by the CreateUser /
 * UpdateUser use cases and by the presentation form (client-side hints), so
 * the rules are never duplicated.
 */
export const validateUserInput = (input: UserFormInput): Result<ValidatedUserInput, ValidationError> => {
  const errors: Record<string, string[]> = {};

  const email = createEmail(input.email);
  if (!email.ok) {
    errors['email'] = [USER_VALIDATION_CODES.emailInvalid];
  }
  const firstName = validateUserName(input.firstName, 'firstName');
  if (!firstName.ok) {
    errors['firstName'] = [USER_VALIDATION_CODES.firstNameInvalid];
  }
  const lastName = validateUserName(input.lastName, 'lastName');
  if (!lastName.ok) {
    errors['lastName'] = [USER_VALIDATION_CODES.lastNameInvalid];
  }
  if (input.roleIds.length === 0) {
    errors['roleIds'] = [USER_VALIDATION_CODES.rolesRequired];
  }

  if (Object.keys(errors).length > 0) {
    return err(new ValidationError(errors satisfies FieldErrors));
  }
  if (!email.ok || !firstName.ok || !lastName.ok) {
    // unreachable, keeps the type-checker honest without non-null assertions
    return err(new ValidationError({}));
  }
  return ok({
    email: email.value,
    firstName: firstName.value,
    lastName: lastName.value,
    roleIds: [...new Set(input.roleIds)],
  });
};
