import { useEffect, useState } from 'react';
import { Navbar } from '../components/navbar/Navbar';
import { CalendarView } from '../components/calendar/calendar-view/CalendarView';
import { SearchPanel } from '../components/search/SearchPanel';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { CalendarPanel } from '../components/calendar-picker/CalendarPanel';
import { TrashPanel } from '../components/trash/TrashPanel';
import { HelpPanel } from '../components/help/HelpPanel';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ColumnControls } from '../components/column-controls/ColumnControls';
import { NotificationContainer } from '../components/notifications/NotificationContainer';
import TaskDetailModal from '../components/task-detail/TaskDetailModal';
import { useNotifications } from '../hooks/useNotifications';
import { useServerConnection } from '../hooks/useServerConnection';
import { useHomeState } from '../hooks/home/useHomeState';
import { matchesShortcut } from '../utils/keyboard';

export const Home = () => {
  const {
    tasks,
    trash,
    settings,
    loading,
    currentDate,
    numDays,
    isAutoMode,
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
  } = useHomeState();

  const { notifications, dismissNotification } = useNotifications();

  // Task detail modal state
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // Handler for viewing task details
  const handleViewTask = (taskId: string) => {
    setSelectedTaskId(parseInt(taskId, 10));
    setIsTaskDetailOpen(true);
  };

  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTaskId(null);
  };

  // Initialize server connection monitoring
  useServerConnection();

  // Keyboard Shortcuts - Using custom shortcuts from settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const shortcuts = settings.keyboardShortcuts;

      // Navigation
      if (matchesShortcut(e, shortcuts.navigatePrevDay)) {
        e.preventDefault();
        navigateDate(-settings.singleArrowDays);
        return;
      }
      if (matchesShortcut(e, shortcuts.navigateNextDay)) {
        e.preventDefault();
        navigateDate(settings.singleArrowDays);
        return;
      }
      if (matchesShortcut(e, shortcuts.navigatePrevWeek)) {
        e.preventDefault();
        navigateDate(-settings.doubleArrowDays);
        return;
      }
      if (matchesShortcut(e, shortcuts.navigateNextWeek)) {
        e.preventDefault();
        navigateDate(settings.doubleArrowDays);
        return;
      }
      if (matchesShortcut(e, shortcuts.navigateToday)) {
        e.preventDefault();
        handleNavigateToday();
        return;
      }

      // Panels
      if (matchesShortcut(e, shortcuts.toggleSearch)) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }
      if (matchesShortcut(e, shortcuts.toggleSettings)) {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
        return;
      }
      if (matchesShortcut(e, shortcuts.toggleTrash)) {
        e.preventDefault();
        setIsTrashOpen((prev) => !prev);
        return;
      }
      if (matchesShortcut(e, shortcuts.toggleCalendar)) {
        e.preventDefault();
        setIsCalendarOpen((prev) => !prev);
        return;
      }
      if (matchesShortcut(e, shortcuts.toggleHelp)) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      // View controls
      if (matchesShortcut(e, shortcuts.decreaseColumns)) {
        e.preventDefault();
        handleDecreaseColumns();
        return;
      }
      if (matchesShortcut(e, shortcuts.increaseColumns)) {
        e.preventDefault();
        handleIncreaseColumns();
        return;
      }
      if (matchesShortcut(e, shortcuts.toggleAutoMode)) {
        e.preventDefault();
        setIsAutoMode((prev: boolean) => !prev);
        return;
      }
      if (matchesShortcut(e, shortcuts.toggleTheme)) {
        e.preventDefault();
        handleToggleTheme();
        return;
      }

      // Close panels
      if (matchesShortcut(e, shortcuts.closePanel)) {
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
    navigateDate,
    handleNavigateToday,
    handleToggleTheme,
    handleDecreaseColumns,
    handleIncreaseColumns,
    setIsAutoMode,
    setIsCalendarOpen,
    setIsSearchOpen,
    setIsSettingsOpen,
    setIsTrashOpen,
    setIsHelpOpen,
    settings,
  ]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-white">
      <Navbar
        currentDate={currentDate}
        onNavigateToday={handleNavigateToday}
        onNavigatePrevDay={() => navigateDate(-settings.singleArrowDays)}
        onNavigateNextDay={() => navigateDate(settings.singleArrowDays)}
        onNavigatePrevWeek={() => navigateDate(-settings.doubleArrowDays)}
        onNavigateNextWeek={() => navigateDate(settings.doubleArrowDays)}
        onSearchToggle={() => setIsSearchOpen((prev) => !prev)}
        onCalendarToggle={() => setIsCalendarOpen((prev) => !prev)}
      />
      <div className="flex-1 overflow-hidden w-full flex flex-col bg-white dark:bg-black">
        <div className="flex-1 overflow-hidden bg-white dark:bg-black">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-500">Loading your tasks...</p>
            </div>
          ) : isSearchOpen ||
            isCalendarOpen ||
            isSettingsOpen ||
            isTrashOpen ||
            isHelpOpen ? (
            <>
              {isSearchOpen && (
                <SearchPanel
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                  onViewTask={handleViewTask}
                  onClose={() => setIsSearchOpen(false)}
                />
              )}
              {isCalendarOpen && (
                <CalendarPanel
                  currentDate={currentDate}
                  onSelectDate={(date) => {
                    setCurrentDate(date);
                    setIsCalendarOpen(false);
                  }}
                  onClose={() => setIsCalendarOpen(false)}
                />
              )}
              {isSettingsOpen && (
                <SettingsPanel
                  settings={settings}
                  onSave={handleSaveSettings}
                  onClose={() => setIsSettingsOpen(false)}
                />
              )}
              {isTrashOpen && (
                <TrashPanel
                  trash={trash}
                  onRestore={handleRestoreTask}
                  onPermanentDelete={handlePermanentDelete}
                  onClose={() => setIsTrashOpen(false)}
                />
              )}
              {isHelpOpen && <HelpPanel onClose={() => setIsHelpOpen(false)} />}
            </>
          ) : (
            <CalendarView
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onViewTask={handleViewTask}
              startDate={currentDate}
              numDays={numDays}
            />
          )}
        </div>
      </div>
      {!isSearchOpen &&
        !isCalendarOpen &&
        !isSettingsOpen &&
        !isTrashOpen &&
        !isHelpOpen && (
          <ColumnControls
            numDays={numDays}
            isAutoMode={isAutoMode}
            theme={settings.theme}
            onDecrease={handleDecreaseColumns}
            onIncrease={handleIncreaseColumns}
            onToggleAuto={() => setIsAutoMode((prev: boolean) => !prev)}
            onToggleTheme={handleToggleTheme}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenTrash={() => setIsTrashOpen((prev) => !prev)}
          />
        )}
      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          isOpen={isTaskDetailOpen}
          onClose={handleCloseTaskDetail}
        />
      )}
    </div>
  );
};
