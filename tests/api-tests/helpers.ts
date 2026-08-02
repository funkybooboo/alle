/**
 * API test helpers — thin wrapper around Playwright's APIRequestContext.
 *
 * Every helper returns { status, body, headers } so specs can assert on any
 * part of the HTTP response. `body` is parsed as JSON when the Content-Type is
 * application/json, otherwise returned as raw text.
 *
 * `base` lets callers target a specific origin. The "api" Playwright project
 * sets its baseURL to the server (port 4000) and omits `base` (relative paths).
 * The "e2e" project's request fixture is bound to the client (port 3000), so
 * those specs pass `base = 'http://localhost:4000'` to reach the API directly.
 */
import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ApiResult, BaseEntity } from './types';

function isJson(res: APIResponse): boolean {
    return (res.headers()['content-type'] ?? '').includes('application/json');
}

async function toResult(res: APIResponse): Promise<ApiResult> {
    const headers = res.headers();
    const body = isJson(res) ? await res.json() : await res.text();
    return { status: res.status(), body, headers };
}

function url(base: string, path: string): string {
    return base ? `${base}${path}` : path;
}

export async function get(
    ctx: APIRequestContext,
    path: string,
    headers?: Record<string, string>,
    base = '',
): Promise<ApiResult> {
    return toResult(await ctx.get(url(base, path), { headers }));
}

export async function post(
    ctx: APIRequestContext,
    path: string,
    body?: unknown,
    base = '',
    headers?: Record<string, string>,
): Promise<ApiResult> {
    return toResult(
        await ctx.post(url(base, path), {
            data: body,
            headers: { 'Content-Type': 'application/json', ...headers },
        }),
    );
}

export async function put(
    ctx: APIRequestContext,
    path: string,
    body?: unknown,
    base = '',
    headers?: Record<string, string>,
): Promise<ApiResult> {
    return toResult(
        await ctx.put(url(base, path), {
            data: body,
            headers: { 'Content-Type': 'application/json', ...headers },
        }),
    );
}

export async function patch(
    ctx: APIRequestContext,
    path: string,
    body?: unknown,
    base = '',
    headers?: Record<string, string>,
): Promise<ApiResult> {
    return toResult(
        await ctx.patch(url(base, path), {
            data: body,
            headers: { 'Content-Type': 'application/json', ...headers },
        }),
    );
}

export async function del(
    ctx: APIRequestContext,
    path: string,
    base = '',
    headers?: Record<string, string>,
): Promise<ApiResult> {
    return toResult(await ctx.delete(url(base, path), { headers }));
}

export async function fetchRaw(
    ctx: APIRequestContext,
    path: string,
    init: Record<string, unknown>,
    base = '',
): Promise<ApiResult> {
    return toResult(await ctx.fetch(url(base, path), init));
}

// ---------------------------------------------------------------------------
// Lifecycle helpers — create an entity and track it for afterEach cleanup.
// ---------------------------------------------------------------------------

const created: Array<{ ctx: APIRequestContext; base: string; kind: string; id: string }> = [];

export async function createTask(
    ctx: APIRequestContext,
    input: Record<string, unknown>,
    base = '',
): Promise<BaseEntity> {
    const res = await post(ctx, '/api/tasks', input, base);
    if (res.status === 201) created.push({ ctx, base, kind: 'task', id: res.body.data.id });
    return res.body.data;
}

export async function createProject(
    ctx: APIRequestContext,
    input: Record<string, unknown>,
    base = '',
): Promise<BaseEntity> {
    const res = await post(ctx, '/api/projects', input, base);
    if (res.status === 201) created.push({ ctx, base, kind: 'project', id: res.body.data.id });
    return res.body.data;
}

export async function createRecurring(
    ctx: APIRequestContext,
    input: Record<string, unknown>,
    base = '',
): Promise<BaseEntity> {
    const res = await post(ctx, '/api/recurring-tasks', input, base);
    if (res.status === 201) created.push({ ctx, base, kind: 'recurring', id: res.body.data.id });
    return res.body.data;
}

export async function createGroup(
    ctx: APIRequestContext,
    input: Record<string, unknown>,
    base = '',
): Promise<BaseEntity> {
    const res = await post(ctx, '/api/someday-groups', input, base);
    if (res.status === 201) created.push({ ctx, base, kind: 'group', id: res.body.data.id });
    return res.body.data;
}

/** Delete everything this test created. Safe to call in afterEach. */
export async function cleanup(ctx: APIRequestContext, base = ''): Promise<void> {
    for (const item of created.splice(0)) {
        if (item.ctx !== ctx) continue;
        const pathBase =
            item.kind === 'task'
                ? '/api/tasks'
                : item.kind === 'project'
                  ? '/api/projects'
                  : item.kind === 'recurring'
                    ? '/api/recurring-tasks'
                    : '/api/someday-groups';
        await del(ctx, `${pathBase}/${item.id}`, item.base ?? base).catch(() => {});
    }
}

/** Unique-ish suffix so tests don't collide on shared state. */
export function uniq(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}