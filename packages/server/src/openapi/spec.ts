/**
 * Generates the OpenAPI 3.1 document from the registry.
 *
 * All schema and path imports here are for their side effects (registration).
 * The module system ensures each is only evaluated once.
 */

import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { dump as yamlDump } from 'js-yaml';
// Side-effect imports: register all schemas and paths
import './schemas/common';
import './schemas/task';
import './schemas/project';
import './schemas/someDayGroup';
import './schemas/recurringTask';
import './schemas/tag';
import './schemas/userPreferences';
import './paths';
import { registry } from './registry';

let cachedSpec: ReturnType<OpenApiGeneratorV31['generateDocument']> | null = null;
let cachedYaml: string | null = null;

function buildSpec() {
    if (cachedSpec) return;
    const generator = new OpenApiGeneratorV31(registry.definitions);
    cachedSpec = generator.generateDocument({
        openapi: '3.1.0',
        info: {
            title: 'Alle Task API',
            version: '0.3.0',
            description:
                'REST API for the Alle task manager. Designed to be curl-friendly:\n' +
                'requests without `Accept: application/json` return plain-text responses\n' +
                'on list endpoints.',
        },
        servers: [{ url: 'http://localhost:4000', description: 'Local development' }],
    });
    cachedYaml = yamlDump(cachedSpec, { indent: 2 });
}

/** Returns the OpenAPI spec as a plain object. */
export function getOpenApiJson(): object {
    buildSpec();
    return cachedSpec as object;
}

/** Returns the OpenAPI spec serialized as YAML. */
export function getOpenApiYaml(): string {
    buildSpec();
    return cachedYaml as string;
}
