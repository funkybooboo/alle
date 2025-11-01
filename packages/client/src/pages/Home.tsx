import { useState, useCallback, useEffect } from 'react';
import { Navbar } from '../components/navbar/Navbar';
import { CalendarView } from '../components/calendar/calendar-view/CalendarView';
import type { Task } from '../components/calendar/task-item/TaskItem.types';
import { taskAPI } from '../api/task-api';

export const Home = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await taskAPI.getAllTasks();
        setTasks(fetchedTasks);
        setError(null);
      } catch (err) {
        setError('Failed to load tasks');
        console.error('Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Navigation handlers
  const handleNavigateToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleNavigatePrevDay = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, []);

  const handleNavigateNextDay = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  }, []);

  const handleNavigatePrevWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  const handleNavigateNextWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  // Task handlers
  const handleAddTask = useCallback(async (date: Date, text: string) => {
    try {
      const newTask = await taskAPI.createTask(text, date);
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task');
    }
  }, []);

  const handleToggleTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      try {
        const updatedTask = await taskAPI.updateTask(taskId, {
          completed: !task.completed,
        });
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );
      } catch (err) {
        console.error('Error toggling task:', err);
        setError('Failed to update task');
      }
    },
    [tasks]
  );

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  }, []);

  const handleEditTask = useCallback(
    async (taskId: string, newText: string) => {
      try {
        const updatedTask = await taskAPI.updateTask(taskId, {
          text: newText,
        });
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );
      } catch (err) {
        console.error('Error editing task:', err);
        setError('Failed to update task');
      }
    },
    []
  );

  return (
    <div className="h-screen flex flex-col">
      <Navbar
        currentDate={currentDate}
        onNavigateToday={handleNavigateToday}
        onNavigatePrevDay={handleNavigatePrevDay}
        onNavigateNextDay={handleNavigateNextDay}
        onNavigatePrevWeek={handleNavigatePrevWeek}
        onNavigateNextWeek={handleNavigateNextWeek}
      />
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading tasks...</div>
          </div>
        ) : (
          <CalendarView
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            startDate={currentDate}
            numDays={7}
          />
        )}
      </div>
    </div>
  );
};
