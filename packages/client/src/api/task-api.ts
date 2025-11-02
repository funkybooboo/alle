import { gql } from 'graphql-request';
import { graphqlClient } from './graphql-client';
import type { Task } from '../components/calendar/task-item/TaskItem.types';

// GraphQL Queries
const GET_ALL_TASKS = gql`
  query GetAllTasks {
    tasks {
      id
      title
      completed
      date
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $date: String!) {
    createTask(input: { title: $title, date: $date }) {
      id
      title
      completed
      date
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: Int!
    $title: String
    $completed: Boolean
    $date: String
  ) {
    updateTask(
      id: $id
      input: { title: $title, completed: $completed, date: $date }
    ) {
      id
      title
      completed
      date
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
  date: string;
  createdAt: string;
  updatedAt: string;
}

// Convert GraphQL task to frontend Task type
const toTask = (gqlTask: GraphQLTask): Task => ({
  id: String(gqlTask.id),
  text: gqlTask.title,
  completed: gqlTask.completed,
  date: new Date(gqlTask.date),
});

// API functions
export const taskAPI = {
  async getAllTasks(): Promise<Task[]> {
    const data = await graphqlClient.request<{ tasks: GraphQLTask[] }>(
      GET_ALL_TASKS
    );
    return data.tasks.map(toTask);
  },

  async createTask(text: string, date: Date): Promise<Task> {
    const data = await graphqlClient.request<{ createTask: GraphQLTask }>(
      CREATE_TASK,
      {
        title: text,
        date: date.toISOString(),
      }
    );
    return toTask(data.createTask);
  },

  async updateTask(
    id: string,
    updates: { text?: string; completed?: boolean; date?: Date }
  ): Promise<Task> {
    const data = await graphqlClient.request<{ updateTask: GraphQLTask }>(
      UPDATE_TASK,
      {
        id: parseInt(id, 10),
        title: updates.text,
        completed: updates.completed,
        date: updates.date?.toISOString(),
      }
    );
    return toTask(data.updateTask);
  },

  async deleteTask(id: string): Promise<boolean> {
    const data = await graphqlClient.request<{ deleteTask: boolean }>(
      DELETE_TASK,
      {
        id: parseInt(id, 10),
      }
    );
    return data.deleteTask;
  },
};
