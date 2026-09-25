import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AppCardComponent, type CardPadding, type CardVariant } from './app-card.component';

type CardStoryArgs = {
  variant: CardVariant;
  padding: CardPadding;
  interactive: boolean;
  title: string;
  body: string;
};

const meta: Meta<CardStoryArgs> = {
  title: 'Primitives/Card',
  decorators: [
    moduleMetadata({
      imports: [AppCardComponent],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <app-card [variant]="variant" [padding]="padding" [interactive]="interactive" style="width:20rem">
        <h3 style="margin:0 0 0.5rem;font:var(--app-font-title-sm)">{{ title }}</h3>
        <p style="margin:0;color:var(--app-color-text-secondary)">{{ body }}</p>
      </app-card>
    `,
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outlined', 'filled', 'tinted'],
    },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    interactive: { control: 'boolean' },
  },
  args: {
    variant: 'elevated',
    padding: 'md',
    interactive: false,
    title: 'Card title',
    body: 'Surface container for grouped content.',
  },
};

export default meta;

type Story = StoryObj<CardStoryArgs>;

export const Elevated: Story = {};

export const Outlined: Story = {
  args: { variant: 'outlined' },
};

export const Interactive: Story = {
  args: { interactive: true, title: 'Clickable card' },
};
