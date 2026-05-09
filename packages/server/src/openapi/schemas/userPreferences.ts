/**
 * UserPreferences entity schemas.
 */

import { z } from 'zod';
import { registry } from '../registry';

const TagKindSchema = z.object({
    id: z.string(),
    name: z.string(),
    behavior: z.enum(['single', 'multiple']),
    prefix: z.string().nullable(),
    sortOrder: z.number().int(),
    color: z.string().nullable(),
});

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
            someDayPanelLastOpenWidth: z.number().int(),
            rolloverEnabled: z.boolean(),
            showEmptyDays: z.boolean(),
            deleteConfirmation: z.enum(['instant', 'confirm']),
            collapsedSections: z.array(z.string()),
            activeFilters: ActiveFiltersSchema,
            tagKinds: z.array(TagKindSchema),
            tagKindMap: z.record(z.string(), z.string()),
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
            someDayPanelLastOpenWidth: z.number().int().optional(),
            rolloverEnabled: z.boolean().optional(),
            showEmptyDays: z.boolean().optional(),
            deleteConfirmation: z.enum(['instant', 'confirm']).optional(),
            collapsedSections: z.array(z.string()).optional(),
            activeFilters: ActiveFiltersSchema.optional(),
            tagKinds: z.array(TagKindSchema).optional(),
            tagKindMap: z.record(z.string(), z.string()).optional(),
        })
        .openapi('UpdateUserPreferencesInput'),
);
