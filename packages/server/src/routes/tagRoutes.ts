/**
 * Tag API routes
 *
 * Tags are derived from task data — no separate Tag entity.
 */

import type { Logger } from '@alle/shared';
import { API_ROUTES } from '@alle/shared';
import type { TaskRepository } from '../adapters/data/TaskRepository';
import type { HttpServer } from '../adapters/http/HttpServer';
import { MergeTagsSchema, RenameTagSchema } from '../openapi/schemas/tag';
import { negotiate } from '../utils/contentNegotiation';
import { formatTagsAsText } from '../utils/formatters';
import { successResponse, withErrorHandling } from '../utils/routeHelpers';
import { parseBody } from '../utils/validate';

export function registerTagRoutes(
    server: HttpServer,
    taskRepo: TaskRepository,
    logger: Logger,
): void {
    // GET /api/tags
    server.route(
        'GET',
        API_ROUTES.TAGS,
        withErrorHandling(async req => {
            const tasks = await taskRepo.findAll();
            const tags = [...new Set(tasks.flatMap(t => t.tags))].sort();
            if (negotiate(req.headers['accept']) === 'text') {
                return {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                    body: formatTagsAsText(tags),
                };
            }
            return successResponse(tags);
        }, logger),
    );

    // POST /api/tags/rename
    server.route(
        'POST',
        API_ROUTES.TAG_RENAME,
        withErrorHandling(async req => {
            const raw = await req.json<unknown>();
            const { from, to } = parseBody(RenameTagSchema, raw);

            const tasks = await taskRepo.findByTags([from]);
            let updated = 0;
            for (const task of tasks) {
                const newTags = task.tags.map(t => (t === from ? to : t));
                await taskRepo.update(task.id, { tags: newTags });
                updated++;
            }

            return successResponse({ updated });
        }, logger),
    );

    // POST /api/tags/merge
    server.route(
        'POST',
        API_ROUTES.TAG_MERGE,
        withErrorHandling(async req => {
            const raw = await req.json<unknown>();
            const { sources, target } = parseBody(MergeTagsSchema, raw);

            const sourceSet = new Set(sources);
            const affected = await Promise.all(sources.map(s => taskRepo.findByTags([s])));
            const uniqueTasks = new Map(affected.flat().map(t => [t.id, t]));

            let updated = 0;
            for (const task of uniqueTasks.values()) {
                const hasSources = task.tags.some(t => sourceSet.has(t));
                if (!hasSources) continue;

                const newTags = [...new Set(task.tags.map(t => (sourceSet.has(t) ? target : t)))];
                await taskRepo.update(task.id, { tags: newTags });
                updated++;
            }

            return successResponse({ updated });
        }, logger),
    );
}
