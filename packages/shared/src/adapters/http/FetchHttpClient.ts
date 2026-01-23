import type { HttpClient, RequestOptions } from './HttpClient';
import { HttpClientError } from './HttpClient';

export class FetchHttpClient implements HttpClient {
    private baseUrl: string;

    constructor(baseUrl: string = '') {
        this.baseUrl = baseUrl;
    }

    async get<T>(url: string, options?: RequestOptions): Promise<T> {
        return this.request<T>('GET', url, undefined, options);
    }

    async post<T>(url: string, body: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>('POST', url, body, options);
    }

    async put<T>(url: string, body: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>('PUT', url, body, options);
    }

    async delete<T>(url: string, options?: RequestOptions): Promise<T> {
        return this.request<T>('DELETE', url, undefined, options);
    }

    private async request<T>(
        method: string,
        url: string,
        body?: unknown,
        options?: RequestOptions,
    ): Promise<T> {
        const fullUrl: string = this.baseUrl + url;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options?.headers,
        };

        // Build fetch options, only including properties when they have values
        // This satisfies exactOptionalPropertyTypes - omit properties rather than setting to undefined
        const fetchOptions: RequestInit = { method, headers };

        if (body !== undefined) {
            fetchOptions.body = JSON.stringify(body);
        }

        if (options?.timeout !== undefined) {
            fetchOptions.signal = AbortSignal.timeout(options.timeout);
        }

        const response: Response = await fetch(fullUrl, fetchOptions);

        if (!response.ok) {
            const errorBody: string = await response.text();
            throw new HttpClientError(response.status, response.statusText, errorBody);
        }

        // Bun/Fetch API doesn't provide correct types for json(), type assertion necessary
        return response.json() as Promise<T>;
    }
}
