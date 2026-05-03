import type { HttpClient } from '@alle/shared';
import {
    API_ROUTES,
    type ApiResponse,
    type CreateSomeDayGroupInput,
    type SomeDayGroup,
    type UpdateSomeDayGroupInput,
} from '@alle/shared';

export class SomeDayGroupService {
    constructor(private http: HttpClient) {}

    async getAll(): Promise<SomeDayGroup[]> {
        const response = await this.http.get<ApiResponse<SomeDayGroup[]>>(
            API_ROUTES.SOMEDAY_GROUPS,
        );
        return response.data;
    }

    async getById(id: string): Promise<SomeDayGroup> {
        const response = await this.http.get<ApiResponse<SomeDayGroup>>(
            API_ROUTES.SOMEDAY_GROUP_BY_ID(id),
        );
        return response.data;
    }

    async create(input: CreateSomeDayGroupInput): Promise<SomeDayGroup> {
        const response = await this.http.post<ApiResponse<SomeDayGroup>>(
            API_ROUTES.SOMEDAY_GROUPS,
            input,
        );
        return response.data;
    }

    async update(id: string, input: UpdateSomeDayGroupInput): Promise<SomeDayGroup> {
        const response = await this.http.put<ApiResponse<SomeDayGroup>>(
            API_ROUTES.SOMEDAY_GROUP_BY_ID(id),
            input,
        );
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await this.http.delete<ApiResponse<{ id: string }>>(API_ROUTES.SOMEDAY_GROUP_BY_ID(id));
    }
}
