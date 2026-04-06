import { describe, expect, test } from 'bun:test';
import { Container } from './container';

describe('Container', () => {
    const container = new Container();

    test('should provide all required services', () => {
        // Verify all services can be instantiated
        expect(container.config).toBeDefined();
        expect(container.httpServer).toBeDefined();
        expect(container.taskRepository).toBeDefined();
        expect(container.logger).toBeDefined();
        expect(container.dateProvider).toBeDefined();
        expect(container.someDayGroupRepository).toBeDefined();
        expect(container.projectRepository).toBeDefined();
        expect(container.recurringTaskRepository).toBeDefined();
        expect(container.userPreferencesRepository).toBeDefined();
    });

    test('should return same instance on multiple calls (singleton)', () => {
        const config1 = container.config;
        const config2 = container.config;
        expect(config1).toBe(config2);

        const repo1 = container.someDayGroupRepository;
        const repo2 = container.someDayGroupRepository;
        expect(repo1).toBe(repo2);
    });
});
