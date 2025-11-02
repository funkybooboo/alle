import type { Task } from '../../components/calendar/task-item/TaskItem.types';

// Get today's date at midnight for consistent date comparison
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Get tomorrow's date
const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

export const mockTasks: Task[] = [
  {
    id: '1',
    text: 'Morning workout',
    completed: true,
    date: new Date(getToday().setHours(8, 0, 0, 0)),
  },
  {
    id: '2',
    text: 'Team standup',
    completed: false,
    date: new Date(getToday().setHours(10, 0, 0, 0)),
  },
  {
    id: '3',
    text: 'Code review',
    completed: false,
    date: new Date(getToday().setHours(14, 0, 0, 0)),
  },
  {
    id: '4',
    text: 'Dentist appointment',
    completed: false,
    date: new Date(getTomorrow().setHours(15, 0, 0, 0)),
  },
  {
    id: '5',
    text: 'Buy groceries',
    completed: false,
    date: new Date(getTomorrow().setHours(18, 0, 0, 0)),
  },
];

export const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: '999',
  text: 'Test task',
  completed: false,
  date: new Date(),
  ...overrides,
});
