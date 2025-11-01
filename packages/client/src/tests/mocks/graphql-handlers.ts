import { graphql, HttpResponse } from 'msw';
import { mockTasks } from '../fixtures/tasks';

// Mock GraphQL responses
let tasksStore = [...mockTasks];

export const handlers = [
  // Get all tasks
  graphql.query('GetAllTasks', () => {
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
  }),

  // Create task
  graphql.mutation('CreateTask', async ({ variables }) => {
    const newTask = {
      id: String(tasksStore.length + 1),
      text: (variables as any).title,
      completed: false,
      date: new Date((variables as any).date),
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
  }),

  // Update task
  graphql.mutation('UpdateTask', async ({ variables }) => {
    const vars = variables as any;
    const taskIndex = tasksStore.findIndex((t) => t.id === String(vars.id));

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
      text: vars.title ?? task.text,
      completed: vars.completed ?? task.completed,
      date: vars.date ? new Date(vars.date) : task.date,
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
  }),

  // Delete task
  graphql.mutation('DeleteTask', async ({ variables }) => {
    const vars = variables as any;
    const taskIndex = tasksStore.findIndex((t) => t.id === String(vars.id));

    if (taskIndex === -1) {
      return HttpResponse.json({
        data: { deleteTask: false },
      });
    }

    tasksStore.splice(taskIndex, 1);
    return HttpResponse.json({
      data: { deleteTask: true },
    });
  }),
];

// Reset store for testing
export const resetTasksStore = () => {
  tasksStore = [...mockTasks];
};

// Get current store state for testing
export const getTasksStore = () => [...tasksStore];
