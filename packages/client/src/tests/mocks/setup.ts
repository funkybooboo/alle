import { setupServer } from 'msw/node';
import { handlers } from './graphql-handlers';

export const server = setupServer(...handlers);

// Start server before all tests
export const setupMockServer = () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
};
