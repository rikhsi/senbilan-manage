import { type Brand } from '../shared/brand';
import { err, ok, type Result } from '../shared/result';
import { InvalidEmailError } from './user.errors';

export type Email = Brand<string, 'Email'>;

// Pragmatic RFC 5322 subset; the server remains the source of truth.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());

export const createEmail = (value: string): Result<Email, InvalidEmailError> => {
  const normalised = value.trim().toLowerCase();
  return isValidEmail(normalised) ? ok(normalised as Email) : err(new InvalidEmailError(value));
};
