/**
 * Configuration provider abstraction
 *
 * Provides a runtime-agnostic way to access configuration values.
 * This interface allows both client and server to access configuration
 * through the same API, regardless of the underlying implementation
 * (process.env, import.meta.env, etc.)
 */
export interface ConfigProvider {
    /**
     * Get a string configuration value
     * @param key - Configuration key
     * @param defaultValue - Optional default value if key is not found
     * @returns The configuration value as a string
     * @throws ConfigError if key is not found and no default is provided
     */
    get(key: string, defaultValue?: string): string;

    /**
     * Get a number configuration value
     * @param key - Configuration key
     * @param defaultValue - Optional default value if key is not found
     * @returns The configuration value parsed as a number
     * @throws ConfigError if key is not found and no default is provided
     * @throws Error if the value cannot be parsed as a number
     */
    getNumber(key: string, defaultValue?: number): number;

    /**
     * Get a boolean configuration value
     * @param key - Configuration key
     * @param defaultValue - Optional default value if key is not found
     * @returns The configuration value parsed as a boolean
     * @throws ConfigError if key is not found and no default is provided
     * @throws Error if the value cannot be parsed as a boolean
     */
    getBoolean(key: string, defaultValue?: boolean): boolean;

    /**
     * Check if a configuration key exists
     * @param key - Configuration key to check
     * @returns true if the key exists, false otherwise
     */
    has(key: string): boolean;
}

/**
 * Error thrown when a required configuration key is missing
 */
export class ConfigError extends Error {
    constructor(key: string) {
        super(`Required configuration key not found: ${key}`);
        this.name = 'ConfigError';
    }
}
