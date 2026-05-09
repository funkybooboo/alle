/**
 * Project entity schemas.
 */

import { z } from 'zod';
import { registry } from '../registry';

export const ProjectSchema = registry.register(
    'Project',
    z
        .object({
            id: z.string(),
            name: z.string(),
            tag: z.string().openapi({
                description: 'The tag that links tasks to this project (e.g. "project:build-alle")',
            }),
            description: z.string().nullable(),
            startDate: z.string().nullable().openapi({ description: 'ISO 8601 date (YYYY-MM-DD)' }),
            dueDate: z.string().nullable().openapi({ description: 'ISO 8601 date (YYYY-MM-DD)' }),
            isActive: z.boolean(),
            createdAt: z.string(),
            completedAt: z.string().nullable(),
        })
        .openapi('Project'),
);

export const CreateProjectSchema = registry.register(
    'CreateProjectInput',
    z
        .object({
            name: z.string().min(1).max(200),
            tag: z
                .string()
                .optional()
                .openapi({ description: 'Auto-generated from name if omitted' }),
            description: z.string().nullable().optional(),
            startDate: z.string().nullable().optional(),
            dueDate: z.string().nullable().optional(),
        })
        .openapi('CreateProjectInput'),
);

export const UpdateProjectSchema = registry.register(
    'UpdateProjectInput',
    z
        .object({
            name: z.string().min(1).max(200).optional(),
            tag: z.string().optional(),
            description: z.string().nullable().optional(),
            startDate: z.string().nullable().optional(),
            dueDate: z.string().nullable().optional(),
            isActive: z.boolean().optional(),
        })
        .openapi('UpdateProjectInput'),
);

export const ProjectQuerySchema = z.object({
    active: z.enum(['true', 'false']).optional(),
});
