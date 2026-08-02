/** Shared API test types. */

export interface ApiResult {
    status: number;
    // biome-ignore lint/suspicious/noExplicitAny: tests assert on arbitrary JSON shapes
    body: any;
    headers: Record<string, string>;
}

export interface BaseEntity {
    id: string;
    // biome-ignore lint/suspicious/noExplicitAny: entity payloads vary per resource
    [k: string]: any;
}