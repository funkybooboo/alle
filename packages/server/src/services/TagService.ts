import type { TaskRepository } from '../adapters/data/TaskRepository';

export class TagService {
    constructor(private taskRepo: TaskRepository) {}

    async listTags(): Promise<string[]> {
        const tasks = await this.taskRepo.findAll();
        return [...new Set(tasks.flatMap(t => t.tags))].sort();
    }

    async renameTag(from: string, to: string): Promise<number> {
        const tasks = await this.taskRepo.findByTags([from]);
        let updated = 0;
        for (const task of tasks) {
            const newTags = task.tags.map(t => (t === from ? to : t));
            await this.taskRepo.update(task.id, { tags: newTags });
            updated++;
        }
        return updated;
    }

    async mergeTags(sources: string[], target: string): Promise<number> {
        const sourceSet = new Set(sources);
        const affected = await Promise.all(sources.map(s => this.taskRepo.findByTags([s])));
        const uniqueTasks = new Map(affected.flat().map(t => [t.id, t]));

        let updated = 0;
        for (const task of uniqueTasks.values()) {
            const hasSources = task.tags.some(t => sourceSet.has(t));
            if (!hasSources) continue;

            const newTags = [...new Set(task.tags.map(t => (sourceSet.has(t) ? target : t)))];
            await this.taskRepo.update(task.id, { tags: newTags });
            updated++;
        }
        return updated;
    }
}
