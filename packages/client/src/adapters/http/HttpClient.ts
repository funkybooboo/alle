/**
 * HTTP Client abstraction interface
 *
 * Provides a runtime-agnostic way to make HTTP requests.
 * This allows the client to swap implementations (fetch, axios, etc.)
 * without changing any business logic.
 */

/**
 * HTTP request options
 */
export interface RequestOptions {
  headers?: Record<string, string>
  timeout?: number
}

/**
 * HTTP Client interface
 * Provides type-safe HTTP methods for making API requests
 */
export interface HttpClient {
  /**
   * Make a GET request
   * @param url - The URL to request (relative to base URL)
   * @param options - Optional request options
   * @returns Promise that resolves to the parsed response data
   * @throws HttpClientError if the request fails or returns non-2xx status
   */
  get<T>(url: string, options?: RequestOptions): Promise<T>

  /**
   * Make a POST request
   * @param url - The URL to request (relative to base URL)
   * @param body - The request body (will be JSON stringified)
   * @param options - Optional request options
   * @returns Promise that resolves to the parsed response data
   * @throws HttpClientError if the request fails or returns non-2xx status
   */
  post<T>(url: string, body: unknown, options?: RequestOptions): Promise<T>

  /**
   * Make a PUT request
   * @param url - The URL to request (relative to base URL)
   * @param body - The request body (will be JSON stringified)
   * @param options - Optional request options
   * @returns Promise that resolves to the parsed response data
   * @throws HttpClientError if the request fails or returns non-2xx status
   */
  put<T>(url: string, body: unknown, options?: RequestOptions): Promise<T>

  /**
   * Make a DELETE request
   * @param url - The URL to request (relative to base URL)
   * @param options - Optional request options
   * @returns Promise that resolves to the parsed response data
   * @throws HttpClientError if the request fails or returns non-2xx status
   */
  delete<T>(url: string, options?: RequestOptions): Promise<T>
}

/**
 * HTTP error thrown by client on non-2xx responses
 */
export class HttpClientError extends Error {
  constructor(
    public statusCode: number,
    public statusText: string,
    public body?: unknown
  ) {
    super(`HTTP Error ${statusCode}: ${statusText}`)
    this.name = 'HttpClientError'
  }
}
