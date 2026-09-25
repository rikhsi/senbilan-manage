import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AuthRepository,
  type AuthResult,
  type AuthTokens,
  type Credentials,
} from '@senbilan/core/application';
import { type Session } from '@senbilan/core/domain';
import { APP_CONFIG } from '@senbilan/shared/config';
import { ApiClient } from '../http/api-client';
import { SKIP_AUTH } from '../http/http-context.tokens';
import { type AuthResultDto, type AuthTokensDto, type SessionDto } from '../dto/api.dto';
import { authResultFromDto, sessionFromDto, tokensFromDto } from '../dto/mappers';

@Injectable()
export class HttpAuthRepository extends AuthRepository {
  private readonly api = inject(ApiClient);
  private readonly config = inject(APP_CONFIG);

  override login(credentials: Credentials): Promise<AuthResult> {
    return this.api
      .post<AuthResultDto>('/auth/login', credentials, {
        context: new HttpContext().set(SKIP_AUTH, true),
        withCredentials: true,
      })
      .then((dto) => {
        const result = authResultFromDto(dto);
        if (!this.config.auth.refreshViaCookie) {
          return result;
        }
        // Browser keeps refresh in httpOnly cookie; do not mirror into JS storage.
        const tokens: AuthTokens = {
          accessToken: result.tokens.accessToken,
          expiresInSeconds: result.tokens.expiresInSeconds,
        };
        return { session: result.session, tokens };
      });
  }

  override logout(): Promise<void> {
    return this.api
      .post<null>('/auth/logout', undefined, { withCredentials: true })
      .then(() => undefined);
  }

  override refresh(refreshToken?: string): Promise<AuthTokens> {
    const cookieMode = this.config.auth.refreshViaCookie;
    // Cookie mode: empty body; browser sends httpOnly refresh cookie via withCredentials.
    let body: { readonly refreshToken?: string } = {};
    if (!cookieMode && refreshToken !== undefined) {
      body = { refreshToken };
    }
    return this.api
      .post<AuthTokensDto>('/auth/refresh', body, {
        context: new HttpContext().set(SKIP_AUTH, true),
        withCredentials: true,
      })
      .then((dto) => {
        const tokens = tokensFromDto(dto);
        if (!cookieMode) {
          return tokens;
        }
        return {
          accessToken: tokens.accessToken,
          expiresInSeconds: tokens.expiresInSeconds,
        };
      });
  }

  override me(signal?: AbortSignal): Promise<Session> {
    return this.api
      .get<SessionDto>('/auth/me', signal !== undefined ? { signal } : undefined)
      .then(sessionFromDto);
  }
}
