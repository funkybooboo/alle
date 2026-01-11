import { gql } from 'graphql-request';
import { graphqlClient } from './graphql-client';
import type { TrashItem, CreateTrashInput } from '../types/trash.types';

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

    const data = await graphqlClient.request<{ trash: TrashItem[] }>(query);
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

    const data = await graphqlClient.request<{ createTrashItem: TrashItem }>(
      mutation,
      { input }
    );
    return data.createTrashItem;
  },

  deleteTrashItem: async (id: number): Promise<boolean> => {
    const mutation = gql`
      mutation DeleteTrashItem($id: Int!) {
        deleteTrashItem(id: $id)
      }
    `;

    const data = await graphqlClient.request<{ deleteTrashItem: boolean }>(
      mutation,
      {
        id,
      }
    );
    return data.deleteTrashItem;
  },

  cleanOldTrash: async (): Promise<boolean> => {
    const mutation = gql`
      mutation CleanOldTrash {
        cleanOldTrash
      }
    `;

    const data = await graphqlClient.request<{ cleanOldTrash: boolean }>(
      mutation
    );
    return data.cleanOldTrash;
  },
};
