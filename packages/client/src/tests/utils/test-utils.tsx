import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Custom render function that wraps components with providers if needed
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { customRender as render };
