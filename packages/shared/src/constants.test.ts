import { describe, expect, it } from 'bun:test';
import { API_ROUTES, TASK_CONSTRAINTS } from './constants';

describe('TASK_CONSTRAINTS', () => {
    it('has MAX_TEXT_LENGTH of 500', () => {
        expect(TASK_CONSTRAINTS.MAX_TEXT_LENGTH).toBe(500);
    });

    it('has MIN_TEXT_LENGTH of 1', () => {
        expect(TASK_CONSTRAINTS.MIN_TEXT_LENGTH).toBe(1);
    });
});

describe('API_ROUTES', () => {
    it('has correct health route', () => {
        expect(API_ROUTES.HEALTH).toBe('/api/health');
    });

    it('has correct tasks routes', () => {
        expect(API_ROUTES.TASKS).toBe('/api/tasks');
        expect(API_ROUTES.TASK_BY_ID('123')).toBe('/api/tasks/123');
        expect(API_ROUTES.TASK_RESTORE('456')).toBe('/api/tasks/456/restore');
        expect(API_ROUTES.TASK_TRASH).toBe('/api/tasks/trash');
        expect(API_ROUTES.TASK_PURGE).toBe('/api/tasks/purge');
    });

    it('has correct someday group routes', () => {
        expect(API_ROUTES.SOMEDAY_GROUPS).toBe('/api/someday-groups');
        expect(API_ROUTES.SOMEDAY_GROUP_BY_ID('abc')).toBe('/api/someday-groups/abc');
    });

    it('has correct project routes', () => {
        expect(API_ROUTES.PROJECTS).toBe('/api/projects');
        expect(API_ROUTES.PROJECT_BY_ID('p1')).toBe('/api/projects/p1');
        expect(API_ROUTES.PROJECT_ACTIVATE('p1')).toBe('/api/projects/p1/activate');
        expect(API_ROUTES.PROJECT_DEACTIVATE('p1')).toBe('/api/projects/p1/deactivate');
    });

    it('has correct recurring task routes', () => {
        expect(API_ROUTES.RECURRING_TASKS).toBe('/api/recurring-tasks');
        expect(API_ROUTES.RECURRING_TASK_BY_ID('r1')).toBe('/api/recurring-tasks/r1');
        expect(API_ROUTES.RECURRING_TASK_GENERATE('r1')).toBe('/api/recurring-tasks/r1/generate');
    });

    it('has correct tag routes', () => {
        expect(API_ROUTES.TAGS).toBe('/api/tags');
        expect(API_ROUTES.TAG_RENAME).toBe('/api/tags/rename');
        expect(API_ROUTES.TAG_MERGE).toBe('/api/tags/merge');
    });

    it('has correct user preferences route', () => {
        expect(API_ROUTES.USER_PREFERENCES).toBe('/api/preferences');
    });

    it('has correct openapi routes', () => {
        expect(API_ROUTES.OPENAPI_YAML).toBe('/openapi.yaml');
        expect(API_ROUTES.OPENAPI_JSON).toBe('/openapi.json');
    });
});
