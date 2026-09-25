import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  AppButtonComponent,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  type ButtonSize,
  type ButtonVariant,
} from './app-button.component';

type ButtonStoryArgs = {
  label: string;
  variant: ButtonVariant;
  size: ButtonSize;
  loading: boolean;
  block: boolean;
  disabled: boolean;
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
        [disabled]="disabled"
      >
        {{ label }}
      </button>
    `,
  }),
  argTypes: {
    variant: { control: 'select', options: [...BUTTON_VARIANTS] },
    size: { control: 'select', options: [...BUTTON_SIZES] },
    loading: { control: 'boolean' },
    block: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    label: 'Button',
    variant: 'primary',
    size: 'md',
    loading: false,
    block: false,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<ButtonStoryArgs>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', label: 'Secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', label: 'Ghost' },
};

export const Surface: Story = {
  args: { variant: 'surface', label: 'Surface' },
};

export const Danger: Story = {
  args: { variant: 'danger', label: 'Delete' },
};

export const Link: Story = {
  args: { variant: 'link', label: 'Learn more' },
};

export const Loading: Story = {
  args: { loading: true, label: 'Saving' },
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Disabled' },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap">
        <button app-button variant="primary" size="sm">Small</button>
        <button app-button variant="primary" size="md">Medium</button>
        <button app-button variant="primary" size="lg">Large</button>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    props: { variants: BUTTON_VARIANTS },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem">
        @for (v of variants; track v) {
          <button app-button [variant]="v">{{ v }}</button>
        }
      </div>
    `,
  }),
};
