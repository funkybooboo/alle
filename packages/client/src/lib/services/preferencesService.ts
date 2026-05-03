import type { HttpClient } from '@alle/shared';
import {
    API_ROUTES,
    type ApiResponse,
    type UpdateUserPreferencesInput,
    type UserPreferences,
} from '@alle/shared';

export class PreferencesService {
    constructor(private http: HttpClient) {}

    async get(): Promise<UserPreferences> {
        const response = await this.http.get<ApiResponse<UserPreferences>>(
            API_ROUTES.USER_PREFERENCES,
        );
        return response.data;
    }

    async update(input: UpdateUserPreferencesInput): Promise<UserPreferences> {
        const response = await this.http.patch<ApiResponse<UserPreferences>>(
            API_ROUTES.USER_PREFERENCES,
            input,
        );
        return response.data;
    }
}
