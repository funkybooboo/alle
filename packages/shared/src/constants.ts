/**
 * Shared constants
 */

/**
 * Validation constraints
 */
export const TASK_CONSTRAINTS = {
    MAX_TEXT_LENGTH: 500,
    MIN_TEXT_LENGTH: 1,
} as const;

/**
 * API routes
 */
export const API_ROUTES = {
    // Health
    HEALTH: '/api/health',

    // Tasks
    TASKS: '/api/tasks',
    TASK_BY_ID: (id: string) => `/api/tasks/${id}`,
    TASK_RESTORE: (id: string) => `/api/tasks/${id}/restore`,
    TASK_TRASH: '/api/tasks/trash',
    TASK_PURGE: '/api/tasks/purge',

    // Someday groups
    SOMEDAY_GROUPS: '/api/someday-groups',
    SOMEDAY_GROUP_BY_ID: (id: string) => `/api/someday-groups/${id}`,

    // Projects
    PROJECTS: '/api/projects',
    PROJECT_BY_ID: (id: string) => `/api/projects/${id}`,
    PROJECT_ACTIVATE: (id: string) => `/api/projects/${id}/activate`,
    PROJECT_DEACTIVATE: (id: string) => `/api/projects/${id}/deactivate`,

    // Recurring tasks
    RECURRING_TASKS: '/api/recurring-tasks',
    RECURRING_TASK_BY_ID: (id: string) => `/api/recurring-tasks/${id}`,
    RECURRING_TASK_GENERATE: (id: string) => `/api/recurring-tasks/${id}/generate`,

    // Tags
    TAGS: '/api/tags',
    TAG_INFO: '/api/tags/info',
    TAG_RENAME: '/api/tags/rename',
    TAG_MERGE: '/api/tags/merge',

    // User preferences
    USER_PREFERENCES: '/api/preferences',

    // OpenAPI
    OPENAPI_YAML: '/openapi.yaml',
    OPENAPI_JSON: '/openapi.json',

    // Route patterns (for server-side path param extraction)
    TASK_ROUTE_PATTERN: '/api/tasks/:id',
    TASK_RESTORE_PATTERN: '/api/tasks/:id/restore',
    PROJECT_ROUTE_PATTERN: '/api/projects/:id',
    PROJECT_ACTIVATE_PATTERN: '/api/projects/:id/activate',
    PROJECT_DEACTIVATE_PATTERN: '/api/projects/:id/deactivate',
    RECURRING_TASK_ROUTE_PATTERN: '/api/recurring-tasks/:id',
    RECURRING_TASK_GENERATE_PATTERN: '/api/recurring-tasks/:id/generate',
    SOMEDAY_GROUP_ROUTE_PATTERN: '/api/someday-groups/:id',
} as const;

export const TASK_DEFAULTS = {
    rolloverEnabled: false,
    tags: [] as string[],
} as const;

export const RECURRING_TASK_DEFAULTS = {
    rolloverEnabled: true,
    interval: 1,
    tags: [] as string[],
} as const;

export const PURGE_RETENTION_DAYS = 7;
export const DEFAULT_DAY_RANGE = 30;
export const DEFAULT_TOAST_DURATION_MS = 5000;
export const DEFAULT_RATE_LIMIT_RPM = 300;

export const DEFAULT_TAG_KINDS: import('./types/userPreferences').TagKind[] = [
    {
        id: 'priority',
        name: 'Priority',
        behavior: 'single',
        prefix: null,
        sortOrder: 0,
        color: null,
    },
    {
        id: 'project',
        name: 'Project',
        behavior: 'single',
        prefix: 'project:',
        sortOrder: 1,
        color: null,
    },
];

export const DEFAULT_TAG_KIND_MAP: Record<string, string> = {
    p1: 'priority',
    p2: 'priority',
    p3: 'priority',
};

export const DEFAULT_COLLAPSED_SECTIONS: string[] = [];

export const USER_PREFERENCES_DEFAULTS = {
    theme: 'system' as const,
    locale: 'en',
    someDayPanelWidth: 280,
    someDayPanelCollapsed: false,
    someDayPanelLastOpenWidth: 280,
    rolloverEnabled: true,
    showEmptyDays: true,
    deleteConfirmation: 'instant' as const,
    collapsedSections: [] as string[],
    activeFilters: {
        tags: [] as string[],
        showCompleted: true,
    },
    tagKinds: DEFAULT_TAG_KINDS,
    tagKindMap: { ...DEFAULT_TAG_KIND_MAP },
    notificationPosition: 'bottom-right' as const,
} as const;

export const SOMEDAY_KEY = '__someday__';

export const WEEKDAY_ABBREVIATIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const WEEKDAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
] as const;
export const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
] as const;

export const CONTENT_TYPE_TEXT = 'text/plain; charset=utf-8';
export const MAX_SEARCH_RESULTS = 20;
