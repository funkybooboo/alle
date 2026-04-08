/**
 * ImportAdapter — interface for importing data into the application.
 * Implementations deferred to v0.8.0.
 *
 * @template T The data type being imported
 * @template I The input format (e.g. string for CSV/JSON, Buffer for binary)
 */
export interface ImportAdapter<T, I = string> {
    import(input: I): Promise<T[]>;
}
