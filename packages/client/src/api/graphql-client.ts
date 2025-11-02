import { GraphQLClient } from 'graphql-request';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/graphql';

export const graphqlClient = new GraphQLClient(API_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
});
