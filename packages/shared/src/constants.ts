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
    TASKS: '/api/tasks',
    TASK_BY_ID: (id: string) => `/api/tasks/${id}`,
    HEALTH: '/api/health',
} as const;
