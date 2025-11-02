import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TaskInput } from './TaskInput';

const meta = {
  title: 'Components/Calendar/TaskInput',
  component: TaskInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onAdd: {
      description: 'Callback when a new task is added',
      action: 'task added',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input field',
    },
  },
  args: {
    onAdd: fn(),
  },
} satisfies Meta<typeof TaskInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'What needs to be done?',
  },
};

export const InContext: Story = {
  render: () => (
    <div className="max-w-md border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg">Today</h3>
      </div>
      <TaskInput onAdd={fn()} placeholder="Add a task for today..." />
    </div>
  ),
};
