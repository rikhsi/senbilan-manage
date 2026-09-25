import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AppButtonComponent } from '../button/app-button.component';
import { AppEmptyStateComponent } from './app-empty-state.component';
import { AppErrorStateComponent } from './app-error-state.component';
import { AppLoadingStateComponent } from './app-loading-state.component';

const meta: Meta = {
  title: 'States/Empty Error Loading',
  decorators: [
    moduleMetadata({
      imports: [
        AppEmptyStateComponent,
        AppErrorStateComponent,
        AppLoadingStateComponent,
        AppButtonComponent,
      ],
    }),
  ],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

export const Empty: Story = {
  render: () => ({
    template: `
      <app-empty-state
        icon="users"
        title="No users yet"
        description="Create the first user to get started."
      >
        <button app-button variant="primary" type="button">Create user</button>
      </app-empty-state>
    `,
  }),
};

export const Error: Story = {
  render: () => ({
    template: `
      <app-error-state
        title="Something went wrong"
        description="We could not load this list. Try again."
        retryLabel="Retry"
      />
    `,
  }),
};

export const Loading: Story = {
  render: () => ({
    template: `<app-loading-state label="Loading…" />`,
  }),
};

export const LoadingInline: Story = {
  render: () => ({
    template: `<app-loading-state label="Saving" [inline]="true" size="sm" />`,
  }),
};
