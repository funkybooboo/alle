import { gql } from 'graphql-request';
import { graphqlClient } from './graphql-client';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from '../types/task.types';

// GraphQL Queries
const GET_ALL_TASKS = gql`
  query GetAllTasks {
    tasks {
      id
      title
      completed
      date
      listId
      position
      notes
      color
      createdAt
      updatedAt
    }
  }
`;

const GET_TASK_BY_ID = gql`
  query GetTaskById($id: Int!) {
    task(id: $id) {
      id
      title
      completed
      date
      listId
      position
      notes
      color
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      completed
      date
      listId
      position
      notes
      color
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: Int!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      completed
      date
      listId
      position
      notes
      color
      createdAt
      updatedAt
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: Int!) {
    deleteTask(id: $id)
  }
`;

// Type for GraphQL task response
interface GraphQLTask {
  id: number;
  title: string;
  completed: boolean;
  date?: string | null;
  listId?: number | null;
  position?: number | null;
  notes?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Convert GraphQL task to frontend Task type
const toTask = (gqlTask: GraphQLTask): Task => ({
  id: String(gqlTask.id),
  title: gqlTask.title,
  completed: gqlTask.completed,
  date: gqlTask.date ? new Date(gqlTask.date) : null,
  listId: gqlTask.listId ?? null,
  position: gqlTask.position ?? null,
  notes: gqlTask.notes ?? null,
  color: gqlTask.color ?? null,
  createdAt: gqlTask.createdAt,
  updatedAt: gqlTask.updatedAt,
});

// API functions
export const taskAPI = {
  async getAllTasks(): Promise<Task[]> {
    const data = await graphqlClient.request<{ tasks: GraphQLTask[] }>(
      GET_ALL_TASKS
    );
    return data.tasks.map(toTask);
  },

  async getTaskById(id: number): Promise<Task> {
    const data = await graphqlClient.request<{ task: GraphQLTask }>(
      GET_TASK_BY_ID,
      { id }
    );
    return toTask(data.task);
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const data = await graphqlClient.request<{ createTask: GraphQLTask }>(
      CREATE_TASK,
      { input }
    );
    return toTask(data.createTask);
  },

  async updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
    const data = await graphqlClient.request<{ updateTask: GraphQLTask }>(
      UPDATE_TASK,
      { id, input }
    );
    return toTask(data.updateTask);
  },

  async deleteTask(id: number): Promise<boolean> {
    const data = await graphqlClient.request<{ deleteTask: boolean }>(
      DELETE_TASK,
      { id }
    );
    return data.deleteTask;
  },
};
