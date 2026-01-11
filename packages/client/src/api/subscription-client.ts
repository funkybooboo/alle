import { createClient } from 'graphql-ws';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export const wsClient = createClient({
  url: WS_URL,
  shouldRetry: () => true,
});
