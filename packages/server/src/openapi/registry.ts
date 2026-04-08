/**
 * OpenAPI registry — single instance shared across all schema and path registrations.
 *
 * Importing this module has the side effect of calling extendZodWithOpenApi(z),
 * which adds the .openapi() method to all Zod schemas. All schema files must
 * import from this module (directly or transitively) before using .openapi().
 */

import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();
