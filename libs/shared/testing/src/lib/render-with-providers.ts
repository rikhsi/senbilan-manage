import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  type EnvironmentProviders,
  type Provider,
  type Type,
  provideZonelessChangeDetection,
} from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideTestQueryClient } from './provide-test-query-client';
import { provideTestingPlatform } from './provide-testing-platform';

export interface RenderWithProvidersOptions {
  readonly providers?: readonly (Provider | EnvironmentProviders)[];
  readonly imports?: readonly Type<unknown>[];
  /** Extra component inputs applied after createComponent. */
  readonly inputs?: Readonly<Record<string, unknown>>;
  readonly detectChanges?: boolean;
}

export interface RenderWithProvidersResult<T> {
  readonly fixture: ComponentFixture<T>;
  readonly component: T;
}

/**
 * TestBed helper with APP_CONFIG mock, noop animations, HTTP testing, and
 * TanStack Query stubs commonly needed by feature UI.
 */
export const renderWithProviders = async <T>(
  component: Type<T>,
  options: RenderWithProvidersOptions = {},
): Promise<RenderWithProvidersResult<T>> => {
  await TestBed.configureTestingModule({
    imports: [component, ...(options.imports ?? [])],
    providers: [
      provideZonelessChangeDetection(),
      provideTestingPlatform(),
      provideHttpClient(),
      provideHttpClientTesting(),
      provideTestQueryClient(),
      ...(options.providers ?? []),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
  if (options.inputs) {
    for (const [key, value] of Object.entries(options.inputs)) {
      fixture.componentRef.setInput(key, value);
    }
  }
  if (options.detectChanges !== false) {
    fixture.detectChanges();
  }
  return { fixture, component: fixture.componentInstance };
};
