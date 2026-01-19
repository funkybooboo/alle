/**
 * Fetch-based HTTP client implementation
 *
 * Wraps the native fetch API to provide a clean, type-safe interface.
 * Benefits:
 * - Automatic JSON parsing
 * - Automatic error handling
 * - Base URL support
 * - Timeout support
 * - Easy to swap for axios/ky/etc by changing one line in container
 */

import { HttpClient, RequestOptions, HttpClientError } from './HttpClient'

/**
 * HTTP client implementation using native fetch API
 */
export class FetchHttpClient implements HttpClient {
  private baseUrl: string

  /**
   * Create a new HTTP client
   * @param baseUrl - Base URL for all requests (e.g., 'http://localhost:4000')
   */
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', url, undefined, options)
  }

  /**
   * Make a POST request
   */
  async post<T>(url: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', url, body, options)
  }

  /**
   * Make a PUT request
   */
  async put<T>(url: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', url, body, options)
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', url, undefined, options)
  }

  /**
   * Internal request method
   * Handles the actual HTTP request logic
   */
  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const fullUrl = this.baseUrl + url

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    }

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.timeout ? AbortSignal.timeout(options.timeout) : undefined,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new HttpClientError(response.status, response.statusText, errorBody)
    }

    return response.json() as Promise<T>
  }
}
