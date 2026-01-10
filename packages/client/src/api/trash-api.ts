import { gql, GraphQLClient } from 'graphql-request';
import type { TrashItem, CreateTrashInput } from '../types/trash.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/graphql';

const client = new GraphQLClient(API_URL);

export const trashAPI = {
  getAllTrash: async (): Promise<TrashItem[]> => {
    const query = gql`
      query GetTrash {
        trash {
          id
          taskId
          taskText
          taskDate
          taskCompleted
          deletedAt
          taskType
          somedayListId
        }
      }
    `;

    const data = await client.request<{ trash: TrashItem[] }>(query);
    return data.trash;
  },

  createTrashItem: async (input: CreateTrashInput): Promise<TrashItem> => {
    const mutation = gql`
      mutation CreateTrashItem($input: CreateTrashInput!) {
        createTrashItem(input: $input) {
          id
          taskId
          taskText
          taskDate
          taskCompleted
          deletedAt
          taskType
          somedayListId
        }
      }
    `;

    const data = await client.request<{ createTrashItem: TrashItem }>(mutation, { input });
    return data.createTrashItem;
  },

  deleteTrashItem: async (id: number): Promise<boolean> => {
    const mutation = gql`
      mutation DeleteTrashItem($id: Int!) {
        deleteTrashItem(id: $id)
      }
    `;

    const data = await client.request<{ deleteTrashItem: boolean }>(mutation, { id });
    return data.deleteTrashItem;
  },

  cleanOldTrash: async (): Promise<boolean> => {
    const mutation = gql`
      mutation CleanOldTrash {
        cleanOldTrash
      }
    `;

    const data = await client.request<{ cleanOldTrash: boolean }>(mutation);
    return data.cleanOldTrash;
  },
};
