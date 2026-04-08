/**
 * Content negotiation utility
 *
 * Determines whether a response should be JSON or plain text based on the
 * Accept header. Plain text is opt-in: the caller must explicitly send
 * `Accept: text/plain`. Everything else (absent, *\/* , application/json)
 * defaults to JSON, making the API safe for browsers and API tooling.
 *
 * To get plain text with curl:
 *   curl -H "Accept: text/plain" http://localhost:4000/api/tasks
 */

/**
 * Determine preferred response format from an Accept header.
 *
 * Rules:
 * - Contains "text/plain" → 'text'
 * - Everything else (absent, *\/*,  application/json, etc.) → 'json'
 */
export function negotiate(accept: string | undefined): 'json' | 'text' {
    if (accept?.includes('text/plain')) {
        return 'text';
    }
    return 'json';
}
