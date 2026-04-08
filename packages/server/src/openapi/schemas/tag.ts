/**
 * Tag operation schemas (tags are derived from task data, no entity schema needed).
 */

import { z } from 'zod';
import { registry } from '../registry';

export const RenameTagSchema = registry.register(
    'RenameTagInput',
    z
        .object({
            from: z.string().min(1),
            to: z.string().min(1),
        })
        .openapi('RenameTagInput'),
);

export const MergeTagsSchema = registry.register(
    'MergeTagsInput',
    z
        .object({
            sources: z.array(z.string().min(1)).min(1),
            target: z.string().min(1),
        })
        .openapi('MergeTagsInput'),
);
