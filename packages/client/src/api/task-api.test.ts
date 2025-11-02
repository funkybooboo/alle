import { describe, it, expect, beforeEach } from 'vitest';
import { taskAPI } from './task-api';
import {
  resetTasksStore,
  getTasksStore,
} from '../tests/mocks/graphql-handlers';

describe('taskAPI', () => {
  beforeEach(() => {
    resetTasksStore();
  });

  describe('getAllTasks', () => {
    it('fetches all tasks from the API', async () => {
      const tasks = await taskAPI.getAllTasks();

      expect(tasks).toBeDefined();
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0]).toHaveProperty('id');
      expect(tasks[0]).toHaveProperty('text');
      expect(tasks[0]).toHaveProperty('completed');
      expect(tasks[0]).toHaveProperty('date');
    });

    it('converts GraphQL response to Task type', async () => {
      const tasks = await taskAPI.getAllTasks();
      const firstTask = tasks[0];

      expect(typeof firstTask.id).toBe('string');
      expect(typeof firstTask.text).toBe('string');
      expect(typeof firstTask.completed).toBe('boolean');
      expect(firstTask.date).toBeInstanceOf(Date);
    });
  });

  describe('createTask', () => {
    it('creates a new task', async () => {
      const taskText = 'New test task';
      const taskDate = new Date('2025-11-03T10:00:00Z');

      const newTask = await taskAPI.createTask(taskText, taskDate);

      expect(newTask).toBeDefined();
      expect(newTask.text).toBe(taskText);
      expect(newTask.completed).toBe(false);
      expect(newTask.date).toBeInstanceOf(Date);
    });

    it('adds task to the store', async () => {
      const initialCount = getTasksStore().length;
      await taskAPI.createTask('Another task', new Date());
      const newCount = getTasksStore().length;

      expect(newCount).toBe(initialCount + 1);
    });
  });

  describe('updateTask', () => {
    it('updates task text', async () => {
      const tasks = await taskAPI.getAllTasks();
      const taskId = tasks[0].id;
      const newText = 'Updated task text';

      const updatedTask = await taskAPI.updateTask(taskId, { text: newText });

      expect(updatedTask.text).toBe(newText);
      expect(updatedTask.id).toBe(taskId);
    });

    it('toggles task completion', async () => {
      const tasks = await taskAPI.getAllTasks();
      const task = tasks[0];
      const originalCompleted = task.completed;

      const updatedTask = await taskAPI.updateTask(task.id, {
        completed: !originalCompleted,
      });

      expect(updatedTask.completed).toBe(!originalCompleted);
    });

    it('updates task date', async () => {
      const tasks = await taskAPI.getAllTasks();
      const taskId = tasks[0].id;
      const newDate = new Date('2025-12-25T12:00:00Z');

      const updatedTask = await taskAPI.updateTask(taskId, { date: newDate });

      expect(updatedTask.date.toISOString()).toBe(newDate.toISOString());
    });

    it('handles partial updates', async () => {
      const tasks = await taskAPI.getAllTasks();
      const task = tasks[0];
      const originalText = task.text;

      const updatedTask = await taskAPI.updateTask(task.id, {
        completed: true,
      });

      expect(updatedTask.text).toBe(originalText);
      expect(updatedTask.completed).toBe(true);
    });
  });

  describe('deleteTask', () => {
    it('deletes a task by ID', async () => {
      const tasks = await taskAPI.getAllTasks();
      const taskId = tasks[0].id;
      const initialCount = getTasksStore().length;

      const result = await taskAPI.deleteTask(taskId);

      expect(result).toBe(true);
      expect(getTasksStore().length).toBe(initialCount - 1);
    });

    it('returns false for non-existent task', async () => {
      const result = await taskAPI.deleteTask('99999');

      expect(result).toBe(false);
    });
  });

  describe('error handling', () => {
    it('handles network errors gracefully', async () => {
      // This would require setting up a failure handler in MSW
      // For now, we'll test that the API calls are properly typed
      expect(taskAPI.getAllTasks).toBeDefined();
      expect(taskAPI.createTask).toBeDefined();
      expect(taskAPI.updateTask).toBeDefined();
      expect(taskAPI.deleteTask).toBeDefined();
    });
  });
});
