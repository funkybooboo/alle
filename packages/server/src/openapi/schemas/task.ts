/**
 * Task entity schemas — used for both OpenAPI documentation and request validation.
 */

import { TASK_CONSTRAINTS } from '@alle/shared';
import { z } from 'zod';
import { registry } from '../registry';
import { HhMmTime } from './common';

const ReminderSchema = z
    .object({
        time: z.string().openapi({ description: 'Reminder time in HH:MM format' }),
        channels: z.array(z.enum(['push', 'email'])),
    })
    .openapi({ description: 'Stub reminder field — implemented in v2.2.0' });

export const TaskSchema = registry.register(
    'Task',
    z
        .object({
            id: z.string(),
            text: z
                .string()
                .min(TASK_CONSTRAINTS.MIN_TEXT_LENGTH)
                .max(TASK_CONSTRAINTS.MAX_TEXT_LENGTH),
            notes: z.string().nullable(),
            completed: z.boolean(),
            date: z
                .string()
                .nullable()
                .openapi({ description: 'ISO 8601 date (YYYY-MM-DD); null = Someday' }),
            createdAt: z.string(),
            updatedAt: z.string(),
            tags: z.array(z.string()),
            parentId: z.string().nullable(),
            rolloverEnabled: z.boolean(),
            someDayGroupId: z.string().nullable(),
            projectId: z.string().nullable(),
            position: z.number().int().nullable(),
            state: z.enum(['ready', 'scheduled', 'done']).nullable(),
            recurringTaskId: z.string().nullable(),
            instanceDate: z.string().nullable(),
            originalScheduledDate: z.string().nullable(),
            daysLate: z.number().int(),
            dependsOn: z.string().nullable(),
            startTime: HhMmTime.nullable().openapi({ description: 'HH:MM format; null = all-day' }),
            endTime: HhMmTime.nullable().openapi({
                description: 'HH:MM format; null = all-day or open-ended',
            }),
            reminder: ReminderSchema.nullable(),
        })
        .openapi('Task'),
);

export const CreateTaskSchema = registry.register(
    'CreateTaskInput',
    z
        .object({
            text: z
                .string()
                .min(TASK_CONSTRAINTS.MIN_TEXT_LENGTH)
                .max(TASK_CONSTRAINTS.MAX_TEXT_LENGTH),
            date: z.string().nullable().optional(),
            notes: z.string().nullable().optional(),
            tags: z.array(z.string()).optional(),
            parentId: z.string().nullable().optional(),
            someDayGroupId: z.string().nullable().optional(),
            projectId: z.string().nullable().optional(),
            position: z.number().int().nullable().optional(),
            startTime: HhMmTime.nullable().optional(),
            endTime: HhMmTime.nullable().optional(),
            rolloverEnabled: z.boolean().optional(),
        })
        .openapi('CreateTaskInput'),
);

export const UpdateTaskSchema = registry.register(
    'UpdateTaskInput',
    z
        .object({
            text: z
                .string()
                .min(TASK_CONSTRAINTS.MIN_TEXT_LENGTH)
                .max(TASK_CONSTRAINTS.MAX_TEXT_LENGTH)
                .optional(),
            completed: z.boolean().optional(),
            date: z.string().nullable().optional(),
            notes: z.string().nullable().optional(),
            tags: z.array(z.string()).optional(),
            parentId: z.string().nullable().optional(),
            someDayGroupId: z.string().nullable().optional(),
            projectId: z.string().nullable().optional(),
            position: z.number().int().nullable().optional(),
            startTime: HhMmTime.nullable().optional(),
            endTime: HhMmTime.nullable().optional(),
            rolloverEnabled: z.boolean().optional(),
        })
        .openapi('UpdateTaskInput'),
);
