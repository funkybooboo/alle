import type { CreateTaskInput, Task } from '@alle/shared';
import { NotFoundError } from '@alle/shared';
import type { RecurringTaskRepository } from '../adapters/data/RecurringTaskRepository';
import type { TaskRepository } from '../adapters/data/TaskRepository';
import { generateOccurrences } from '../utils/recurringTaskUtils';

export class RecurringTaskService {
    constructor(
        private recurringTaskRepo: RecurringTaskRepository,
        private taskRepo: TaskRepository,
    ) {}

    async generateInstances(id: string, startDate: string, endDate: string): Promise<Task[]> {
        const rt = await this.recurringTaskRepo.findById(id);
        if (!rt) throw new NotFoundError(`RecurringTask with ID ${id} not found`);

        const dates = generateOccurrences(rt, startDate, endDate);
        const created = await Promise.all(
            dates.map(date => {
                const taskInput: CreateTaskInput = {
                    text: rt.text,
                    date,
                    notes: rt.notes,
                    tags: rt.tags,
                    projectId: rt.projectId,
                    rolloverEnabled: rt.rolloverEnabled,
                };
                return this.taskRepo.create(taskInput);
            }),
        );

        return created;
    }
}
