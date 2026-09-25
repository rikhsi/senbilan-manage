import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AppButtonComponent } from '../button/app-button.component';
import { AppEmptyStateComponent } from './app-empty-state.component';

type EmptyArgs = {
  title: string;
  description: string;
  tone: 'neutral' | 'danger' | 'primary';
  size: 'sm' | 'md';
  showAction: boolean;
};

const meta: Meta<EmptyArgs> = {
  title: 'Feedback/EmptyState',
  decorators: [
    moduleMetadata({
      imports: [AppEmptyStateComponent, AppButtonComponent],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <app-empty-state
        icon="users"
        [title]="title"
        [description]="description"
        [tone]="tone"
        [size]="size"
      >
        @if (showAction) {
          <button app-button variant="primary" icon="plus">Create</button>
        }
      </app-empty-state>
    `,
  }),
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'danger', 'primary'] },
    size: { control: 'select', options: ['sm', 'md'] },
    showAction: { control: 'boolean' },
  },
  args: {
    title: 'No users yet',
    description: 'Invite teammates to get started.',
    tone: 'neutral',
    size: 'md',
    showAction: true,
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<EmptyArgs>;

export const Default: Story = {};

export const Danger: Story = {
  args: {
    title: 'Something went wrong',
    description: 'We could not load this list.',
    tone: 'danger',
    showAction: false,
  },
};

export const Compact: Story = {
  args: { size: 'sm', showAction: false },
};
