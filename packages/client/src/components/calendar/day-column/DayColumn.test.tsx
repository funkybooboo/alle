import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DayColumn } from './DayColumn';
import type { Task } from '../task-item/TaskItem.types';

describe('DayColumn', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      text: 'Task 1',
      completed: false,
      date: new Date(),
    },
    {
      id: '2',
      text: 'Task 2',
      completed: true,
      date: new Date(),
    },
  ];

  it('renders today label for current date', () => {
    render(<DayColumn date={new Date()} tasks={[]} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders tomorrow label for next day', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    render(<DayColumn date={tomorrow} tasks={[]} />);
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
  });

  it('renders all tasks', () => {
    render(<DayColumn date={new Date()} tasks={mockTasks} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(<DayColumn date={new Date()} tasks={[]} />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('calls onAddTask when new task is added', async () => {
    const user = userEvent.setup();
    const onAddTask = vi.fn();
    render(<DayColumn date={new Date()} tasks={[]} onAddTask={onAddTask} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await user.type(input, 'New task');
    await user.keyboard('{Enter}');

    expect(onAddTask).toHaveBeenCalledWith('New task');
  });
});
