export interface SomedayList {
  id: number;
  name: string;
  position: number;
}

export interface SomedayTask {
  id: number;
  listId: number;
  title: string;
  description?: string;
  completed: boolean;
  position: number;
}

export interface CreateSomedayListInput {
  name: string;
  position: number;
}

export interface UpdateSomedayListInput {
  id: number;
  name?: string;
  position?: number;
}

export interface CreateSomedayTaskInput {
  listId: number;
  title: string;
  description?: string;
  position: number;
}

export interface UpdateSomedayTaskInput {
  id: number;
  title?: string;
  description?: string;
  completed?: boolean;
  position?: number;
  listId?: number;
}

// Predefined list names
export const PREDEFINED_LISTS = {
  IDEAS: 'Ideas',
  PROJECTS: 'Projects',
  BACKLOG: 'Backlog',
} as const;
