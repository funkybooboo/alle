import { gql } from 'graphql-request';
import { graphqlClient } from './graphql-client';
import type {
  TaskLink,
  AddTaskLinkInput,
  UpdateTaskLinkInput,
} from '../types/task.types';

// GraphQL Queries
const GET_TASK_LINKS = gql`
  query GetTaskLinks($taskId: Int!) {
    taskLinks(taskId: $taskId) {
      id
      taskId
      url
      title
      position
      createdAt
    }
  }
`;

const ADD_TASK_LINK = gql`
  mutation AddTaskLink($input: AddTaskLinkInput!) {
    addTaskLink(input: $input) {
      id
      taskId
      url
      title
      position
      createdAt
    }
  }
`;

const UPDATE_TASK_LINK = gql`
  mutation UpdateTaskLink($input: UpdateTaskLinkInput!) {
    updateTaskLink(input: $input) {
      id
      taskId
      url
      title
      position
      createdAt
    }
  }
`;

const DELETE_TASK_LINK = gql`
  mutation DeleteTaskLink($id: Int!) {
    deleteTaskLink(id: $id)
  }
`;

// GraphQL response types
interface GraphQLTaskLink {
  id: number;
  taskId: number;
  url: string;
  title?: string | null;
  position: number;
  createdAt: string;
}

// Convert GraphQL link to frontend type
const toTaskLink = (gqlLink: GraphQLTaskLink): TaskLink => ({
  id: gqlLink.id,
  taskId: gqlLink.taskId,
  url: gqlLink.url,
  title: gqlLink.title ?? null,
  position: gqlLink.position,
  createdAt: gqlLink.createdAt,
});

// API functions
export const taskLinkAPI = {
  async getTaskLinks(taskId: number): Promise<TaskLink[]> {
    const data = await graphqlClient.request<{ taskLinks: GraphQLTaskLink[] }>(
      GET_TASK_LINKS,
      { taskId }
    );
    return data.taskLinks.map(toTaskLink);
  },

  async addTaskLink(input: AddTaskLinkInput): Promise<TaskLink> {
    const data = await graphqlClient.request<{ addTaskLink: GraphQLTaskLink }>(
      ADD_TASK_LINK,
      { input }
    );
    return toTaskLink(data.addTaskLink);
  },

  async updateTaskLink(input: UpdateTaskLinkInput): Promise<TaskLink> {
    const data = await graphqlClient.request<{
      updateTaskLink: GraphQLTaskLink;
    }>(UPDATE_TASK_LINK, { input });
    return toTaskLink(data.updateTaskLink);
  },

  async deleteTaskLink(id: number): Promise<boolean> {
    const data = await graphqlClient.request<{ deleteTaskLink: boolean }>(
      DELETE_TASK_LINK,
      { id }
    );
    return data.deleteTaskLink;
  },
};
