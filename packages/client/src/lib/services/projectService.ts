import type { HttpClient } from '@alle/shared';
import {
    API_ROUTES,
    type ApiResponse,
    type CreateProjectInput,
    type Project,
    type UpdateProjectInput,
} from '@alle/shared';

export class ProjectService {
    constructor(private http: HttpClient) {}

    async getAll(): Promise<Project[]> {
        const response = await this.http.get<ApiResponse<Project[]>>(API_ROUTES.PROJECTS);
        return response.data;
    }

    async getById(id: string): Promise<Project> {
        const response = await this.http.get<ApiResponse<Project>>(API_ROUTES.PROJECT_BY_ID(id));
        return response.data;
    }

    async create(input: CreateProjectInput): Promise<Project> {
        const response = await this.http.post<ApiResponse<Project>>(API_ROUTES.PROJECTS, input);
        return response.data;
    }

    async update(id: string, input: UpdateProjectInput): Promise<Project> {
        const response = await this.http.put<ApiResponse<Project>>(
            API_ROUTES.PROJECT_BY_ID(id),
            input,
        );
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await this.http.delete<ApiResponse<{ id: string }>>(API_ROUTES.PROJECT_BY_ID(id));
    }

    async activate(id: string): Promise<Project> {
        const response = await this.http.post<ApiResponse<Project>>(
            API_ROUTES.PROJECT_ACTIVATE(id),
            {},
        );
        return response.data;
    }

    async deactivate(id: string): Promise<Project> {
        const response = await this.http.post<ApiResponse<Project>>(
            API_ROUTES.PROJECT_DEACTIVATE(id),
            {},
        );
        return response.data;
    }
}
