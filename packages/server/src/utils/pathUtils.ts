/**
 * URL path utilities for extracting route parameters
 */

/**
 * Convert a route path pattern like "/api/tasks/:id" into a RegExp that
 * matches the path and captures each `:param` segment.
 *
 * @example
 * pathToRegex('/api/tasks/:id') // /^\/api\/tasks\/([^/]+)$/
 */
export function pathToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexStr = escaped.replace(/:[^/]+/g, '([^/]+)');
    return new RegExp(`^${regexStr}$`);
}

/**
 * Extract a path parameter from a URL given a route pattern.
 *
 * @example
 * extractPathParam('http://localhost/api/tasks/abc123', '/api/tasks/:id') // 'abc123'
 * extractPathParam('http://localhost/api/projects/x/activate', '/api/projects/:id/activate') // 'x'
 */
export function extractPathParam(url: string, pattern: string): string | null {
    const pathname = new URL(url, 'http://localhost').pathname;
    const match = pathname.match(pathToRegex(pattern));
    return match?.[1] ?? null;
}
