import { setupServer } from 'msw/node';
import { handlers } from './graphql-handlers';

export const server = setupServer(...handlers);
