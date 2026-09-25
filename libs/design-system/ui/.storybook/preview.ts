import { provideAnimations } from '@angular/platform-browser/animations';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { applicationConfig, type Preview } from '@storybook/angular';
import { provideDesignSystem } from '../src/lib/provide-design-system';
import '../../tokens/src/styles/index.scss';
import '../src/styles/index.scss';
import '@fontsource-variable/inter/wght.css';

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [provideAnimations(), provideDesignSystem()],
    }),
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attribute: 'data-theme',
    }),
  ],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: 'centered',
  },
};

export default preview;
