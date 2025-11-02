import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskInput } from './TaskInput';

describe('TaskInput', () => {
  it('renders with placeholder', () => {
    render(<TaskInput onAdd={vi.fn()} placeholder="Add task" />);
    expect(screen.getByPlaceholderText('Add task')).toBeInTheDocument();
  });

  it('calls onAdd when form is submitted', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TaskInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await user.type(input, 'New task');
    await user.keyboard('{Enter}');

    expect(onAdd).toHaveBeenCalledWith('New task');
  });

  it('clears input after submission', async () => {
    const user = userEvent.setup();
    render(<TaskInput onAdd={vi.fn()} />);

    const input = screen.getByPlaceholderText(
      'Add a task...'
    ) as HTMLInputElement;
    await user.type(input, 'New task');
    await user.keyboard('{Enter}');

    expect(input.value).toBe('');
  });

  it('does not submit empty tasks', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TaskInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await user.type(input, '   ');
    await user.keyboard('{Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('clears input when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<TaskInput onAdd={vi.fn()} />);

    const input = screen.getByPlaceholderText(
      'Add a task...'
    ) as HTMLInputElement;
    await user.type(input, 'Some text');
    await user.keyboard('{Escape}');

    expect(input.value).toBe('');
  });
});
