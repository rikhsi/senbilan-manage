import {
  HttpClient,
  type HttpContext,
  type HttpHeaders,
  type HttpParams,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '@senbilan/shared/config';
import { firstValueFrom } from 'rxjs';

export interface ApiRequestOptions {
  readonly params?:
    | HttpParams
    | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  readonly headers?: HttpHeaders | Record<string, string | string[]>;
  readonly context?: HttpContext;
  readonly signal?: AbortSignal;
  readonly withCredentials?: boolean;
}

export interface ApiEnvelope<T> {
  readonly data: T;
  readonly meta?: Readonly<Record<string, unknown>>;
}

@Injectable()
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  /** Raw envelope when callers need `meta` (pagination totals, etc.). */
  getEnvelope<T>(path: string, options?: ApiRequestOptions): Promise<ApiEnvelope<T>> {
    return this.requestEnvelope<T>('GET', path, undefined, options);
  }

  private url(path: string): string {
    const base = this.config.apiBaseUrl.replace(/\/$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body: unknown,
    options?: ApiRequestOptions,
  ): Promise<T> {
    const envelope = await this.requestEnvelope<T>(method, path, body, options);
    return envelope.data;
  }

  private requestEnvelope<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body: unknown,
    options?: ApiRequestOptions,
  ): Promise<ApiEnvelope<T>> {
    const httpOptions = {
      ...(options?.params !== undefined ? { params: options.params } : {}),
      ...(options?.headers !== undefined ? { headers: options.headers } : {}),
      ...(options?.context !== undefined ? { context: options.context } : {}),
      ...(options?.withCredentials !== undefined
        ? { withCredentials: options.withCredentials }
        : { withCredentials: true }),
      observe: 'body' as const,
      responseType: 'json' as const,
    };

    const url = this.url(path);
    let observable;
    switch (method) {
      case 'GET':
        observable = this.http.get<ApiEnvelope<T>>(url, httpOptions);
        break;
      case 'DELETE':
        observable = this.http.delete<ApiEnvelope<T>>(url, httpOptions);
        break;
      case 'POST':
        observable = this.http.post<ApiEnvelope<T>>(url, body ?? null, httpOptions);
        break;
      case 'PUT':
        observable = this.http.put<ApiEnvelope<T>>(url, body ?? null, httpOptions);
        break;
      default:
        observable = this.http.patch<ApiEnvelope<T>>(url, body ?? null, httpOptions);
        break;
    }

    const promise = firstValueFrom(observable);
    if (options?.signal) {
      return abortable(promise, options.signal);
    }
    return promise;
  }
}

const abortable = <T>(promise: Promise<T>, signal: AbortSignal): Promise<T> => {
  if (signal.aborted) {
    return Promise.reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = (): void => {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
};
