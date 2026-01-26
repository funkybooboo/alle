import { describe, expect, test } from 'bun:test';
import { TASK_CONSTRAINTS } from './constants';

describe('TASK_CONSTRAINTS', () => {
    test('should have valid constraints', () => {
        expect(TASK_CONSTRAINTS.MIN_TEXT_LENGTH).toBe(1);
        expect(TASK_CONSTRAINTS.MAX_TEXT_LENGTH).toBe(500);
        expect(TASK_CONSTRAINTS.MAX_TEXT_LENGTH).toBeGreaterThan(TASK_CONSTRAINTS.MIN_TEXT_LENGTH);
    });
});
