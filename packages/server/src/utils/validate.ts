/**
 * Validation utilities using Zod
 *
 * Provides consistent request body and query param parsing
 * that throws ValidationError on failure.
 */

import { ValidationError } from '@alle/shared';
import type { ZodSchema } from 'zod';

/**
 * Parse and validate a request body against a Zod schema.
 * Throws ValidationError with field-level details on failure.
 */
export function parseBody<T>(schema: ZodSchema<T>, raw: unknown): T {
    const result = schema.safeParse(raw);
    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        const message = result.error.issues
            .map(i => `${i.path.join('.') || 'root'}: ${i.message}`)
            .join('; ');
        throw new ValidationError(message, { fields: fieldErrors });
    }
    return result.data;
}

/**
 * Parse and validate query parameters from a URL string against a Zod schema.
 * Throws ValidationError with field-level details on failure.
 */
export function parseQuery<T>(schema: ZodSchema<T>, url: string): T {
    const searchParams = Object.fromEntries(new URL(url, 'http://localhost').searchParams);
    return parseBody(schema, searchParams);
}
