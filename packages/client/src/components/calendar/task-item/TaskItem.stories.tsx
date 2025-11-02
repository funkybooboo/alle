import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TaskItem } from './TaskItem';

const meta = {
  title: 'Components/Calendar/TaskItem',
  component: TaskItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    task: {
      description: 'Task object with id, text, completed status, and date',
    },
    onToggle: {
      description: 'Callback when task completion is toggled',
      action: 'toggled',
    },
    onDelete: {
      description: 'Callback when task is deleted',
      action: 'deleted',
    },
    onEdit: {
      description: 'Callback when task text is edited',
      action: 'edited',
    },
  },
  args: {
    onToggle: fn(),
    onDelete: fn(),
    onEdit: fn(),
  },
} satisfies Meta<typeof TaskItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    task: {
      id: '1',
      text: 'Buy groceries',
      completed: false,
      date: new Date(),
    },
  },
};

export const Completed: Story = {
  args: {
    task: {
      id: '2',
      text: 'Finish project documentation',
      completed: true,
      date: new Date(),
    },
  },
};

export const LongText: Story = {
  args: {
    task: {
      id: '3',
      text: 'This is a very long task description that might wrap to multiple lines and we need to see how it looks in the UI',
      completed: false,
      date: new Date(),
    },
  },
};

export const Multiple: Story = {
  args: {
    task: {
      id: '1',
      text: 'Example task',
      completed: false,
      date: new Date(),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple tasks displayed in a list',
      },
    },
  },
  render: () => (
    <div className="max-w-md">
      <TaskItem
        task={{
          id: '1',
          text: 'Morning workout',
          completed: true,
          date: new Date(),
        }}
        onToggle={fn()}
        onDelete={fn()}
        onEdit={fn()}
      />
      <TaskItem
        task={{
          id: '2',
          text: 'Team meeting at 10 AM',
          completed: false,
          date: new Date(),
        }}
        onToggle={fn()}
        onDelete={fn()}
        onEdit={fn()}
      />
      <TaskItem
        task={{
          id: '3',
          text: 'Review pull requests',
          completed: false,
          date: new Date(),
        }}
        onToggle={fn()}
        onDelete={fn()}
        onEdit={fn()}
      />
      <TaskItem
        task={{
          id: '4',
          text: 'Lunch with client',
          completed: true,
          date: new Date(),
        }}
        onToggle={fn()}
        onDelete={fn()}
        onEdit={fn()}
      />
    </div>
  ),
};
