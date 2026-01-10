import { useState, useCallback, useEffect, useRef } from 'react';
import { Navbar } from '../components/navbar/Navbar';
import { CalendarView } from '../components/calendar/calendar-view/CalendarView';
import { SearchPanel } from '../components/search/SearchPanel';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { CalendarPanel } from '../components/calendar-picker/CalendarPanel';
import { TrashPanel } from '../components/trash/TrashPanel';
import { HelpPanel } from '../components/help/HelpPanel';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ColumnControls } from '../components/column-controls/ColumnControls';
import { SomedayDrawer } from '../components/drawer/SomedayDrawer';
import { NotificationContainer } from '../components/notifications/NotificationContainer';
import type { Task } from '../components/calendar/task-item/TaskItem.types';
import type { UserSettings } from '../types/settings.types';
import { DEFAULT_SETTINGS } from '../types/settings.types';
import type { SomedayList, SomedayTask } from '../types/someday.types';
import { PREDEFINED_LISTS } from '../types/someday.types';
import type { TrashItem } from '../types/trash.types';
import { taskAPI } from '../api/task-api';
import { settingsAPI } from '../api/settings-api';
import { somedayAPI } from '../api/someday-api';
import { trashAPI } from '../api/trash-api';
import { useNotifications } from '../hooks/useNotifications';

export const Home = () => {
  // Initialize with today's date at midnight for the center of the 5-day view
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [somedayLists, setSomedayLists] = useState<SomedayList[]>([]);
  const [somedayTasks, setSomedayTasks] = useState<SomedayTask[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [numDays, setNumDays] = useState(5);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const { notifications, dismissNotification, success, error: notifyError } = useNotifications();
  const hasInitialized = useRef(false);

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

  // Load tasks and someday data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedTasks, fetchedLists, fetchedSomedayTasks, fetchedTrash] = await Promise.all([
          taskAPI.getAllTasks(),
          somedayAPI.getAllLists(),
          somedayAPI.getAllTasks(),
          trashAPI.getAllTrash(),
        ]);

        setTasks(fetchedTasks);
        setSomedayLists(fetchedLists);
        setSomedayTasks(fetchedSomedayTasks);
        setTrash(fetchedTrash);

        // Create predefined lists if they don't exist (only once to prevent duplicates in StrictMode)
        if (!hasInitialized.current) {
          hasInitialized.current = true;
          const listNames = fetchedLists.map(l => l.name);
          const predefinedNames = Object.values(PREDEFINED_LISTS);
          for (let i = 0; i < predefinedNames.length; i++) {
            if (!listNames.includes(predefinedNames[i])) {
              await somedayAPI.createList({ name: predefinedNames[i], position: i });
            }
          }

          // Reload lists after creating predefined ones
          const updatedLists = await somedayAPI.getAllLists();
          setSomedayLists(updatedLists);
        }
      } catch (err) {
        notifyError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [notifyError]);

  // Navigation handlers
  const handleNavigateToday = useCallback(() => {
    const today = new Date();
    if (settings.todayShowsPrevious) {
      // Show previous day before today
      today.setDate(today.getDate() - 1);
    }
    setCurrentDate(today);
  }, [settings.todayShowsPrevious]);

  const handleNavigateToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

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
      success('Task created');
    } catch (err) {
      console.error('Error creating task:', err);
      notifyError('Failed to create task');
    }
  }, [success, notifyError]);

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
        notifyError('Failed to update task');
      }
    },
    [tasks, notifyError]
  );

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Move task to trash
      const trashItem = await trashAPI.createTrashItem({
        taskId: task.id,
        taskText: task.text,
        taskDate: task.date,
        taskCompleted: task.completed,
        taskType: 'calendar',
      });
      setTrash((prev) => [...prev, trashItem]);

      // Delete the task
      await taskAPI.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      success('Task moved to trash');
    } catch (err) {
      console.error('Error deleting task:', err);
      notifyError('Failed to delete task');
    }
  }, [tasks, success, notifyError]);

  const handleEditTask = useCallback(
    async (taskId: string, newText: string) => {
      try {
        const updatedTask = await taskAPI.updateTask(taskId, {
          text: newText,
        });
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );
        success('Task updated');
      } catch (err) {
        console.error('Error editing task:', err);
        notifyError('Failed to update task');
      }
    },
    [success, notifyError]
  );

  // Search handler
  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  // Calendar handler
  const handleCalendarToggle = useCallback(() => {
    setIsCalendarOpen((prev) => !prev);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setCurrentDate(date);
    setIsCalendarOpen(false);
  }, []);

  // Drawer handlers
  const handleDrawerToggle = useCallback(async () => {
    const newIsOpen = !settings.drawerIsOpen;
    const updatedSettings = await settingsAPI.updateSettings({
      ...settings,
      drawerIsOpen: newIsOpen,
    });
    setSettings(updatedSettings);
  }, [settings]);

  const handleDrawerHeightChange = useCallback(async (newHeight: number) => {
    const updatedSettings = await settingsAPI.updateSettings({
      ...settings,
      drawerHeight: newHeight,
    });
    setSettings(updatedSettings);
  }, [settings]);

  // Someday list handlers
  const handleAddSomedayList = useCallback(async (name: string) => {
    try {
      const position = somedayLists.length > 0
        ? Math.max(...somedayLists.map(l => l.position)) + 1
        : 0;
      const newList = await somedayAPI.createList({ name, position });
      setSomedayLists((prev) => [...prev, newList]);
      success('List created');
    } catch (err) {
      console.error('Error creating someday list:', err);
      notifyError('Failed to create list');
    }
  }, [somedayLists, success, notifyError]);

  const handleEditSomedayList = useCallback(async (id: number, name: string) => {
    try {
      const updatedList = await somedayAPI.updateList({ id, name });
      setSomedayLists((prev) => prev.map((l) => (l.id === id ? updatedList : l)));
      success('List updated');
    } catch (err) {
      console.error('Error updating someday list:', err);
      notifyError('Failed to update list');
    }
  }, [success, notifyError]);

  const handleDeleteSomedayList = useCallback(async (id: number) => {
    try {
      await somedayAPI.deleteList(id);
      setSomedayLists((prev) => prev.filter((l) => l.id !== id));
      setSomedayTasks((prev) => prev.filter((t) => t.listId !== id));
      success('List deleted');
    } catch (err) {
      console.error('Error deleting someday list:', err);
      notifyError('Failed to delete list');
    }
  }, [success, notifyError]);

  // Someday task handlers
  const handleAddSomedayTask = useCallback(async (listId: number, title: string, description?: string) => {
    try {
      const listTasks = somedayTasks.filter(t => t.listId === listId);
      const position = listTasks.length > 0
        ? Math.max(...listTasks.map(t => t.position)) + 1
        : 0;
      const newTask = await somedayAPI.createTask({ listId, title, description, position });
      setSomedayTasks((prev) => [...prev, newTask]);
      success('Task created');
    } catch (err) {
      console.error('Error creating someday task:', err);
      notifyError('Failed to create task');
    }
  }, [somedayTasks, success, notifyError]);

  const handleToggleSomedayTask = useCallback(async (id: number) => {
    try {
      const updatedTask = await somedayAPI.toggleTask(id);
      setSomedayTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err) {
      console.error('Error toggling someday task:', err);
      notifyError('Failed to toggle task');
    }
  }, [notifyError]);

  const handleDeleteSomedayTask = useCallback(async (id: number) => {
    try {
      const task = somedayTasks.find((t) => t.id === id);
      if (!task) return;

      // Move task to trash
      const trashItem = await trashAPI.createTrashItem({
        taskId: task.id.toString(),
        taskText: task.title,
        taskDate: new Date().toISOString(),
        taskCompleted: task.completed,
        taskType: 'someday',
        somedayListId: task.listId,
      });
      setTrash((prev) => [...prev, trashItem]);

      // Delete the task
      await somedayAPI.deleteTask(id);
      setSomedayTasks((prev) => prev.filter((t) => t.id !== id));
      success('Task moved to trash');
    } catch (err) {
      console.error('Error deleting someday task:', err);
      notifyError('Failed to delete task');
    }
  }, [somedayTasks, success, notifyError]);

  const handleEditSomedayTask = useCallback(async (id: number, title: string, description?: string) => {
    try {
      const updatedTask = await somedayAPI.updateTask({ id, title, description });
      setSomedayTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      success('Task updated');
    } catch (err) {
      console.error('Error updating someday task:', err);
      notifyError('Failed to update task');
    }
  }, [success, notifyError]);

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
      success('Settings saved');
    } catch (err) {
      console.error('Error saving settings:', err);
      notifyError('Failed to save settings');
    }
  }, [success, notifyError]);

  // Trash handlers
  const handleTrashToggle = useCallback(() => {
    setIsTrashOpen((prev) => !prev);
  }, []);

  const handleRestoreTask = useCallback(async (item: TrashItem) => {
    try {
      if (item.taskType === 'calendar') {
        // Restore calendar task
        const newTask = await taskAPI.createTask(item.taskText, new Date(item.taskDate));
        setTasks((prev) => [...prev, newTask]);
      } else if (item.taskType === 'someday' && item.somedayListId) {
        // Restore someday task
        const listTasks = somedayTasks.filter(t => t.listId === item.somedayListId);
        const position = listTasks.length > 0
          ? Math.max(...listTasks.map(t => t.position)) + 1
          : 0;
        const newTask = await somedayAPI.createTask({
          listId: item.somedayListId,
          title: item.taskText,
          position,
        });
        setSomedayTasks((prev) => [...prev, newTask]);
      }

      // Remove from trash
      await trashAPI.deleteTrashItem(item.id);
      setTrash((prev) => prev.filter((t) => t.id !== item.id));
      success('Task restored');
    } catch (err) {
      console.error('Error restoring task:', err);
      notifyError('Failed to restore task');
    }
  }, [somedayTasks, success, notifyError]);

  const handlePermanentDelete = useCallback(async (id: number) => {
    try {
      await trashAPI.deleteTrashItem(id);
      setTrash((prev) => prev.filter((t) => t.id !== id));
      success('Task permanently deleted');
    } catch (err) {
      console.error('Error permanently deleting task:', err);
      notifyError('Failed to delete task');
    }
  }, [success, notifyError]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Navigation shortcuts
      if (e.key === 'h' || e.key === 'ArrowLeft') {
        if (e.shiftKey) {
          e.preventDefault();
          handleNavigatePrevWeek();
        } else {
          e.preventDefault();
          handleNavigatePrevDay();
        }
        return;
      }

      if (e.key === 'l' || e.key === 'ArrowRight') {
        if (e.shiftKey) {
          e.preventDefault();
          handleNavigateNextWeek();
        } else {
          e.preventDefault();
          handleNavigateNextDay();
        }
        return;
      }

      if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleNavigateToday();
        return;
      }

      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsCalendarOpen((prev) => !prev);
        return;
      }

      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleDrawerToggle();
        return;
      }

      if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }

      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsTrashOpen((prev) => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleDecreaseColumns();
        return;
      }

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleIncreaseColumns();
        return;
      }

      if (e.key === 'a' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleToggleAuto();
        return;
      }

      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsCalendarOpen(false);
        setIsSettingsOpen(false);
        setIsTrashOpen(false);
        setIsHelpOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNavigateToday,
    handleNavigatePrevDay,
    handleNavigateNextDay,
    handleNavigatePrevWeek,
    handleNavigateNextWeek,
    handleDrawerToggle,
    handleDecreaseColumns,
    handleIncreaseColumns,
    handleToggleAuto,
  ]);

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
        onCalendarToggle={handleCalendarToggle}
      />
      <div className="flex-1 overflow-hidden w-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-500">Loading your tasks...</p>
            </div>
          ) : isSearchOpen ? (
            <SearchPanel
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onClose={() => setIsSearchOpen(false)}
            />
          ) : isCalendarOpen ? (
            <CalendarPanel
              currentDate={currentDate}
              onSelectDate={handleSelectDate}
              onClose={() => setIsCalendarOpen(false)}
            />
          ) : isSettingsOpen ? (
            <SettingsPanel
              settings={settings}
              onSave={handleSaveSettings}
              onClose={() => setIsSettingsOpen(false)}
            />
          ) : isTrashOpen ? (
            <TrashPanel
              trash={trash}
              onRestore={handleRestoreTask}
              onPermanentDelete={handlePermanentDelete}
              onClose={() => setIsTrashOpen(false)}
            />
          ) : isHelpOpen ? (
            <HelpPanel onClose={() => setIsHelpOpen(false)} />
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
              onNavigatePrev={handleNavigatePrevDay}
              onNavigateNext={handleNavigateNextDay}
            />
          )}
        </div>
        {!isSearchOpen && !isCalendarOpen && !isSettingsOpen && !isTrashOpen && !isHelpOpen && (
          <SomedayDrawer
            lists={somedayLists}
            tasks={somedayTasks}
            height={settings.drawerHeight}
            isOpen={settings.drawerIsOpen}
            onHeightChange={handleDrawerHeightChange}
            onToggle={handleDrawerToggle}
            onAddList={handleAddSomedayList}
            onEditList={handleEditSomedayList}
            onDeleteList={handleDeleteSomedayList}
            onAddTask={handleAddSomedayTask}
            onToggleTask={handleToggleSomedayTask}
            onDeleteTask={handleDeleteSomedayTask}
            onEditTask={handleEditSomedayTask}
          />
        )}
      </div>
      {!isSearchOpen && !isCalendarOpen && !isSettingsOpen && !isTrashOpen && !isHelpOpen && (
        <ColumnControls
          numDays={numDays}
          isAutoMode={isAutoMode}
          onDecrease={handleDecreaseColumns}
          onIncrease={handleIncreaseColumns}
          onToggleAuto={handleToggleAuto}
          onOpenSettings={handleOpenSettings}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenTrash={handleTrashToggle}
        />
      )}
      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
};
