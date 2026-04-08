/**
 * SomeDayGroup entity schemas.
 */

import { z } from 'zod';
import { registry } from '../registry';

export const SomeDayGroupSchema = registry.register(
    'SomeDayGroup',
    z
        .object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            tag: z.string(),
            position: z.number().int(),
            createdAt: z.string(),
        })
        .openapi('SomeDayGroup'),
);

export const CreateSomeDayGroupSchema = registry.register(
    'CreateSomeDayGroupInput',
    z
        .object({
            name: z.string().min(1).max(100),
            tag: z.string().min(1).max(50),
            position: z.number().int().min(0),
            description: z.string().nullable().optional(),
        })
        .openapi('CreateSomeDayGroupInput'),
);

export const UpdateSomeDayGroupSchema = registry.register(
    'UpdateSomeDayGroupInput',
    z
        .object({
            name: z.string().min(1).max(100).optional(),
            tag: z.string().min(1).max(50).optional(),
            position: z.number().int().min(0).optional(),
            description: z.string().nullable().optional(),
        })
        .openapi('UpdateSomeDayGroupInput'),
);
