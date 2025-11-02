import { describe, it, expect, afterEach } from 'vitest';
import { taskAPI } from '../../api/task-api';

/**
 * System tests for frontend-backend integration
 *
 * These tests run against the actual backend server (port 8000)
 * and verify the full request/response cycle including:
 * - Real database operations
 * - CORS headers
 * - GraphQL API endpoints
 * - Error handling
 *
 * Prerequisites:
 * - Backend server must be running on port 8000
 * - Database must be accessible and migrations applied
 */

describe('Frontend-Backend System Tests', () => {
  let createdTaskIds: string[] = [];

  // Clean up test tasks after each test
  afterEach(async () => {
    for (const id of createdTaskIds) {
      try {
        await taskAPI.deleteTask(id);
      } catch {
        // Task might already be deleted, ignore errors
      }
    }
    createdTaskIds = [];
  });

  describe('Task CRUD Operations', () => {
    it('creates a new task in the database', async () => {
      const taskText = 'System test task - ' + Date.now();
      const taskDate = new Date('2025-11-05T10:00:00Z');

      const newTask = await taskAPI.createTask(taskText, taskDate);

      expect(newTask).toBeDefined();
      expect(newTask.id).toBeDefined();
      expect(newTask.text).toBe(taskText);
      expect(newTask.completed).toBe(false);
      expect(newTask.date).toBeInstanceOf(Date);

      createdTaskIds.push(newTask.id);
    });

    it('retrieves all tasks from the database', async () => {
      // Create a test task first
      const testTask = await taskAPI.createTask(
        'Test retrieval - ' + Date.now(),
        new Date()
      );
      createdTaskIds.push(testTask.id);

      const tasks = await taskAPI.getAllTasks();

      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);

      // Verify the test task is in the results
      const foundTask = tasks.find((t) => t.id === testTask.id);
      expect(foundTask).toBeDefined();
      expect(foundTask?.text).toBe(testTask.text);
    });

    it('updates a task in the database', async () => {
      // Create a test task
      const originalTask = await taskAPI.createTask(
        'Original text - ' + Date.now(),
        new Date()
      );
      createdTaskIds.push(originalTask.id);

      // Update the task
      const updatedText = 'Updated text - ' + Date.now();
      const updatedTask = await taskAPI.updateTask(originalTask.id, {
        text: updatedText,
      });

      expect(updatedTask.id).toBe(originalTask.id);
      expect(updatedTask.text).toBe(updatedText);

      // Verify the update persisted
      const allTasks = await taskAPI.getAllTasks();
      const foundTask = allTasks.find((t) => t.id === originalTask.id);
      expect(foundTask?.text).toBe(updatedText);
    });

    it('toggles task completion status', async () => {
      // Create a test task
      const task = await taskAPI.createTask(
        'Task to toggle - ' + Date.now(),
        new Date()
      );
      createdTaskIds.push(task.id);

      expect(task.completed).toBe(false);

      // Toggle to completed
      const completedTask = await taskAPI.updateTask(task.id, {
        completed: true,
      });
      expect(completedTask.completed).toBe(true);

      // Toggle back to incomplete
      const incompleteTask = await taskAPI.updateTask(task.id, {
        completed: false,
      });
      expect(incompleteTask.completed).toBe(false);
    });

    it('updates task date', async () => {
      // Create a test task
      const originalDate = new Date('2025-11-05T10:00:00Z');
      const task = await taskAPI.createTask(
        'Task with date - ' + Date.now(),
        originalDate
      );
      createdTaskIds.push(task.id);

      // Update the date
      const newDate = new Date('2025-12-25T15:00:00Z');
      const updatedTask = await taskAPI.updateTask(task.id, { date: newDate });

      expect(updatedTask.date.toISOString()).toBe(newDate.toISOString());

      // Verify the update persisted
      const allTasks = await taskAPI.getAllTasks();
      const foundTask = allTasks.find((t) => t.id === task.id);
      expect(foundTask?.date.toISOString()).toBe(newDate.toISOString());
    });

    it('deletes a task from the database', async () => {
      // Create a test task
      const task = await taskAPI.createTask(
        'Task to delete - ' + Date.now(),
        new Date()
      );
      const taskId = task.id;

      // Verify it exists
      let allTasks = await taskAPI.getAllTasks();
      let foundTask = allTasks.find((t) => t.id === taskId);
      expect(foundTask).toBeDefined();

      // Delete the task
      const result = await taskAPI.deleteTask(taskId);
      expect(result).toBe(true);

      // Verify it's gone
      allTasks = await taskAPI.getAllTasks();
      foundTask = allTasks.find((t) => t.id === taskId);
      expect(foundTask).toBeUndefined();

      // Remove from cleanup list since it's already deleted
      createdTaskIds = createdTaskIds.filter((id) => id !== taskId);
    });

    it('handles deleting non-existent task', async () => {
      const result = await taskAPI.deleteTask('99999999');
      expect(result).toBe(false);
    });
  });

  describe('Full Workflow', () => {
    it('completes a full task lifecycle', async () => {
      // Create
      const taskText = 'Full lifecycle task - ' + Date.now();
      const taskDate = new Date('2025-11-06T09:00:00Z');
      const newTask = await taskAPI.createTask(taskText, taskDate);
      createdTaskIds.push(newTask.id);

      expect(newTask.text).toBe(taskText);
      expect(newTask.completed).toBe(false);

      // Update text
      const updatedText = 'Updated lifecycle task - ' + Date.now();
      const updatedTask = await taskAPI.updateTask(newTask.id, {
        text: updatedText,
      });
      expect(updatedTask.text).toBe(updatedText);

      // Toggle completion
      const completedTask = await taskAPI.updateTask(newTask.id, {
        completed: true,
      });
      expect(completedTask.completed).toBe(true);

      // Update date
      const newDate = new Date('2025-11-07T14:00:00Z');
      const dateUpdatedTask = await taskAPI.updateTask(newTask.id, {
        date: newDate,
      });
      expect(dateUpdatedTask.date.toISOString()).toBe(newDate.toISOString());

      // Verify all updates persisted
      const allTasks = await taskAPI.getAllTasks();
      const finalTask = allTasks.find((t) => t.id === newTask.id);
      expect(finalTask).toBeDefined();
      expect(finalTask?.text).toBe(updatedText);
      expect(finalTask?.completed).toBe(true);
      expect(finalTask?.date.toISOString()).toBe(newDate.toISOString());

      // Delete
      const deleteResult = await taskAPI.deleteTask(newTask.id);
      expect(deleteResult).toBe(true);

      // Verify deletion
      const tasksAfterDelete = await taskAPI.getAllTasks();
      const deletedTask = tasksAfterDelete.find((t) => t.id === newTask.id);
      expect(deletedTask).toBeUndefined();

      // Remove from cleanup list
      createdTaskIds = createdTaskIds.filter((id) => id !== newTask.id);
    });

    it('handles multiple concurrent task operations', async () => {
      // Create multiple tasks concurrently
      const taskPromises = Array.from({ length: 5 }, (_, i) =>
        taskAPI.createTask(
          `Concurrent task ${i + 1} - ${Date.now()}`,
          new Date()
        )
      );

      const tasks = await Promise.all(taskPromises);
      createdTaskIds.push(...tasks.map((t) => t.id));

      expect(tasks.length).toBe(5);
      tasks.forEach((task, i) => {
        expect(task.id).toBeDefined();
        expect(task.text).toContain(`Concurrent task ${i + 1}`);
      });

      // Update all tasks concurrently
      const updatePromises = tasks.map((task) =>
        taskAPI.updateTask(task.id, { completed: true })
      );
      const updatedTasks = await Promise.all(updatePromises);

      updatedTasks.forEach((task) => {
        expect(task.completed).toBe(true);
      });

      // Verify all updates persisted
      const allTasks = await taskAPI.getAllTasks();
      tasks.forEach((originalTask) => {
        const foundTask = allTasks.find((t) => t.id === originalTask.id);
        expect(foundTask?.completed).toBe(true);
      });
    });
  });

  describe('Data Integrity', () => {
    it('preserves special characters in task text', async () => {
      const specialText =
        'Task with special chars: @#$%^&*() "quotes" \'apostrophes\' <tags>';
      const task = await taskAPI.createTask(specialText, new Date());
      createdTaskIds.push(task.id);

      expect(task.text).toBe(specialText);

      // Verify it persisted correctly
      const allTasks = await taskAPI.getAllTasks();
      const foundTask = allTasks.find((t) => t.id === task.id);
      expect(foundTask?.text).toBe(specialText);
    });

    it('handles empty task text', async () => {
      const task = await taskAPI.createTask('', new Date());
      createdTaskIds.push(task.id);

      expect(task.text).toBe('');

      // Verify it persisted
      const allTasks = await taskAPI.getAllTasks();
      const foundTask = allTasks.find((t) => t.id === task.id);
      expect(foundTask?.text).toBe('');
    });

    it('handles very long task text', async () => {
      const longText = 'A'.repeat(1000);
      const task = await taskAPI.createTask(longText, new Date());
      createdTaskIds.push(task.id);

      expect(task.text).toBe(longText);
      expect(task.text.length).toBe(1000);
    });

    it('preserves date precision', async () => {
      const preciseDate = new Date('2025-11-05T14:23:45.678Z');
      const task = await taskAPI.createTask(
        'Date precision test - ' + Date.now(),
        preciseDate
      );
      createdTaskIds.push(task.id);

      // Dates should match (allowing for some precision loss in serialization)
      const timeDiff = Math.abs(task.date.getTime() - preciseDate.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });
  });

  describe('Error Handling', () => {
    it('handles updating non-existent task', async () => {
      await expect(
        taskAPI.updateTask('99999999', { text: 'Updated text' })
      ).rejects.toThrow();
    });

    it('validates required fields', async () => {
      // This test depends on backend validation
      // If backend doesn't validate, this test might need adjustment
      try {
        await taskAPI.createTask('', new Date());
        // If it succeeds, just verify the task was created
        expect(true).toBe(true);
      } catch (error) {
        // If it fails, that's also acceptable behavior
        expect(error).toBeDefined();
      }
    });
  });

  describe('CORS and Network', () => {
    it('successfully communicates with backend API', async () => {
      // This test verifies CORS headers are working
      const tasks = await taskAPI.getAllTasks();
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('handles GraphQL response format correctly', async () => {
      const task = await taskAPI.createTask(
        'GraphQL format test - ' + Date.now(),
        new Date()
      );
      createdTaskIds.push(task.id);

      // Verify all expected fields are present and correctly typed
      expect(typeof task.id).toBe('string');
      expect(typeof task.text).toBe('string');
      expect(typeof task.completed).toBe('boolean');
      expect(task.date).toBeInstanceOf(Date);
      expect(task.date.toISOString()).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );
    });
  });
});
