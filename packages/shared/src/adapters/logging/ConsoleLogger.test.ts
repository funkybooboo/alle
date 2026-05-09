import { describe, expect, it } from 'bun:test';
import { ConsoleLogger } from './ConsoleLogger';
import { LogLevel } from './Logger';

describe('LogLevel', () => {
    it('has correct values', () => {
        expect(LogLevel.DEBUG).toBe(LogLevel.DEBUG);
        expect(LogLevel.INFO).toBe(LogLevel.INFO);
        expect(LogLevel.WARN).toBe(LogLevel.WARN);
        expect(LogLevel.ERROR).toBe(LogLevel.ERROR);
    });
});

describe('ConsoleLogger', () => {
    describe('log level filtering', () => {
        it('logs all levels when set to DEBUG', () => {
            const logger = new ConsoleLogger(LogLevel.DEBUG);
            const calls: string[] = [];
            const origLog = console.log;
            const origInfo = console.info;
            const origWarn = console.warn;
            const origError = console.error;
            console.log = (...args: unknown[]) => {
                calls.push(`log:${String(args[0] ?? '')}`);
            };
            console.info = (...args: unknown[]) => {
                calls.push(`info:${String(args[0] ?? '')}`);
            };
            console.warn = (...args: unknown[]) => {
                calls.push(`warn:${String(args[0] ?? '')}`);
            };
            console.error = (...args: unknown[]) => {
                calls.push(`error:${String(args[0] ?? '')}`);
            };

            logger.debug('debug msg');
            logger.info('info msg');
            logger.warn('warn msg');
            logger.error('error msg');

            console.log = origLog;
            console.info = origInfo;
            console.warn = origWarn;
            console.error = origError;

            expect(calls).toHaveLength(4);
            expect(calls[0]).toContain('debug msg');
            expect(calls[1]).toContain('info msg');
            expect(calls[2]).toContain('warn msg');
            expect(calls[3]).toContain('error msg');
        });

        it('suppresses DEBUG and INFO when set to WARN', () => {
            const logger = new ConsoleLogger(LogLevel.WARN);
            const calls: string[] = [];
            const origWarn = console.warn;
            const origError = console.error;
            console.warn = (...args: unknown[]) => {
                calls.push(`warn:${String(args[0] ?? '')}`);
            };
            console.error = (...args: unknown[]) => {
                calls.push(`error:${String(args[0] ?? '')}`);
            };

            logger.debug('debug msg');
            logger.info('info msg');
            logger.warn('warn msg');
            logger.error('error msg');

            console.warn = origWarn;
            console.error = origError;

            expect(calls).toHaveLength(2);
        });

        it('only logs ERROR when set to ERROR', () => {
            const logger = new ConsoleLogger(LogLevel.ERROR);
            const calls: string[] = [];
            const origError = console.error;
            console.error = (...args: unknown[]) => {
                calls.push(String(args[0] ?? ''));
            };

            logger.debug('debug msg');
            logger.info('info msg');
            logger.warn('warn msg');
            logger.error('error msg');

            console.error = origError;

            expect(calls).toHaveLength(1);
            expect(calls[0]).toContain('error msg');
        });
    });

    describe('message formatting', () => {
        it('includes level tag and message', () => {
            const logger = new ConsoleLogger(LogLevel.DEBUG);
            const calls: string[] = [];
            const origLog = console.log;
            console.log = (...args: unknown[]) => {
                calls.push(String(args[0] ?? ''));
            };

            logger.debug('test message');

            console.log = origLog;

            expect(calls).toHaveLength(1);
            expect(calls[0]).toContain('[DEBUG]');
            expect(calls[0]).toContain('test message');
        });

        it('includes context when provided', () => {
            const logger = new ConsoleLogger(LogLevel.DEBUG);
            const calls: string[] = [];
            const origLog = console.log;
            console.log = (...args: unknown[]) => {
                calls.push(String(args[0] ?? ''));
            };

            logger.debug('msg', { userId: 'abc' });

            console.log = origLog;

            expect(calls).toHaveLength(1);
            expect(calls[0]).toContain('"userId":"abc"');
        });
    });

    describe('error method', () => {
        it('includes error message when Error is passed', () => {
            const logger = new ConsoleLogger(LogLevel.ERROR);
            const calls: string[] = [];
            const origError = console.error;
            console.error = (...args: unknown[]) => {
                calls.push(String(args[0] ?? ''));
            };

            const err = new Error('boom');
            logger.error('something failed', err);

            console.error = origError;

            expect(calls).toHaveLength(1);
            expect(calls[0]).toContain('something failed');
            expect(calls[0]).toContain('boom');
        });
    });

    describe('default log level', () => {
        it('defaults to INFO', () => {
            const logger = new ConsoleLogger();
            const logCalls: string[] = [];
            const infoCalls: string[] = [];
            const origLog = console.log;
            const origInfo = console.info;
            console.log = (...args: unknown[]) => {
                logCalls.push(String(args[0] ?? ''));
            };
            console.info = (...args: unknown[]) => {
                infoCalls.push(String(args[0] ?? ''));
            };

            logger.debug('should not appear');
            logger.info('should appear');

            console.log = origLog;
            console.info = origInfo;

            expect(logCalls).toHaveLength(0);
            expect(infoCalls).toHaveLength(1);
        });
    });
});
