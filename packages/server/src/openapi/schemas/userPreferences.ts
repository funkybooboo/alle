/**
 * UserPreferences entity schemas.
 */

import { z } from 'zod';
import { registry } from '../registry';

const ActiveFiltersSchema = z.object({
    tags: z.array(z.string()),
    projectId: z.string().nullable(),
    priority: z.string().nullable(),
    showCompleted: z.boolean(),
});

export const UserPreferencesSchema = registry.register(
    'UserPreferences',
    z
        .object({
            id: z.literal('default'),
            theme: z.enum(['light', 'dark', 'system']),
            locale: z.string(),
            someDayPanelWidth: z.number().int(),
            someDayPanelCollapsed: z.boolean(),
            rolloverEnabled: z.boolean(),
            showEmptyDays: z.boolean(),
            activeFilters: ActiveFiltersSchema,
            updatedAt: z.string(),
        })
        .openapi('UserPreferences'),
);

export const UpdateUserPreferencesSchema = registry.register(
    'UpdateUserPreferencesInput',
    z
        .object({
            theme: z.enum(['light', 'dark', 'system']).optional(),
            locale: z.string().optional(),
            someDayPanelWidth: z.number().int().min(100).max(800).optional(),
            someDayPanelCollapsed: z.boolean().optional(),
            rolloverEnabled: z.boolean().optional(),
            showEmptyDays: z.boolean().optional(),
            activeFilters: ActiveFiltersSchema.optional(),
        })
        .openapi('UpdateUserPreferencesInput'),
);
