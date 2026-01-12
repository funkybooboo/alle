import { gql } from 'graphql-request';
import { graphqlClient } from './graphql-client';
import type { TaskTag, AddTaskTagInput } from '../types/task.types';

// GraphQL Queries
const GET_TASK_TAGS = gql`
  query GetTaskTags($taskId: Int!) {
    taskTags(taskId: $taskId) {
      id
      taskId
      tagName
      createdAt
    }
  }
`;

const GET_ALL_TAG_NAMES = gql`
  query GetAllTagNames {
    allTagNames
  }
`;

const ADD_TASK_TAG = gql`
  mutation AddTaskTag($input: AddTaskTagInput!) {
    addTaskTag(input: $input) {
      id
      taskId
      tagName
      createdAt
    }
  }
`;

const DELETE_TASK_TAG = gql`
  mutation DeleteTaskTag($id: Int!) {
    deleteTaskTag(id: $id)
  }
`;

// GraphQL response types
interface GraphQLTaskTag {
  id: number;
  taskId: number;
  tagName: string;
  createdAt: string;
}

// Convert GraphQL tag to frontend type
const toTaskTag = (gqlTag: GraphQLTaskTag): TaskTag => ({
  id: gqlTag.id,
  taskId: gqlTag.taskId,
  tagName: gqlTag.tagName,
  createdAt: gqlTag.createdAt,
});

// API functions
export const taskTagAPI = {
  async getTaskTags(taskId: number): Promise<TaskTag[]> {
    const data = await graphqlClient.request<{ taskTags: GraphQLTaskTag[] }>(
      GET_TASK_TAGS,
      { taskId }
    );
    return data.taskTags.map(toTaskTag);
  },

  async getAllTagNames(): Promise<string[]> {
    const data = await graphqlClient.request<{ allTagNames: string[] }>(
      GET_ALL_TAG_NAMES
    );
    return data.allTagNames;
  },

  async addTaskTag(input: AddTaskTagInput): Promise<TaskTag> {
    const data = await graphqlClient.request<{ addTaskTag: GraphQLTaskTag }>(
      ADD_TASK_TAG,
      { input }
    );
    return toTaskTag(data.addTaskTag);
  },

  async deleteTaskTag(id: number): Promise<boolean> {
    const data = await graphqlClient.request<{ deleteTaskTag: boolean }>(
      DELETE_TASK_TAG,
      { id }
    );
    return data.deleteTaskTag;
  },
};
