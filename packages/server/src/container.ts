/**
 * Dependency injection container for server
 *
 * This is where we wire up all our dependencies (adapters).
 * The container uses lazy initialization - dependencies are created
 * only when first accessed.
 *
 * This pattern makes it trivial to swap implementations:
 * - Change one line here to switch from Bun → Express
 * - Change one line here to switch from process.env → file config
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
import { EnvConfigProvider } from './adapters/config/EnvConfigProvider';
import { InMemoryProjectRepository } from './adapters/data/InMemoryProjectRepository';
import { InMemoryRecurringTaskRepository } from './adapters/data/InMemoryRecurringTaskRepository';
import { InMemorySomeDayGroupRepository } from './adapters/data/InMemorySomeDayGroupRepository';
import { InMemoryTaskRepository } from './adapters/data/InMemoryTaskRepository';
import { InMemoryUserPreferencesRepository } from './adapters/data/InMemoryUserPreferencesRepository';
import type { ProjectRepository } from './adapters/data/ProjectRepository';
import type { RecurringTaskRepository } from './adapters/data/RecurringTaskRepository';
import type { SomeDayGroupRepository } from './adapters/data/SomeDayGroupRepository';
import type { TaskRepository } from './adapters/data/TaskRepository';
import type { UserPreferencesRepository } from './adapters/data/UserPreferencesRepository';
import { BunHttpServer } from './adapters/http/BunHttpServer';
import type { HttpServer } from './adapters/http/HttpServer';

/**
 * Dependency injection container
 */
export class Container {
    private _config: ConfigProvider | null = null;
    private _httpServer: HttpServer | null = null;
    private _httpClient: HttpClient | null = null;
    private _taskRepository: TaskRepository | null = null;
    private _someDayGroupRepository: SomeDayGroupRepository | null = null;
    private _projectRepository: ProjectRepository | null = null;
    private _recurringTaskRepository: RecurringTaskRepository | null = null;
    private _userPreferencesRepository: UserPreferencesRepository | null = null;
    private _logger: Logger | null = null;
    private _dateProvider: DateProvider | null = null;

    /**
     * Get the configuration provider
     * Lazy-initializes on first access
     */
    get config(): ConfigProvider {
        if (!this._config) {
            this._config = new EnvConfigProvider();
        }
        return this._config;
    }

    /**
     * Get the HTTP server (for receiving requests)
     * Lazy-initializes on first access with CORS settings from config
     */
    get httpServer(): HttpServer {
        if (!this._httpServer) {
            const corsOrigin = this.config.get('CORS_ORIGIN', '*');
            this._httpServer = new BunHttpServer({ corsOrigin });
        }
        return this._httpServer;
    }

    /**
     * Get the HTTP client (for making outbound requests to external services)
     * Lazy-initializes on first access
     */
    get httpClient(): HttpClient {
        if (!this._httpClient) {
            this._httpClient = new FetchHttpClient();
        }
        return this._httpClient;
    }

    /**
     * Get the task repository (for data persistence)
     * Lazy-initializes on first access with injected date provider
     */
    get taskRepository(): TaskRepository {
        if (!this._taskRepository) {
            this._taskRepository = new InMemoryTaskRepository(this.dateProvider);
        }
        return this._taskRepository;
    }

    /**
     * Get the logger (for application logging)
     * Lazy-initializes on first access with log level from config
     */
    get logger(): Logger {
        if (!this._logger) {
            // Determine log level from config (not environment directly)
            const env = this.config.get('NODE_ENV', 'development');
            const logLevel = env === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
            this._logger = new ConsoleLogger(logLevel);
        }
        return this._logger;
    }

    get someDayGroupRepository(): SomeDayGroupRepository {
        if (!this._someDayGroupRepository) {
            this._someDayGroupRepository = new InMemorySomeDayGroupRepository(this.dateProvider);
        }
        return this._someDayGroupRepository;
    }

    get projectRepository(): ProjectRepository {
        if (!this._projectRepository) {
            this._projectRepository = new InMemoryProjectRepository(this.dateProvider);
        }
        return this._projectRepository;
    }

    get recurringTaskRepository(): RecurringTaskRepository {
        if (!this._recurringTaskRepository) {
            this._recurringTaskRepository = new InMemoryRecurringTaskRepository(this.dateProvider);
        }
        return this._recurringTaskRepository;
    }

    get userPreferencesRepository(): UserPreferencesRepository {
        if (!this._userPreferencesRepository) {
            this._userPreferencesRepository = new InMemoryUserPreferencesRepository(
                this.dateProvider,
            );
        }
        return this._userPreferencesRepository;
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
