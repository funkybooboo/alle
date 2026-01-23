import { type LogContext, type Logger, LogLevel } from './Logger';

/**
 * Console-based logger implementation
 *
 * Outputs log messages to the console with timestamps and context.
 * Log level is configured via constructor parameter.
 */
export class ConsoleLogger implements Logger {
    protected minLevel: LogLevel;

    constructor(minLevel: LogLevel = LogLevel.INFO) {
        this.minLevel = minLevel;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const minIndex = levels.indexOf(this.minLevel);
        const currentIndex = levels.indexOf(level);
        return currentIndex >= minIndex;
    }

    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    debug(message: string, context?: LogContext): void {
        if (!this.shouldLog(LogLevel.DEBUG)) return;
        console.log(this.formatMessage(LogLevel.DEBUG, message, context));
    }

    info(message: string, context?: LogContext): void {
        if (!this.shouldLog(LogLevel.INFO)) return;
        console.info(this.formatMessage(LogLevel.INFO, message, context));
    }

    warn(message: string, context?: LogContext): void {
        if (!this.shouldLog(LogLevel.WARN)) return;
        console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }

    error(message: string, error?: Error | unknown, context?: LogContext): void {
        if (!this.shouldLog(LogLevel.ERROR)) return;

        const errorContext =
            error instanceof Error
                ? { ...context, error: error.message, stack: error.stack }
                : { ...context, error };

        console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
    }
}
