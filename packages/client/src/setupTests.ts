import '@testing-library/jest-dom'; // import jest-dom matchers
import { server } from './tests/mocks/setup';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
