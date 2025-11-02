import type { Preview } from '@storybook/react-vite';

// Import global styles
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    // Layout options: 'centered', 'fullscreen', 'padded'
    layout: 'padded',

    // Sort stories alphabetically
    options: {
      storySort: {
        order: [
          'Documentation',
          ['Introduction', 'Getting Started', 'Examples'],
          'Components',
          'Layouts',
          'Pages',
        ],
      },
    },
  },
};

export default preview;
