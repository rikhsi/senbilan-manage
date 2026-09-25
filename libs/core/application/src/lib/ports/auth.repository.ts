import { type Session } from '@senbilan/core/domain';

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export interface AuthTokens {
  readonly accessToken: string;
  /** Present only when the backend does not use an httpOnly refresh cookie. */
  readonly refreshToken?: string;
  readonly expiresInSeconds: number;
}

export interface AuthResult {
  readonly session: Session;
  readonly tokens: AuthTokens;
}

export abstract class AuthRepository {
  abstract login(credentials: Credentials): Promise<AuthResult>;
  abstract logout(): Promise<void>;
  /** Exchanges the refresh token (cookie or explicit) for new tokens. */
  abstract refresh(refreshToken?: string): Promise<AuthTokens>;
  /** Loads the current principal using the current access token. */
  abstract me(signal?: AbortSignal): Promise<Session>;
}
