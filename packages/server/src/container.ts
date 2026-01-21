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

import { EnvConfigProvider } from './adapters/config/EnvConfigProvider'
import { BunHttpServer } from './adapters/http/BunHttpServer'
import { InMemoryTodoRepository } from './adapters/data/InMemoryTodoRepository'
import { ConsoleLogger } from './adapters/logging/ConsoleLogger'
import { FetchHttpClient, type ConfigProvider, type HttpClient, type TodoRepository, type Logger } from '@alle/shared'
import type { HttpServer } from './adapters/http/HttpServer'

/**
 * Dependency injection container
 */
export class Container {
  private _config: ConfigProvider | null = null
  private _httpServer: HttpServer | null = null
  private _httpClient: HttpClient | null = null
  private _todoRepository: TodoRepository | null = null
  private _logger: Logger | null = null

  /**
   * Get the configuration provider
   * Lazy-initializes on first access
   */
  get config(): ConfigProvider {
    if (!this._config) {
      this._config = new EnvConfigProvider()
    }
    return this._config
  }

  /**
   * Get the HTTP server (for receiving requests)
   * Lazy-initializes on first access with CORS settings from config
   */
  get httpServer(): HttpServer {
    if (!this._httpServer) {
      const corsOrigin = this.config.get('CORS_ORIGIN', '*')
      this._httpServer = new BunHttpServer({ corsOrigin })
    }
    return this._httpServer
  }

  /**
   * Get the HTTP client (for making outbound requests to external services)
   * Lazy-initializes on first access
   */
  get httpClient(): HttpClient {
    if (!this._httpClient) {
      this._httpClient = new FetchHttpClient()
    }
    return this._httpClient
  }

  /**
   * Get the todo repository (for data persistence)
   * Lazy-initializes on first access
   */
  get todoRepository(): TodoRepository {
    if (!this._todoRepository) {
      this._todoRepository = new InMemoryTodoRepository()
    }
    return this._todoRepository
  }

  /**
   * Get the logger (for application logging)
   * Lazy-initializes on first access
   */
  get logger(): Logger {
    if (!this._logger) {
      this._logger = new ConsoleLogger()
    }
    return this._logger
  }
}

/**
 * Singleton instance of the container
 * Import this in your application code to access dependencies
 */
export const container = new Container()
