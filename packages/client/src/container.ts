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

import { ViteConfigProvider } from './adapters/config/ViteConfigProvider'
import { ConsoleLogger } from './adapters/logging/ConsoleLogger'
import { FetchHttpClient, type ConfigProvider, type HttpClient, type Logger } from '@alle/shared'

/**
 * Dependency injection container
 */
export class Container {
  private _config: ConfigProvider | null = null
  private _httpClient: HttpClient | null = null
  private _logger: Logger | null = null

  /**
   * Get the configuration provider
   * Lazy-initializes on first access
   */
  get config(): ConfigProvider {
    if (!this._config) {
      this._config = new ViteConfigProvider()
    }
    return this._config
  }

  /**
   * Get the HTTP client
   * Lazy-initializes on first access with API URL from config
   */
  get httpClient(): HttpClient {
    if (!this._httpClient) {
      const apiUrl = this.config.get('VITE_API_URL', 'http://localhost:4000')
      this._httpClient = new FetchHttpClient(apiUrl)
    }
    return this._httpClient
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
