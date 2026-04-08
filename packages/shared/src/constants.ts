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
    TAG_RENAME: '/api/tags/rename',
    TAG_MERGE: '/api/tags/merge',

    // User preferences
    USER_PREFERENCES: '/api/preferences',

    // OpenAPI
    OPENAPI_YAML: '/openapi.yaml',
    OPENAPI_JSON: '/openapi.json',
} as const;
