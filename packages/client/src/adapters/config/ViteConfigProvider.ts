/**
 * Vite environment variable configuration provider
 *
 * Wraps import.meta.env to provide type-safe access to configuration values.
 * This allows the client to be build-tool-agnostic - we could swap this
 * for a different config source (webpack env, runtime config, etc.) without
 * changing any business logic.
 */

import { ConfigError, type ConfigProvider } from '@alle/shared';

/**
 * Configuration provider that reads from import.meta.env (Vite)
 */
export class ViteConfigProvider implements ConfigProvider {
    /**
     * Get a string configuration value from import.meta.env
     */
    get(key: string, defaultValue?: string): string {
        const value = import.meta.env[key];

        if (value === undefined) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new ConfigError(key);
        }

        return value;
    }

    /**
     * Get a number configuration value from import.meta.env
     * Parses the string value to a number and validates it
     */
    getNumber(key: string, defaultValue?: number): number {
        const value = this.get(key, defaultValue?.toString());
        const parsed = Number(value);

        if (Number.isNaN(parsed)) {
            throw new Error(`Configuration value for ${key} is not a valid number: ${value}`);
        }

        return parsed;
    }

    /**
     * Get a boolean configuration value from import.meta.env
     * Accepts 'true', 'false', '1', or '0'
     */
    getBoolean(key: string, defaultValue?: boolean): boolean {
        const value = this.get(key, defaultValue?.toString());

        if (value === 'true' || value === '1') return true;
        if (value === 'false' || value === '0') return false;

        throw new Error(`Configuration value for ${key} is not a valid boolean: ${value}`);
    }

    /**
     * Check if a configuration key exists in import.meta.env
     */
    has(key: string): boolean {
        return import.meta.env[key] !== undefined;
    }
}
