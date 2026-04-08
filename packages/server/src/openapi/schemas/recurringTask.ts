/**
 * RecurringTask entity schemas.
 */

import { z } from 'zod';
import { registry } from '../registry';
import { IsoDate } from './common';

export const RecurringTaskSchema = registry.register(
    'RecurringTask',
    z
        .object({
            id: z.string(),
            text: z.string().min(1).max(500),
            notes: z.string().nullable(),
            tags: z.array(z.string()),
            frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
            interval: z.number().int().min(1).openapi({ description: 'e.g. 2 = every 2 weeks' }),
            dayOfWeek: z.number().int().min(0).max(6).nullable().openapi({
                description: '0–6 for weekly recurrence (0 = Sunday)',
            }),
            dayOfMonth: z.number().int().min(1).max(31).nullable().openapi({
                description: '1–31 for monthly recurrence',
            }),
            startDate: IsoDate,
            endDate: IsoDate.nullable(),
            projectId: z.string().nullable(),
            rolloverEnabled: z.boolean(),
            createdAt: z.string(),
            updatedAt: z.string(),
        })
        .openapi('RecurringTask'),
);

export const CreateRecurringTaskSchema = registry.register(
    'CreateRecurringTaskInput',
    z
        .object({
            text: z.string().min(1).max(500),
            frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
            startDate: IsoDate,
            notes: z.string().nullable().optional(),
            tags: z.array(z.string()).optional(),
            interval: z.number().int().min(1).optional(),
            dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
            dayOfMonth: z.number().int().min(1).max(31).nullable().optional(),
            endDate: IsoDate.nullable().optional(),
            projectId: z.string().nullable().optional(),
            rolloverEnabled: z.boolean().optional(),
        })
        .openapi('CreateRecurringTaskInput'),
);

export const UpdateRecurringTaskSchema = registry.register(
    'UpdateRecurringTaskInput',
    CreateRecurringTaskSchema.partial().openapi('UpdateRecurringTaskInput'),
);

export const GenerateInstancesSchema = registry.register(
    'GenerateInstancesInput',
    z
        .object({
            startDate: IsoDate.openapi({ description: 'ISO 8601 date (YYYY-MM-DD)' }),
            endDate: IsoDate.openapi({ description: 'ISO 8601 date (YYYY-MM-DD)' }),
        })
        .openapi('GenerateInstancesInput'),
);
