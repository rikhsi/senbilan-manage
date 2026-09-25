import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AppButtonComponent, type ButtonSize, type ButtonVariant } from './app-button.component';

type ButtonStoryArgs = {
  label: string;
  variant: ButtonVariant;
  size: ButtonSize;
  loading: boolean;
  block: boolean;
};

const meta: Meta<ButtonStoryArgs> = {
  title: 'Primitives/Button',
  decorators: [
    moduleMetadata({
      imports: [AppButtonComponent],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <button
        app-button
        [variant]="variant"
        [size]="size"
        [loading]="loading"
        [block]="block"
      >
        {{ label }}
      </button>
    `,
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'surface', 'danger', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    block: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    label: 'Button',
    variant: 'primary',
    size: 'md',
    loading: false,
    block: false,
  },
};

export default meta;

type Story = StoryObj<ButtonStoryArgs>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', label: 'Secondary' },
};

export const Danger: Story = {
  args: { variant: 'danger', label: 'Delete' },
};

export const Loading: Story = {
  args: { loading: true, label: 'Saving' },
};
