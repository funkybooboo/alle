import type { HttpClient } from '@alle/shared';
import { API_ROUTES } from '@alle/shared';

export class TagService {
    constructor(private http: HttpClient) {}

    async getAll(): Promise<string[]> {
        const response = await this.http.get<{ data: { tags: string[] } }>(API_ROUTES.TAGS);
        return response.data.tags;
    }

    async rename(oldName: string, newName: string): Promise<string[]> {
        const response = await this.http.put<{ data: { tags: string[] } }>(API_ROUTES.TAG_RENAME, {
            oldName,
            newName,
        });
        return response.data.tags;
    }

    async merge(sourceTag: string, targetTag: string): Promise<string[]> {
        const response = await this.http.put<{ data: { tags: string[] } }>(API_ROUTES.TAG_MERGE, {
            sourceTag,
            targetTag,
        });
        return response.data.tags;
    }
}
