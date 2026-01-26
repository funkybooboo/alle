import { describe, expect, test } from 'bun:test';
import { Container } from './container';

describe('Container', () => {
    const container = new Container();

    test('should provide all required services', () => {
        // Verify all services can be instantiated
        expect(container.config).toBeDefined();
        expect(container.httpClient).toBeDefined();
        expect(container.logger).toBeDefined();
        expect(container.dateProvider).toBeDefined();
    });

    test('should return same instance on multiple calls (singleton)', () => {
        const config1 = container.config;
        const config2 = container.config;

        expect(config1).toBe(config2);
    });
});
