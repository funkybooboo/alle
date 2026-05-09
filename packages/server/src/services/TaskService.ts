import type { Task, UpdateTaskInput } from '@alle/shared';
import type { TaskRepository } from '../adapters/data/TaskRepository';

export class TaskService {
    constructor(private taskRepo: TaskRepository) {}

    async listTasks(query: {
        date?: string | undefined;
        tag?: string | undefined;
        completed?: boolean | undefined;
        someDayGroupId?: string | undefined;
        someday?: string | undefined;
        includeDeleted?: boolean | undefined;
    }): Promise<Task[]> {
        let tasks: Task[];
        if (query.someday) {
            tasks = await this.taskRepo.findSomeday();
        } else if (query.someDayGroupId) {
            tasks = await this.taskRepo.findBySomeDayGroup(query.someDayGroupId);
        } else if (query.tag) {
            tasks = await this.taskRepo.findByTags([query.tag]);
        } else if (query.date) {
            tasks = await this.taskRepo.findByDate(query.date);
        } else {
            tasks = await this.taskRepo.findAll();
        }

        if (query.completed !== undefined) {
            tasks = tasks.filter(t => t.completed === query.completed);
        }

        if (query.includeDeleted) {
            const deleted = await this.taskRepo.findDeleted();
            tasks = [...tasks, ...deleted];
        }

        return tasks;
    }

    async completeTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
        const task = await this.taskRepo.update(id, input);
        if (!task) return null;

        if (input.completed === true && task.parentId !== null) {
            const siblings = await this.taskRepo.findChildren(task.parentId);
            if (siblings.length > 0 && siblings.every(s => s.completed)) {
                await this.taskRepo.update(task.parentId, { completed: true });
            }
        }

        return task;
    }

    async getTrash(): Promise<Task[]> {
        return this.taskRepo.findDeleted();
    }

    async purge(): Promise<number> {
        return this.taskRepo.purgeDeleted();
    }
}
