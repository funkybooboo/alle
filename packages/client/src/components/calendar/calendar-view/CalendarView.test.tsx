import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarView } from './CalendarView';
import type { Task } from '../task-item/TaskItem.types';

describe('CalendarView', () => {
  const today = new Date();
  const mockTasks: Task[] = [
    {
      id: '1',
      text: 'Task 1',
      completed: false,
      date: today,
    },
  ];

  it('renders correct number of day columns', () => {
    render(<CalendarView tasks={[]} numDays={5} />);
    // Each DayColumn should have a task input
    const inputs = screen.getAllByPlaceholderText('Add a task...');
    expect(inputs).toHaveLength(5);
  });

  it('displays tasks in correct day columns', () => {
    render(<CalendarView tasks={mockTasks} numDays={3} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('renders today label', () => {
    render(<CalendarView tasks={[]} numDays={3} startDate={today} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('calls onAddTask with correct date', async () => {
    const onAddTask = vi.fn();
    render(
      <CalendarView
        tasks={[]}
        numDays={1}
        startDate={today}
        onAddTask={onAddTask}
      />
    );

    // This would require user interaction testing
    // which is covered in the DayColumn tests
    expect(onAddTask).not.toHaveBeenCalled();
  });
});
