import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DayColumn } from './DayColumn';
import type { Task } from '../task-item/TaskItem.types';

const meta = {
  title: 'Components/Calendar/DayColumn',
  component: DayColumn,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    date: {
      control: 'date',
      description: 'The date for this column',
    },
    tasks: {
      description: 'Array of tasks for this day',
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
  },
  args: {
    onAddTask: fn(),
    onToggleTask: fn(),
    onDeleteTask: fn(),
    onEditTask: fn(),
  },
} satisfies Meta<typeof DayColumn>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTasks: Task[] = [
  {
    id: '1',
    text: 'Morning workout',
    completed: true,
    date: new Date(),
  },
  {
    id: '2',
    text: 'Team standup meeting',
    completed: false,
    date: new Date(),
  },
  {
    id: '3',
    text: 'Review pull requests',
    completed: false,
    date: new Date(),
  },
];

export const Today: Story = {
  args: {
    date: new Date(),
    tasks: sampleTasks,
  },
};

export const Tomorrow: Story = {
  args: {
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    tasks: [
      {
        id: '1',
        text: 'Dentist appointment',
        completed: false,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    ],
  },
};

export const FutureDate: Story = {
  args: {
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    tasks: [
      {
        id: '1',
        text: 'Prepare presentation',
        completed: false,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        text: 'Book flight tickets',
        completed: false,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    date: new Date(),
    tasks: [],
  },
};

export const ManyTasks: Story = {
  args: {
    date: new Date(),
    tasks: Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      text: `Task ${i + 1}`,
      completed: i % 3 === 0,
      date: new Date(),
    })),
  },
};
