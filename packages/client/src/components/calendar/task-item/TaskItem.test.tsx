import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from './TaskItem';
import type { Task } from './TaskItem.types';

describe('TaskItem', () => {
  const mockTask: Task = {
    id: '1',
    text: 'Test task',
    completed: false,
    date: new Date(),
  };

  it('renders task text', () => {
    render(<TaskItem task={mockTask} />);
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<TaskItem task={mockTask} onToggle={onToggle} />);

    const checkbox = screen.getByRole('button', { name: /mark as complete/i });
    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<TaskItem task={mockTask} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('shows completed state', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskItem task={completedTask} />);

    const checkbox = screen.getByRole('button', {
      name: /mark as incomplete/i,
    });
    expect(checkbox).toBeInTheDocument();
  });

  it('enters edit mode when task text is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} />);

    const taskText = screen.getByText('Test task');
    await user.click(taskText);

    expect(screen.getByDisplayValue('Test task')).toBeInTheDocument();
  });
});
