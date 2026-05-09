import type { HttpClient } from '@alle/shared';
import {
    API_ROUTES,
    type ApiResponse,
    type CreateTaskInput,
    type Task,
    type UpdateTaskInput,
} from '@alle/shared';

export class TaskService {
    constructor(private http: HttpClient) {}

    async getAll(params?: TaskQueryParams): Promise<Task[]> {
        const query = buildQueryString(params);
        const url = `${API_ROUTES.TASKS}${query}`;
        const response = await this.http.get<ApiResponse<Task[]>>(url);
        return response.data;
    }

    async getById(id: string): Promise<Task> {
        const response = await this.http.get<ApiResponse<Task>>(API_ROUTES.TASK_BY_ID(id));
        return response.data;
    }

    async create(input: CreateTaskInput): Promise<Task> {
        const response = await this.http.post<ApiResponse<Task>>(API_ROUTES.TASKS, input);
        return response.data;
    }

    async update(id: string, input: UpdateTaskInput): Promise<Task> {
        const response = await this.http.put<ApiResponse<Task>>(API_ROUTES.TASK_BY_ID(id), input);
        return response.data;
    }

    async delete(id: string): Promise<boolean> {
        const response = await this.http.delete<ApiResponse<{ success: boolean }>>(
            API_ROUTES.TASK_BY_ID(id),
        );
        return response.data.success;
    }

    async restore(id: string): Promise<Task> {
        const response = await this.http.post<ApiResponse<Task>>(API_ROUTES.TASK_RESTORE(id), {});
        return response.data;
    }

    async getTrash(): Promise<Task[]> {
        const response = await this.http.get<ApiResponse<Task[]>>(API_ROUTES.TASK_TRASH);
        return response.data;
    }

    async purge(): Promise<number> {
        const response = await this.http.delete<ApiResponse<{ purged: number }>>(
            API_ROUTES.TASK_PURGE,
        );
        return response.data.purged;
    }
}

export interface TaskQueryParams {
    completed?: boolean;
    date?: string;
    tag?: string;
    someDayGroupId?: string;
    /** @deprecated Use tag-based filtering instead */
    projectId?: string;
    includeDeleted?: boolean;
}

function buildQueryString(params?: TaskQueryParams): string {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    if (params.completed !== undefined) searchParams.set('completed', String(params.completed));
    if (params.date !== undefined) searchParams.set('date', params.date);
    if (params.tag !== undefined) searchParams.set('tag', params.tag);
    if (params.someDayGroupId !== undefined)
        searchParams.set('someDayGroupId', params.someDayGroupId);
    if (params.projectId !== undefined) searchParams.set('projectId', params.projectId);
    if (params.includeDeleted !== undefined)
        searchParams.set('includeDeleted', String(params.includeDeleted));
    const qs = searchParams.toString();
    return qs ? `?${qs}` : '';
}
