import type { Project } from '@alle/shared';
import type { ProjectRepository } from '../adapters/data/ProjectRepository';

export class ProjectService {
    constructor(private projectRepo: ProjectRepository) {}

    async listProjects(active?: boolean): Promise<Project[]> {
        if (active) {
            return this.projectRepo.findActive();
        }
        return this.projectRepo.findAll();
    }
}
