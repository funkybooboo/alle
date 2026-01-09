import { useState, useCallback, useEffect } from 'react';
import { Navbar } from '../components/navbar/Navbar';
import { CalendarView } from '../components/calendar/calendar-view/CalendarView';
import { SearchPanel } from '../components/search/SearchPanel';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { ColumnControls } from '../components/column-controls/ColumnControls';
import type { Task } from '../components/calendar/task-item/TaskItem.types';
import type { UserSettings } from '../types/settings.types';
import { DEFAULT_SETTINGS } from '../types/settings.types';
import { taskAPI } from '../api/task-api';
import { settingsAPI } from '../api/settings-api';

export const Home = () => {
  // Initialize with today's date at midnight for the center of the 5-day view
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [numDays, setNumDays] = useState(5);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const fetchedSettings = await settingsAPI.getSettings();
        setSettings(fetchedSettings);
      } catch (err) {
        console.error('Error loading settings:', err);
        // Will use DEFAULT_SETTINGS
      }
    };

    loadSettings();
  }, []);

  // Calculate number of days based on window width (only in auto mode)
  useEffect(() => {
    const calculateNumDays = () => {
      if (!isAutoMode) return; // Skip if in manual mode

      const width = window.innerWidth;
      const { autoColumnBreakpoints, autoColumnCounts } = settings;

      if (width < autoColumnBreakpoints.small) {
        setNumDays(autoColumnCounts.small);
      } else if (width < autoColumnBreakpoints.medium) {
        setNumDays(autoColumnCounts.medium);
      } else if (width < autoColumnBreakpoints.large) {
        setNumDays(autoColumnCounts.large);
      } else if (width < autoColumnBreakpoints.xlarge) {
        setNumDays(autoColumnCounts.xlarge);
      } else {
        setNumDays(autoColumnCounts.xxlarge);
      }
    };

    // Calculate on mount
    calculateNumDays();

    // Recalculate on window resize
    window.addEventListener('resize', calculateNumDays);
    return () => window.removeEventListener('resize', calculateNumDays);
  }, [isAutoMode, settings]);

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
    const today = new Date();
    if (settings.todayShowsPrevious) {
      // Show previous day before today
      today.setDate(today.getDate() - 1);
    }
    setCurrentDate(today);
  }, [settings.todayShowsPrevious]);

  const handleNavigatePrevDay = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - settings.singleArrowDays);
      return newDate;
    });
  }, [settings.singleArrowDays]);

  const handleNavigateNextDay = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + settings.singleArrowDays);
      return newDate;
    });
  }, [settings.singleArrowDays]);

  const handleNavigatePrevWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - settings.doubleArrowDays);
      return newDate;
    });
  }, [settings.doubleArrowDays]);

  const handleNavigateNextWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + settings.doubleArrowDays);
      return newDate;
    });
  }, [settings.doubleArrowDays]);

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

  // Search handler
  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  // Column control handlers
  const handleDecreaseColumns = useCallback(() => {
    if (numDays > 1) {
      setNumDays((prev) => prev - 1);
      setIsAutoMode(false); // Switch to manual mode
    }
  }, [numDays]);

  const handleIncreaseColumns = useCallback(() => {
    setNumDays((prev) => prev + 1);
    setIsAutoMode(false); // Switch to manual mode
  }, []);

  const handleToggleAuto = useCallback(() => {
    setIsAutoMode((prev) => !prev);
  }, []);

  // Settings handlers
  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleSaveSettings = useCallback(async (newSettings: UserSettings) => {
    try {
      const updatedSettings = await settingsAPI.updateSettings(newSettings);
      setSettings(updatedSettings);
      setError(null);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    }
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Navbar
        currentDate={currentDate}
        onNavigateToday={handleNavigateToday}
        onNavigatePrevDay={handleNavigatePrevDay}
        onNavigateNextDay={handleNavigateNextDay}
        onNavigatePrevWeek={handleNavigatePrevWeek}
        onNavigateNextWeek={handleNavigateNextWeek}
        onSearchToggle={handleSearchToggle}
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
      <div className="flex-1 overflow-hidden w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading tasks...</div>
          </div>
        ) : isSearchOpen ? (
          <SearchPanel
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onClose={() => setIsSearchOpen(false)}
          />
        ) : isSettingsOpen ? (
          <SettingsPanel
            settings={settings}
            onSave={handleSaveSettings}
            onClose={() => setIsSettingsOpen(false)}
          />
        ) : (
          <CalendarView
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            startDate={currentDate}
            numDays={numDays}
            columnMinWidth={settings.columnMinWidth}
          />
        )}
      </div>
      {!isSearchOpen && !isSettingsOpen && (
        <ColumnControls
          numDays={numDays}
          isAutoMode={isAutoMode}
          onDecrease={handleDecreaseColumns}
          onIncrease={handleIncreaseColumns}
          onToggleAuto={handleToggleAuto}
          onOpenSettings={handleOpenSettings}
        />
      )}
    </div>
  );
};
