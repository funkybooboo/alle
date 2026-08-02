import type { Project, RecurringTask, SomeDayGroup, Task, UserPreferences } from '@alle/shared';
import { DEFAULT_TAG_KIND_MAP, DEFAULT_TAG_KINDS } from '@alle/shared';

export const mockTask: Task = {
    id: '1',
    text: 'Buy groceries',
    notes: null,
    completed: false,
    date: '2026-04-27',
    createdAt: '2026-04-27T09:00:00Z',
    updatedAt: '2026-04-27T09:00:00Z',
    tags: ['work'],
    parentId: null,
    rolloverEnabled: true,
    someDayGroupId: null,
    position: 0,
    state: null,
    recurringTaskId: null,
    instanceDate: null,
    originalScheduledDate: null,
    daysLate: 0,
    dependsOn: null,
    startTime: null,
    endTime: null,
    reminder: null,
    deletedAt: null,
};

export const mockCompletedTask: Task = {
    ...mockTask,
    id: '2',
    text: 'Write documentation',
    completed: true,
    tags: ['p1'],
};

export const mockOverdueTask: Task = {
    ...mockTask,
    id: '3',
    text: 'Submit report',
    date: '2026-04-25',
    daysLate: 2,
    tags: ['work', 'deadline'],
};

export const mockSubTask: Task = {
    ...mockTask,
    id: '4',
    text: 'Research prices',
    parentId: '1',
    tags: [],
};

export const mockTimeTask: Task = {
    ...mockTask,
    id: '5',
    text: 'Team standup',
    startTime: '09:00',
    endTime: '09:30',
    tags: ['meeting'],
};

export const mockRecurringTaskInstance: Task = {
    ...mockTask,
    id: '6',
    text: 'Morning exercise',
    recurringTaskId: 'rt-1',
    tags: ['health'],
};

export const mockPriorityTask: Task = {
    ...mockTask,
    id: '7',
    text: 'Fix critical bug',
    tags: ['p1', 'urgent'],
};

export const mockSomeDayGroup: SomeDayGroup = {
    id: 'sg-1',
    name: 'Home Improvements',
    description: 'Things to do around the house',
    tag: 'home',
    position: 0,
    createdAt: '2026-04-01T00:00:00Z',
};

export const mockSomeDayGroup2: SomeDayGroup = {
    id: 'sg-2',
    name: 'Learning',
    description: null,
    tag: 'learning',
    position: 1,
    createdAt: '2026-04-01T00:00:00Z',
};

export const mockProject: Project = {
    id: 'p-1',
    name: 'Alle App',
    tag: 'project:alle-app',
    description: 'Build the Alle task management app',
    startDate: '2026-01-01',
    dueDate: '2026-06-30',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    completedAt: null,
};

export const mockInactiveProject: Project = {
    id: 'p-2',
    name: 'Old Project',
    tag: 'project:old-project',
    description: 'A completed project',
    startDate: '2025-01-01',
    dueDate: '2025-12-31',
    isActive: false,
    createdAt: '2025-01-01T00:00:00Z',
    completedAt: '2025-12-31T00:00:00Z',
};

export const mockRecurringTask: RecurringTask = {
    id: 'rt-1',
    text: 'Morning exercise',
    notes: null,
    tags: ['health'],
    frequency: 'daily',
    interval: 1,
    dayOfWeek: null,
    dayOfMonth: null,
    startDate: '2026-01-01',
    endDate: null,
    rolloverEnabled: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
};

export const mockPreferences: UserPreferences = {
    id: 'default',
    theme: 'system',
    locale: 'en',
    someDayPanelWidth: 280,
    someDayPanelCollapsed: false,
    someDayPanelLastOpenWidth: 280,
    rolloverEnabled: true,
    showEmptyDays: true,
    deleteConfirmation: 'instant',
    activeFilters: {
        tags: [],
        showCompleted: false,
    },
    tagKinds: [...DEFAULT_TAG_KINDS],
    tagKindMap: { ...DEFAULT_TAG_KIND_MAP },
    timeFormat: '12h' as const,
    timezone: null as string | null,
    updatedAt: '2026-04-27T00:00:00Z',
};

export const mockTasks: Task[] = [
    mockTask,
    mockCompletedTask,
    {
        ...mockTask,
        id: '8',
        text: 'Read a book',
        date: '2026-04-28',
        tags: ['reading'],
    },
];
