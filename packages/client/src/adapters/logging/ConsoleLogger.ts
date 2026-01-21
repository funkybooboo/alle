import { LogLevel, ConsoleLoggerBase } from '@alle/shared'

export class ConsoleLogger extends ConsoleLoggerBase {
  protected getDefaultLogLevel(): LogLevel {
    const isDev = import.meta.env.DEV
    return isDev ? LogLevel.DEBUG : LogLevel.INFO
  }
}
