import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AppFormFieldComponent } from './app-form-field.component';
import { AppInputDirective } from './app-input.directive';

type FormFieldStoryArgs = {
  label: string;
  hint: string;
  help: string;
  helpLabel: string;
  error: string;
  required: boolean;
  placeholder: string;
};

const meta: Meta<FormFieldStoryArgs> = {
  title: 'Forms/FormField',
  decorators: [
    moduleMetadata({
      imports: [AppFormFieldComponent, AppInputDirective],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <app-form-field
        style="width:20rem"
        [label]="label"
        [hint]="hint"
        [help]="help"
        [helpLabel]="helpLabel"
        [error]="error"
        [required]="required"
      >
        <input appInput type="text" [placeholder]="placeholder" />
      </app-form-field>
    `,
  }),
  args: {
    label: 'Email',
    hint: '',
    help: 'We never share your email.',
    helpLabel: 'Field help',
    error: '',
    required: true,
    placeholder: 'name@example.com',
  },
};

export default meta;

type Story = StoryObj<FormFieldStoryArgs>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    help: '',
    error: 'Enter a valid email address.',
  },
};

export const Optional: Story = {
  args: {
    required: false,
    label: 'Nickname',
    help: 'Shown on your profile.',
    placeholder: 'Optional',
  },
};
