import type { HttpClient } from '@alle/shared';
import { API_ROUTES, type ApiResponse } from '@alle/shared';

export class TagService {
    constructor(private http: HttpClient) {}

    async getAll(): Promise<string[]> {
        const response = await this.http.get<ApiResponse<string[]>>(API_ROUTES.TAGS);
        return response.data;
    }

    async rename(from: string, to: string): Promise<{ updated: number }> {
        const response = await this.http.post<ApiResponse<{ updated: number }>>(
            API_ROUTES.TAG_RENAME,
            {
                from,
                to,
            },
        );
        return response.data;
    }

    async merge(sources: string[], target: string): Promise<{ updated: number }> {
        const response = await this.http.post<ApiResponse<{ updated: number }>>(
            API_ROUTES.TAG_MERGE,
            {
                sources,
                target,
            },
        );
        return response.data;
    }
}
