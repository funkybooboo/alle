import { useState, useCallback, useEffect } from 'react';
import { taskAPI } from '../../api/task-api';
import { settingsAPI } from '../../api/settings-api';
import { trashAPI } from '../../api/trash-api';
import type { Task } from '../../components/calendar/task-item/TaskItem.types';
import type { UserSettings } from '../../types/settings.types';
import { DEFAULT_SETTINGS } from '../../types/settings.types';
import type { TrashItem } from '../../types/trash.types';
import { useNotifications } from '../useNotifications';

export const useHomeState = () => {
  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // View State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [numDays, setNumDays] = useState(5);
  const [isAutoMode, setIsAutoMode] = useState(true);

  // Modal/Panel State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const { success, error: notifyError } = useNotifications();

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedTasks, fetchedTrash, fetchedSettings] = await Promise.all(
          [
            taskAPI.getAllTasks(),
            trashAPI.getAllTrash(),
            settingsAPI.getSettings(),
          ]
        );

        setTasks(fetchedTasks);
        setTrash(fetchedTrash);
        setSettings(fetchedSettings);
      } catch (err) {
        console.error('Error loading data:', err);
        notifyError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [notifyError]);

  // Settings Effects
  useEffect(() => {
    const root = document.documentElement;

    // Theme
    if (settings.theme === 'DARK') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Font Size
    let fontSize = '16px';
    switch (settings.fontSize) {
      case 'small':
        fontSize = '14px';
        break;
      case 'medium':
        fontSize = '16px';
        break;
      case 'large':
        fontSize = '18px';
        break;
    }
    root.style.setProperty('--font-size-base', fontSize);

    // Font Type
    let fontFamily = 'ui-sans-serif, system-ui, sans-serif';
    switch (settings.fontType) {
      case 'serif':
        fontFamily =
          'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
        break;
      case 'mono':
        fontFamily =
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        break;
      case 'opendyslexic':
        fontFamily = '"OpenDyslexic", sans-serif';
        break;
      case 'sans':
      default:
        fontFamily =
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    }
    root.style.setProperty('--font-family-base', fontFamily);
  }, [settings.theme, settings.fontSize, settings.fontType]);

  // Auto Columns Effect
  useEffect(() => {
    const calculateNumDays = () => {
      if (!isAutoMode) return;

      const width = window.innerWidth;
      const { autoColumnBreakpoints, autoColumnCounts } = settings;

      if (width < autoColumnBreakpoints.small)
        setNumDays(autoColumnCounts.small);
      else if (width < autoColumnBreakpoints.medium)
        setNumDays(autoColumnCounts.medium);
      else if (width < autoColumnBreakpoints.large)
        setNumDays(autoColumnCounts.large);
      else if (width < autoColumnBreakpoints.xlarge)
        setNumDays(autoColumnCounts.xlarge);
      else setNumDays(autoColumnCounts.xxlarge);
    };

    calculateNumDays();
    window.addEventListener('resize', calculateNumDays);
    return () => window.removeEventListener('resize', calculateNumDays);
  }, [isAutoMode, settings]);

  // --- Handlers ---

  // Navigation
  const handleNavigateToday = useCallback(() => {
    const today = new Date();
    if (settings.todayShowsPrevious) {
      today.setDate(today.getDate() - 1);
    }
    setCurrentDate(today);
  }, [settings.todayShowsPrevious]);

  const navigateDate = useCallback((days: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  }, []);

  // Tasks
  const handleAddTask = useCallback(
    async (date: Date, text: string) => {
      try {
        const newTask = await taskAPI.createTask(text, date);
        setTasks((prev) => [...prev, newTask]);
        success('Task created');
      } catch (err) {
        console.error(err);
        notifyError('Failed to create task');
      }
    },
    [success, notifyError]
  );

  const handleToggleTask = useCallback(
    async (taskId: string) => {
      // Optimistic update could go here, but for now we wait for server
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
        console.error(err);
        notifyError('Failed to update task');
      }
    },
    [tasks, notifyError]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      try {
        const trashItem = await trashAPI.createTrashItem({
          taskId: task.id,
          taskText: task.text,
          taskDate:
            typeof task.date === 'string'
              ? task.date
              : (task.date as Date).toISOString(),
          taskCompleted: task.completed,
          taskType: 'calendar',
        });
        setTrash((prev) => [...prev, trashItem]);
        await taskAPI.deleteTask(taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        success('Task moved to trash');
      } catch (err) {
        console.error(err);
        notifyError('Failed to delete task');
      }
    },
    [tasks, success, notifyError]
  );

  const handleEditTask = useCallback(
    async (taskId: string, newText: string) => {
      try {
        const updatedTask = await taskAPI.updateTask(taskId, { text: newText });
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );
        success('Task updated');
      } catch (err) {
        console.error(err);
        notifyError('Failed to update task');
      }
    },
    [success, notifyError]
  );

  // Trash
  const handleRestoreTask = useCallback(
    async (item: TrashItem) => {
      try {
        if (item.taskType === 'calendar') {
          const newTask = await taskAPI.createTask(
            item.taskText,
            new Date(item.taskDate)
          );
          setTasks((prev) => [...prev, newTask]);
        }
        await trashAPI.deleteTrashItem(item.id);
        setTrash((prev) => prev.filter((t) => t.id !== item.id));
        success('Task restored');
      } catch (err) {
        console.error(err);
        notifyError('Failed to restore task');
      }
    },
    [success, notifyError]
  );

  const handlePermanentDelete = useCallback(
    async (id: number) => {
      try {
        await trashAPI.deleteTrashItem(id);
        setTrash((prev) => prev.filter((t) => t.id !== id));
        success('Task permanently deleted');
      } catch (err) {
        console.error(err);
        notifyError('Failed to delete task');
      }
    },
    [success, notifyError]
  );

  // Settings
  const handleSaveSettings = useCallback(
    async (newSettings: UserSettings) => {
      try {
        const updatedSettings = await settingsAPI.updateSettings(newSettings);
        setSettings(updatedSettings);
        success('Settings saved');
      } catch (err) {
        console.error(err);
        notifyError('Failed to save settings');
      }
    },
    [success, notifyError]
  );

  const handleToggleTheme = useCallback(async () => {
    try {
      const newTheme = settings.theme === 'LIGHT' ? 'DARK' : 'LIGHT';
      const updatedSettings = await settingsAPI.updateSettings({
        theme: newTheme,
      });
      setSettings(updatedSettings);
    } catch (err) {
      console.error(err);
      notifyError('Failed to toggle theme');
    }
  }, [settings.theme, notifyError]);

  // Column Controls
  const handleDecreaseColumns = useCallback(() => {
    if (numDays > 1) {
      setNumDays((prev) => prev - 1);
      setIsAutoMode(false);
    }
  }, [numDays]);

  const handleIncreaseColumns = useCallback(() => {
    setNumDays((prev) => prev + 1);
    setIsAutoMode(false);
  }, []);

  return {
    // State
    tasks,
    trash,
    settings,
    loading,
    currentDate,
    numDays,
    isAutoMode,
    // Panels
    isSearchOpen,
    setIsSearchOpen,
    isCalendarOpen,
    setIsCalendarOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isTrashOpen,
    setIsTrashOpen,
    isHelpOpen,
    setIsHelpOpen,
    // Handlers
    setCurrentDate,
    handleNavigateToday,
    navigateDate,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
    handleEditTask,
    handleRestoreTask,
    handlePermanentDelete,
    handleSaveSettings,
    handleToggleTheme,
    handleDecreaseColumns,
    handleIncreaseColumns,
    setIsAutoMode,
  };
};
