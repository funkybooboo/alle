/**
 * Dependency injection container for client
 *
 * This is where we wire up all our dependencies (adapters).
 * The container uses lazy initialization - dependencies are created
 * only when first accessed.
 *
 * This pattern makes it trivial to swap implementations:
 * - Change one line here to switch from fetch → axios
 * - Change one line here to switch from import.meta.env → runtime config
 * - Business logic stays completely unchanged
 */

import {
    type ConfigProvider,
    ConsoleLogger,
    type DateProvider,
    FetchHttpClient,
    type HttpClient,
    type Logger,
    LogLevel,
    NativeDateProvider,
} from '@alle/shared';
import { ViteConfigProvider } from './adapters/config/ViteConfigProvider';

/**
 * Dependency injection container
 */
export class Container {
    private _config: ConfigProvider | null = null;
    private _httpClient: HttpClient | null = null;
    private _logger: Logger | null = null;
    private _dateProvider: DateProvider | null = null;

    /**
     * Get the configuration provider
     * Lazy-initializes on first access
     */
    get config(): ConfigProvider {
        if (!this._config) {
            this._config = new ViteConfigProvider();
        }
        return this._config;
    }

    /**
     * Get the HTTP client
     * Lazy-initializes on first access with API URL from config
     */
    get httpClient(): HttpClient {
        if (!this._httpClient) {
            const apiUrl = this.config.get('VITE_API_URL', 'http://localhost:4000');
            this._httpClient = new FetchHttpClient(apiUrl);
        }
        return this._httpClient;
    }

    /**
     * Get the logger (for application logging)
     * Lazy-initializes on first access with log level from config
     */
    get logger(): Logger {
        if (!this._logger) {
            // Determine log level from config (not environment directly)
            const isDev = this.config.getBoolean('DEV', false);
            const logLevel = isDev ? LogLevel.DEBUG : LogLevel.INFO;
            this._logger = new ConsoleLogger(logLevel);
        }
        return this._logger;
    }

    /**
     * Get the date provider (for date/time operations)
     * Lazy-initializes on first access
     */
    get dateProvider(): DateProvider {
        if (!this._dateProvider) {
            this._dateProvider = new NativeDateProvider();
        }
        return this._dateProvider;
    }
}

/**
 * Singleton instance of the container
 * Import this in your application code to access dependencies
 */
export const container = new Container();
