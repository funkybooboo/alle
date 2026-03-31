/**
 * Dependency injection container for client
 *
 * Wires up all adapters. Lazy initialization — dependencies are created
 * only when first accessed. Swap any implementation by changing one line here;
 * business logic stays completely unchanged.
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

export class Container {
    private _config: ConfigProvider | null = null;
    private _httpClient: HttpClient | null = null;
    private _logger: Logger | null = null;
    private _dateProvider: DateProvider | null = null;

    get config(): ConfigProvider {
        if (!this._config) {
            this._config = new ViteConfigProvider();
        }
        return this._config;
    }

    get httpClient(): HttpClient {
        if (!this._httpClient) {
            const apiUrl = this.config.get('VITE_API_URL', 'http://localhost:4000');
            this._httpClient = new FetchHttpClient(apiUrl);
        }
        return this._httpClient;
    }

    get logger(): Logger {
        if (!this._logger) {
            const isDev = this.config.getBoolean('DEV', false);
            const logLevel = isDev ? LogLevel.DEBUG : LogLevel.INFO;
            this._logger = new ConsoleLogger(logLevel);
        }
        return this._logger;
    }

    get dateProvider(): DateProvider {
        if (!this._dateProvider) {
            this._dateProvider = new NativeDateProvider();
        }
        return this._dateProvider;
    }
}

export const container = new Container();
