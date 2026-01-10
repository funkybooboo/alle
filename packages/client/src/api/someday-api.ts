import { gql } from 'graphql-request';
import { graphqlClient } from './graphql-client';
import type {
  SomedayList,
  SomedayTask,
  CreateSomedayListInput,
  UpdateSomedayListInput,
  CreateSomedayTaskInput,
  UpdateSomedayTaskInput,
} from '../types/someday.types';

// GraphQL Queries for Lists
const GET_ALL_LISTS = gql`
  query GetAllSomedayLists {
    somedayLists {
      id
      name
      position
    }
  }
`;

// GraphQL Queries for Tasks
const GET_ALL_TASKS = gql`
  query GetAllSomedayTasks {
    somedayTasks {
      id
      listId
      title
      description
      completed
      position
    }
  }
`;

const GET_TASKS_BY_LIST = gql`
  query GetSomedayTasksByList($listId: Int!) {
    somedayTasksByList(listId: $listId) {
      id
      listId
      title
      description
      completed
      position
    }
  }
`;

// GraphQL Mutations for Lists
const CREATE_LIST = gql`
  mutation CreateSomedayList($name: String!, $position: Int!) {
    createSomedayList(input: { name: $name, position: $position }) {
      id
      name
      position
    }
  }
`;

const UPDATE_LIST = gql`
  mutation UpdateSomedayList($id: Int!, $name: String, $position: Int) {
    updateSomedayList(input: { id: $id, name: $name, position: $position }) {
      id
      name
      position
    }
  }
`;

const DELETE_LIST = gql`
  mutation DeleteSomedayList($id: Int!) {
    deleteSomedayList(id: $id)
  }
`;

// GraphQL Mutations for Tasks
const CREATE_TASK = gql`
  mutation CreateSomedayTask(
    $listId: Int!
    $title: String!
    $description: String
    $position: Int!
  ) {
    createSomedayTask(
      input: {
        listId: $listId
        title: $title
        description: $description
        position: $position
      }
    ) {
      id
      listId
      title
      description
      completed
      position
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateSomedayTask(
    $id: Int!
    $title: String
    $description: String
    $completed: Boolean
    $position: Int
    $listId: Int
  ) {
    updateSomedayTask(
      input: {
        id: $id
        title: $title
        description: $description
        completed: $completed
        position: $position
        listId: $listId
      }
    ) {
      id
      listId
      title
      description
      completed
      position
    }
  }
`;

const TOGGLE_TASK = gql`
  mutation ToggleSomedayTask($id: Int!) {
    toggleSomedayTask(id: $id) {
      id
      listId
      title
      description
      completed
      position
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteSomedayTask($id: Int!) {
    deleteSomedayTask(id: $id)
  }
`;

// API functions
export const somedayAPI = {
  // List operations
  async getAllLists(): Promise<SomedayList[]> {
    const data = await graphqlClient.request<{ somedayLists: SomedayList[] }>(
      GET_ALL_LISTS
    );
    return data.somedayLists;
  },

  async createList(input: CreateSomedayListInput): Promise<SomedayList> {
    const data = await graphqlClient.request<{
      createSomedayList: SomedayList;
    }>(CREATE_LIST, input);
    return data.createSomedayList;
  },

  async updateList(input: UpdateSomedayListInput): Promise<SomedayList> {
    const data = await graphqlClient.request<{
      updateSomedayList: SomedayList;
    }>(UPDATE_LIST, input);
    return data.updateSomedayList;
  },

  async deleteList(id: number): Promise<boolean> {
    const data = await graphqlClient.request<{ deleteSomedayList: boolean }>(
      DELETE_LIST,
      { id }
    );
    return data.deleteSomedayList;
  },

  // Task operations
  async getAllTasks(): Promise<SomedayTask[]> {
    const data = await graphqlClient.request<{ somedayTasks: SomedayTask[] }>(
      GET_ALL_TASKS
    );
    return data.somedayTasks;
  },

  async getTasksByList(listId: number): Promise<SomedayTask[]> {
    const data = await graphqlClient.request<{
      somedayTasksByList: SomedayTask[];
    }>(GET_TASKS_BY_LIST, { listId });
    return data.somedayTasksByList;
  },

  async createTask(input: CreateSomedayTaskInput): Promise<SomedayTask> {
    const data = await graphqlClient.request<{
      createSomedayTask: SomedayTask;
    }>(CREATE_TASK, input);
    return data.createSomedayTask;
  },

  async updateTask(input: UpdateSomedayTaskInput): Promise<SomedayTask> {
    const data = await graphqlClient.request<{
      updateSomedayTask: SomedayTask;
    }>(UPDATE_TASK, input);
    return data.updateSomedayTask;
  },

  async toggleTask(id: number): Promise<SomedayTask> {
    const data = await graphqlClient.request<{
      toggleSomedayTask: SomedayTask;
    }>(TOGGLE_TASK, { id });
    return data.toggleSomedayTask;
  },

  async deleteTask(id: number): Promise<boolean> {
    const data = await graphqlClient.request<{ deleteSomedayTask: boolean }>(
      DELETE_TASK,
      { id }
    );
    return data.deleteSomedayTask;
  },
};
