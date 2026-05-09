/**
 * API Request and Response types
 */

import type { CreateTaskInput, Task, UpdateTaskInput } from './task';

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

/**
 * API error response
 */
export interface ApiError {
    message: string;
}

/**
 * Task API endpoints
 */
export interface TaskApi {
    // GET /api/tasks
    listTasks: {
        response: ApiResponse<Task[]>;
    };

    // GET /api/tasks/:id
    getTask: {
        response: ApiResponse<Task>;
    };

    // POST /api/tasks
    createTask: {
        request: CreateTaskInput;
        response: ApiResponse<Task>;
    };

    // PUT /api/tasks/:id
    updateTask: {
        request: UpdateTaskInput;
        response: ApiResponse<Task>;
    };

    // DELETE /api/tasks/:id
    deleteTask: {
        response: ApiResponse<{ id: string }>;
    };
}

export interface ErrorResponseBody {
    error: string;
    code: string;
    details?: unknown;
}

export interface TaskQueryParams {
    completed?: boolean;
    date?: string;
    tag?: string;
    someDayGroupId?: string;
    someday?: boolean;
    includeDeleted?: boolean;
}

export interface RenameTagRequest {
    from: string;
    to: string;
}

export interface RenameTagResponse {
    updated: number;
}

export interface MergeTagRequest {
    sources: string[];
    target: string;
}

export interface MergeTagResponse {
    updated: number;
}
