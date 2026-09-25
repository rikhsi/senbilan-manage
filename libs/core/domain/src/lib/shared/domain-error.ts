/**
 * Base class for errors that express a violated business rule.
 * `code` is a stable, machine-readable identifier used for i18n lookups
 * (`errors.domain.<code>`) — never show `message` to end users directly.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export const isDomainError = (value: unknown): value is DomainError => value instanceof DomainError;
