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
import type { ConfigProvider } from '@alle/shared'
import type { HttpServer } from './adapters/http/HttpServer'

/**
 * Dependency injection container
 */
export class Container {
  private _config: ConfigProvider | null = null
  private _httpServer: HttpServer | null = null

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
   * Get the HTTP server
   * Lazy-initializes on first access with CORS settings from config
   */
  get httpServer(): HttpServer {
    if (!this._httpServer) {
      const corsOrigin = this.config.get('CORS_ORIGIN', '*')
      this._httpServer = new BunHttpServer({ corsOrigin })
    }
    return this._httpServer
  }
}

/**
 * Singleton instance of the container
 * Import this in your application code to access dependencies
 */
export const container = new Container()
