import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CalendarView } from './CalendarView';
import type { Task } from '../task-item/TaskItem.types';

const meta = {
  title: 'Components/Calendar/CalendarView',
  component: CalendarView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    tasks: {
      description: 'Array of all tasks',
    },
    onAddTask: {
      action: 'task added',
    },
    onToggleTask: {
      action: 'task toggled',
    },
    onDeleteTask: {
      action: 'task deleted',
    },
    onEditTask: {
      action: 'task edited',
    },
    startDate: {
      control: 'date',
      description: 'Starting date for the calendar view',
    },
    numDays: {
      control: { type: 'number', min: 1, max: 14 },
      description: 'Number of days to display',
    },
  },
  args: {
    onAddTask: fn(),
    onToggleTask: fn(),
    onDeleteTask: fn(),
    onEditTask: fn(),
  },
} satisfies Meta<typeof CalendarView>;

export default meta;
type Story = StoryObj<typeof meta>;

const generateSampleTasks = (): Task[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  return [
    {
      id: '1',
      text: 'Morning workout',
      completed: true,
      date: today,
    },
    {
      id: '2',
      text: 'Team standup',
      completed: false,
      date: today,
    },
    {
      id: '3',
      text: 'Code review',
      completed: false,
      date: today,
    },
    {
      id: '4',
      text: 'Dentist appointment',
      completed: false,
      date: tomorrow,
    },
    {
      id: '5',
      text: 'Buy groceries',
      completed: false,
      date: tomorrow,
    },
    {
      id: '6',
      text: 'Team planning meeting',
      completed: false,
      date: dayAfter,
    },
    {
      id: '7',
      text: 'Update documentation',
      completed: true,
      date: dayAfter,
    },
  ];
};

export const Default: Story = {
  args: {
    tasks: generateSampleTasks(),
    numDays: 7,
  },
};

export const ThreeDays: Story = {
  args: {
    tasks: generateSampleTasks(),
    numDays: 3,
  },
};

export const FiveDays: Story = {
  args: {
    tasks: generateSampleTasks(),
    numDays: 5,
  },
};

export const Empty: Story = {
  args: {
    tasks: [],
    numDays: 7,
  },
};

export const ManyTasks: Story = {
  args: {
    tasks: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + (i % 7));
      return {
        id: `${i}`,
        text: `Task ${i + 1}`,
        completed: i % 3 === 0,
        date,
      };
    }),
    numDays: 7,
  },
};
