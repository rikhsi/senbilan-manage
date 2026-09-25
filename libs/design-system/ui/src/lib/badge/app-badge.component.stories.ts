import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AppBadgeComponent, TONES, type Tone } from './app-badge.component';

type BadgeStoryArgs = {
  label: string;
  tone: Tone;
  size: 'sm' | 'md';
  pill: boolean;
};

const meta: Meta<BadgeStoryArgs> = {
  title: 'Primitives/Badge',
  decorators: [
    moduleMetadata({
      imports: [AppBadgeComponent],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <app-badge [tone]="tone" [size]="size" [pill]="pill">{{ label }}</app-badge>
    `,
  }),
  argTypes: {
    tone: { control: 'select', options: [...TONES] },
    size: { control: 'select', options: ['sm', 'md'] },
    pill: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    label: 'Badge',
    tone: 'primary',
    size: 'md',
    pill: false,
  },
};

export default meta;

type Story = StoryObj<BadgeStoryArgs>;

export const Default: Story = {};

export const Pill: Story = {
  args: { pill: true, label: '12' },
};

export const Tones: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
        @for (tone of tones; track tone) {
          <app-badge [tone]="tone">{{ tone }}</app-badge>
        }
      </div>
    `,
    props: { tones: TONES },
  }),
};
