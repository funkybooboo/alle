/**
 * OpenAPI path registrations — every API route documented here.
 *
 * Importing this module registers all paths with the registry.
 * Import all schema modules first (side-effect: schema registration).
 */

import { z } from 'zod';
import { registry } from './registry';
import { ErrorResponseSchema } from './schemas/common';
import { CreateProjectSchema, ProjectSchema, UpdateProjectSchema } from './schemas/project';
import {
    CreateRecurringTaskSchema,
    GenerateInstancesSchema,
    RecurringTaskSchema,
    UpdateRecurringTaskSchema,
} from './schemas/recurringTask';
import {
    CreateSomeDayGroupSchema,
    SomeDayGroupSchema,
    UpdateSomeDayGroupSchema,
} from './schemas/someDayGroup';
import { MergeTagsSchema, RenameTagSchema } from './schemas/tag';
import { CreateTaskSchema, TaskSchema, UpdateTaskSchema } from './schemas/task';
import { UpdateUserPreferencesSchema, UserPreferencesSchema } from './schemas/userPreferences';

// ── Reusable response configs ──────────────────────────────────────────────────

const notFoundResponse = {
    description: 'Resource not found',
    content: { 'application/json': { schema: ErrorResponseSchema } },
} as const;

const validationErrorResponse = {
    description: 'Validation failed',
    content: { 'application/json': { schema: ErrorResponseSchema } },
} as const;

const rateLimitResponse = {
    description: 'Rate limit exceeded',
    content: { 'application/json': { schema: ErrorResponseSchema } },
} as const;

// ── Health ─────────────────────────────────────────────────────────────────────

registry.registerPath({
    method: 'get',
    path: '/api/health',
    summary: 'Health check',
    operationId: 'getHealth',
    responses: {
        200: {
            description: 'Server is healthy',
            content: {
                'application/json': {
                    schema: z.object({ data: z.object({ status: z.enum(['ok']) }) }),
                },
            },
        },
    },
});

// ── Tasks ──────────────────────────────────────────────────────────────────────

const taskDataResponse = {
    description: 'Task',
    content: {
        'application/json': { schema: z.object({ data: TaskSchema }) },
    },
} as const;

registry.registerPath({
    method: 'get',
    path: '/api/tasks',
    summary: 'List tasks',
    operationId: 'listTasks',
    request: {
        query: z.object({
            date: z.string().optional().openapi({ description: 'Filter by date (YYYY-MM-DD)' }),
            tag: z.string().optional().openapi({ description: 'Filter by tag' }),
            completed: z
                .enum(['true', 'false'])
                .optional()
                .openapi({ description: 'Filter by completion status' }),
            someDayGroupId: z
                .string()
                .optional()
                .openapi({ description: 'Filter by Someday group' }),
            someday: z
                .enum(['true'])
                .optional()
                .openapi({ description: 'Return only Someday tasks (date is null)' }),
        }),
    },
    responses: {
        200: {
            description: 'List of tasks (JSON or plain text depending on Accept header)',
            content: {
                'application/json': { schema: z.object({ data: z.array(TaskSchema) }) },
                'text/plain': { schema: z.string() },
            },
        },
        429: rateLimitResponse,
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/tasks',
    summary: 'Create a task',
    operationId: 'createTask',
    request: {
        body: { required: true, content: { 'application/json': { schema: CreateTaskSchema } } },
    },
    responses: {
        201: taskDataResponse,
        400: validationErrorResponse,
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/tasks/{id}',
    summary: 'Get a task by ID',
    operationId: 'getTask',
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: taskDataResponse,
        404: notFoundResponse,
    },
});

registry.registerPath({
    method: 'put',
    path: '/api/tasks/{id}',
    summary: 'Update a task',
    operationId: 'updateTask',
    request: {
        params: z.object({ id: z.string() }),
        body: { required: true, content: { 'application/json': { schema: UpdateTaskSchema } } },
    },
    responses: {
        200: taskDataResponse,
        400: validationErrorResponse,
        404: notFoundResponse,
    },
});

registry.registerPath({
    method: 'delete',
    path: '/api/tasks/{id}',
    summary: 'Delete a task',
    operationId: 'deleteTask',
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: {
            description: 'Task deleted',
            content: {
                'application/json': {
                    schema: z.object({ data: z.object({ success: z.boolean() }) }),
                },
            },
        },
        404: notFoundResponse,
    },
});

// ── Someday Groups ─────────────────────────────────────────────────────────────

const groupDataResponse = {
    description: 'Someday group',
    content: {
        'application/json': { schema: z.object({ data: SomeDayGroupSchema }) },
    },
} as const;

registry.registerPath({
    method: 'get',
    path: '/api/someday-groups',
    summary: 'List Someday groups',
    operationId: 'listSomeDayGroups',
    responses: {
        200: {
            description: 'List of Someday groups',
            content: {
                'application/json': { schema: z.object({ data: z.array(SomeDayGroupSchema) }) },
                'text/plain': { schema: z.string() },
            },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/someday-groups',
    summary: 'Create a Someday group',
    operationId: 'createSomeDayGroup',
    request: {
        body: {
            required: true,
            content: { 'application/json': { schema: CreateSomeDayGroupSchema } },
        },
    },
    responses: {
        201: groupDataResponse,
        400: validationErrorResponse,
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/someday-groups/{id}',
    summary: 'Get a Someday group by ID',
    operationId: 'getSomeDayGroup',
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: groupDataResponse,
        404: notFoundResponse,
    },
});

registry.registerPath({
    method: 'put',
    path: '/api/someday-groups/{id}',
    summary: 'Update a Someday group',
    operationId: 'updateSomeDayGroup',
    request: {
        params: z.object({ id: z.string() }),
        body: {
            required: true,
            content: { 'application/json': { schema: UpdateSomeDayGroupSchema } },
        },
    },
    responses: {
        200: groupDataResponse,
        404: notFoundResponse,
    },
});

registry.registerPath({
    method: 'delete',
    path: '/api/someday-groups/{id}',
    summary: 'Delete a Someday group',
    operationId: 'deleteSomeDayGroup',
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: {
            description: 'Someday group deleted',
            content: {
                'application/json': {
                    schema: z.object({ data: z.object({ success: z.boolean() }) }),
                },
            },
        },
        404: notFoundResponse,
    },
});

// ── Projects ───────────────────────────────────────────────────────────────────

const projectDataResponse = {
    description: 'Project',
    content: {
        'application/json': { schema: z.object({ data: ProjectSchema }) },
    },
} as const;

registry.registerPath({
    method: 'get',
    path: '/api/projects',
    summary: 'List projects',
    operationId: 'listProjects',
    request: {
        query: z.object({
            active: z
                .enum(['true', 'false'])
                .optional()
                .openapi({ description: 'Filter by active status' }),
        }),
    },
    responses: {
        200: {
            description: 'List of projects',
            content: {
                'application/json': { schema: z.object({ data: z.array(ProjectSchema) }) },
                'text/plain': { schema: z.string() },
            },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/projects',
    summary: 'Create a project',
    operationId: 'createProject',
    request: {
        body: {
            required: true,
            content: { 'application/json': { schema: CreateProjectSchema } },
        },
    },
    responses: {
        201: projectDataResponse,
        400: validationErrorResponse,
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/projects/{id}',
    summary: 'Get a project by ID',
    operationId: 'getProject',
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: projectDataResponse,
        404: notFoundResponse,
    },
});

registry.registerPath({
    method: 'put',
    path: '/api/projects/{id}',
    summary: 'Update a project',
    operationId: 'updateProject',
    request: {
        params: z.object({ id: z.string() }),
        body: {
            required: true,
            content: { 'application/json': { schema: UpdateProjectSchema } },
        },
    },
    responses: {
        200: projectDataResponse,
        404: notFoundResponse,
    },
});

registry.registerPath({
    method: 'delete',
    path: '/api/projects/{id}',
    summary: 'Delete a project',
    operationId: 'deleteProject',
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: {
            description: 'Project deleted',
            content: {
                'application/json': {
                    schema: z.object({ data: z.object({ success: z.boolean() }) }),
                },
            },
        },
        404: notFoundResponse,
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/projects/{id}/activate',
    summary: 'Activate a project',
    operationId: 'activateProject',
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: projectDataResponse,
        404: notFoundResponse,
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/projects/{id}/deactivate',
    summary: 'Deactivate a project',
    operationId: 'deactivateProject',
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: projectDataResponse,
        404: notFoundResponse,
    },
});

// ── Recurring Tasks ────────────────────────────────────────────────────────────

const recurringTaskDataResponse = {
    description: 'Recurring task',
    content: {
        'application/json': { schema: z.object({ data: RecurringTaskSchema }) },
    },
} as const;

registry.registerPath({
    method: 'get',
    path: '/api/recurring-tasks',
    summary: 'List recurring task templates',
    operationId: 'listRecurringTasks',
    responses: {
        200: {
            description: 'List of recurring tasks',
            content: {
                'application/json': {
                    schema: z.object({ data: z.array(RecurringTaskSchema) }),
                },
                'text/plain': { schema: z.string() },
            },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/recurring-tasks',
    summary: 'Create a recurring task template',
    operationId: 'createRecurringTask',
    request: {
        body: {
            required: true,
            content: { 'application/json': { schema: CreateRecurringTaskSchema } },
        },
    },
    responses: {
        201: recurringTaskDataResponse,
        400: validationErrorResponse,
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/recurring-tasks/{id}',
    summary: 'Get a recurring task by ID',
    operationId: 'getRecurringTask',
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: recurringTaskDataResponse,
        404: notFoundResponse,
    },
});

registry.registerPath({
    method: 'put',
    path: '/api/recurring-tasks/{id}',
    summary: 'Update a recurring task template',
    operationId: 'updateRecurringTask',
    request: {
        params: z.object({ id: z.string() }),
        body: {
            required: true,
            content: { 'application/json': { schema: UpdateRecurringTaskSchema } },
        },
    },
    responses: {
        200: recurringTaskDataResponse,
        404: notFoundResponse,
    },
});

registry.registerPath({
    method: 'delete',
    path: '/api/recurring-tasks/{id}',
    summary: 'Delete a recurring task template',
    operationId: 'deleteRecurringTask',
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: {
            description: 'Recurring task deleted',
            content: {
                'application/json': {
                    schema: z.object({ data: z.object({ success: z.boolean() }) }),
                },
            },
        },
        404: notFoundResponse,
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/recurring-tasks/{id}/generate',
    summary: 'Generate task instances for a date range',
    operationId: 'generateRecurringTaskInstances',
    request: {
        params: z.object({ id: z.string() }),
        body: {
            required: true,
            content: { 'application/json': { schema: GenerateInstancesSchema } },
        },
    },
    responses: {
        200: {
            description: 'Generated task instances',
            content: {
                'application/json': { schema: z.object({ data: z.array(TaskSchema) }) },
            },
        },
        400: validationErrorResponse,
        404: notFoundResponse,
    },
});

// ── Tags ───────────────────────────────────────────────────────────────────────

const updatedCountResponse = {
    description: 'Number of tasks updated',
    content: {
        'application/json': {
            schema: z.object({ data: z.object({ updated: z.number().int() }) }),
        },
    },
} as const;

registry.registerPath({
    method: 'get',
    path: '/api/tags',
    summary: 'List all tags (derived from task data)',
    operationId: 'listTags',
    responses: {
        200: {
            description: 'Sorted list of unique tags',
            content: {
                'application/json': { schema: z.object({ data: z.array(z.string()) }) },
                'text/plain': { schema: z.string() },
            },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/tags/rename',
    summary: 'Rename a tag across all tasks',
    operationId: 'renameTag',
    request: {
        body: { required: true, content: { 'application/json': { schema: RenameTagSchema } } },
    },
    responses: {
        200: updatedCountResponse,
        400: validationErrorResponse,
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/tags/merge',
    summary: 'Merge multiple tags into one',
    operationId: 'mergeTags',
    request: {
        body: { required: true, content: { 'application/json': { schema: MergeTagsSchema } } },
    },
    responses: {
        200: updatedCountResponse,
        400: validationErrorResponse,
    },
});

// ── User Preferences ───────────────────────────────────────────────────────────

const prefsDataResponse = {
    description: 'User preferences',
    content: {
        'application/json': { schema: z.object({ data: UserPreferencesSchema }) },
    },
} as const;

registry.registerPath({
    method: 'get',
    path: '/api/preferences',
    summary: 'Get user preferences',
    operationId: 'getUserPreferences',
    responses: {
        200: {
            ...prefsDataResponse,
            content: {
                'application/json': { schema: z.object({ data: UserPreferencesSchema }) },
                'text/plain': { schema: z.string() },
            },
        },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/api/preferences',
    summary: 'Update user preferences',
    operationId: 'updateUserPreferences',
    request: {
        body: {
            required: true,
            content: { 'application/json': { schema: UpdateUserPreferencesSchema } },
        },
    },
    responses: {
        200: prefsDataResponse,
        400: validationErrorResponse,
    },
});

// ── OpenAPI spec ───────────────────────────────────────────────────────────────

registry.registerPath({
    method: 'get',
    path: '/openapi.yaml',
    summary: 'OpenAPI spec (YAML)',
    operationId: 'getOpenApiYaml',
    responses: {
        200: {
            description: 'OpenAPI 3.1 spec in YAML format',
            content: { 'application/yaml': { schema: z.string() } },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/openapi.json',
    summary: 'OpenAPI spec (JSON)',
    operationId: 'getOpenApiJson',
    responses: {
        200: {
            description: 'OpenAPI 3.1 spec in JSON format',
            content: { 'application/json': { schema: z.object({}) } },
        },
    },
});
