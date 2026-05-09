/**
 * UserPreferences API routes
 */

import type { Logger } from '@alle/shared';
import { API_ROUTES, type UpdateUserPreferencesInput } from '@alle/shared';
import type { UserPreferencesRepository } from '../adapters/data/UserPreferencesRepository';
import type { HttpServer } from '../adapters/http/HttpServer';
import { UpdateUserPreferencesSchema } from '../openapi/schemas/userPreferences';
import { formatPreferencesAsText } from '../presentation/formatters';
import { respondNegotiated, successResponse, withErrorHandling } from '../utils/routeHelpers';
import { parseBody } from '../utils/validate';

export function registerUserPreferencesRoutes(
    server: HttpServer,
    userPreferencesRepo: UserPreferencesRepository,
    logger: Logger,
): void {
    // GET /api/preferences
    server.route(
        'GET',
        API_ROUTES.USER_PREFERENCES,
        withErrorHandling(async req => {
            const prefs = await userPreferencesRepo.get();
            return respondNegotiated(req, prefs, formatPreferencesAsText);
        }, logger),
    );

    // PATCH /api/preferences
    server.route(
        'PATCH',
        API_ROUTES.USER_PREFERENCES,
        withErrorHandling(async req => {
            const raw = await req.json<unknown>();
            const input = parseBody(
                UpdateUserPreferencesSchema,
                raw,
            ) as unknown as UpdateUserPreferencesInput;
            const prefs = await userPreferencesRepo.update(input);
            return successResponse(prefs);
        }, logger),
    );
}
