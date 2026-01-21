import type { HttpClient, RequestOptions } from './HttpClient'
import { HttpClientError } from './HttpClient'

export class FetchHttpClient implements HttpClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', url, undefined, options)
  }

  async post<T>(url: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', url, body, options)
  }

  async put<T>(url: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', url, body, options)
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', url, undefined, options)
  }

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
