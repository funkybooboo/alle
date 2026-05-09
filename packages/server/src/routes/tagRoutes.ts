/**
 * Tag API routes
 *
 * Tags are derived from task data - no separate Tag entity.
 */

import type { Logger } from '@alle/shared';
import { API_ROUTES } from '@alle/shared';
import type { HttpServer } from '../adapters/http/HttpServer';
import { MergeTagsSchema, RenameTagSchema } from '../openapi/schemas/tag';
import { formatTagsAsText } from '../presentation/formatters';
import type { TagService } from '../services/TagService';
import { respondNegotiated, successResponse, withErrorHandling } from '../utils/routeHelpers';
import { parseBody } from '../utils/validate';

export function registerTagRoutes(
    server: HttpServer,
    tagService: TagService,
    logger: Logger,
): void {
    // GET /api/tags
    server.route(
        'GET',
        API_ROUTES.TAGS,
        withErrorHandling(async req => {
            const tags = await tagService.listTags();
            return respondNegotiated(req, tags, formatTagsAsText);
        }, logger),
    );

    // POST /api/tags/rename
    server.route(
        'POST',
        API_ROUTES.TAG_RENAME,
        withErrorHandling(async req => {
            const raw = await req.json<unknown>();
            const { from, to } = parseBody(RenameTagSchema, raw);
            const updated = await tagService.renameTag(from, to);
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
            const updated = await tagService.mergeTags(sources, target);
            return successResponse({ updated });
        }, logger),
    );
}
