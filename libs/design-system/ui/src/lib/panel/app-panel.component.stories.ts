import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AppPanelComponent, type PanelPadding } from './app-panel.component';

type PanelStoryArgs = {
  padding: PanelPadding;
  bordered: boolean;
  body: string;
};

const meta: Meta<PanelStoryArgs> = {
  title: 'Primitives/Panel',
  decorators: [
    moduleMetadata({
      imports: [AppPanelComponent],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <app-panel [padding]="padding" [bordered]="bordered" style="width:24rem">
        <p style="margin:0">{{ body }}</p>
      </app-panel>
    `,
  }),
  argTypes: {
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    bordered: { control: 'boolean' },
  },
  args: {
    padding: 'md',
    bordered: true,
    body: 'Flat panel for dense admin zones (tables, filter bars).',
  },
};

export default meta;

type Story = StoryObj<PanelStoryArgs>;

export const Default: Story = {};

export const Borderless: Story = {
  args: { bordered: false },
};
