import type { Task } from '../../components/calendar/task-item/TaskItem.types';

export const mockTasks: Task[] = [
  {
    id: '1',
    text: 'Morning workout',
    completed: true,
    date: new Date('2025-11-01T08:00:00Z'),
  },
  {
    id: '2',
    text: 'Team standup',
    completed: false,
    date: new Date('2025-11-01T10:00:00Z'),
  },
  {
    id: '3',
    text: 'Code review',
    completed: false,
    date: new Date('2025-11-01T14:00:00Z'),
  },
  {
    id: '4',
    text: 'Dentist appointment',
    completed: false,
    date: new Date('2025-11-02T15:00:00Z'),
  },
  {
    id: '5',
    text: 'Buy groceries',
    completed: false,
    date: new Date('2025-11-02T18:00:00Z'),
  },
];

export const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: '999',
  text: 'Test task',
  completed: false,
  date: new Date(),
  ...overrides,
});
