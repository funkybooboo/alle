/**
 * ExportAdapter — interface for exporting data out of the application.
 * Implementations deferred to v0.8.0.
 *
 * @template T The data type being exported
 * @template O The output format (e.g. string for CSV/JSON, Buffer for binary)
 */
export interface ExportAdapter<T, O = string> {
    export(data: T[]): Promise<O>;
}
