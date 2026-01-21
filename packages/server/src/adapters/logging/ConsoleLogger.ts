import { LogLevel, ConsoleLoggerBase } from '@alle/shared'

export class ConsoleLogger extends ConsoleLoggerBase {
  protected getDefaultLogLevel(): LogLevel {
    const env = process.env.NODE_ENV || 'development'
    return env === 'production' ? LogLevel.INFO : LogLevel.DEBUG
  }
}
