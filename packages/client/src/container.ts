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
import type { ConfigProvider } from '@alle/shared'

/**
 * Dependency injection container
 */
export class Container {
  private _config: ConfigProvider | null = null

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
}

/**
 * Singleton instance of the container
 * Import this in your application code to access dependencies
 */
export const container = new Container()
