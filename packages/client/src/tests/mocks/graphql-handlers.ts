import { http, HttpResponse } from 'msw';
import { mockTasks } from '../fixtures/tasks';

// GraphQL endpoint URL
const GRAPHQL_URL = 'http://localhost:8000/graphql';

// Mock GraphQL responses
let tasksStore = [...mockTasks];

export const handlers = [
  // Handle all GraphQL requests
  http.post(GRAPHQL_URL, async ({ request }) => {
    const body = (await request.json()) as {
      query: string;
      variables?: Record<string, unknown>;
    };

    // GetAllTasks query
    if (body.query.includes('GetAllTasks')) {
      return HttpResponse.json({
        data: {
          tasks: tasksStore.map((task) => ({
            id: parseInt(task.id, 10),
            title: task.text,
            completed: task.completed,
            date: task.date.toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })),
        },
      });
    }

    // CreateTask mutation
    if (body.query.includes('createTask')) {
      const { title, date } = body.variables as { title: string; date: string };
      const newTask = {
        id: String(tasksStore.length + 1),
        text: title,
        completed: false,
        date: new Date(date),
      };
      tasksStore.push(newTask);

      return HttpResponse.json({
        data: {
          createTask: {
            id: parseInt(newTask.id, 10),
            title: newTask.text,
            completed: newTask.completed,
            date: newTask.date.toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });
    }

    // UpdateTask mutation
    if (body.query.includes('updateTask')) {
      const { id, title, completed, date } = body.variables as {
        id: number;
        title?: string;
        completed?: boolean;
        date?: string;
      };
      const taskIndex = tasksStore.findIndex((t) => t.id === String(id));

      if (taskIndex === -1) {
        return HttpResponse.json(
          {
            errors: [{ message: 'Task not found' }],
          },
          { status: 404 }
        );
      }

      const task = tasksStore[taskIndex];
      const updatedTask = {
        ...task,
        text: title ?? task.text,
        completed: completed ?? task.completed,
        date: date ? new Date(date) : task.date,
      };
      tasksStore[taskIndex] = updatedTask;

      return HttpResponse.json({
        data: {
          updateTask: {
            id: parseInt(updatedTask.id, 10),
            title: updatedTask.text,
            completed: updatedTask.completed,
            date: updatedTask.date.toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      });
    }

    // DeleteTask mutation
    if (body.query.includes('deleteTask')) {
      const { id } = body.variables as { id: number };
      const taskIndex = tasksStore.findIndex((t) => t.id === String(id));

      if (taskIndex === -1) {
        return HttpResponse.json({
          data: { deleteTask: false },
        });
      }

      tasksStore.splice(taskIndex, 1);
      return HttpResponse.json({
        data: { deleteTask: true },
      });
    }

    // Default response for unhandled queries
    return HttpResponse.json({
      errors: [{ message: 'Unhandled GraphQL operation' }],
    });
  }),
];

// Reset store for testing
export const resetTasksStore = () => {
  tasksStore = [...mockTasks];
};

// Get current store state for testing
export const getTasksStore = () => [...tasksStore];
