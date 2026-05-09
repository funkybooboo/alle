import type { CreateProjectInput, Project, UpdateProjectInput } from '@alle/shared';
import { container } from '$lib/container';
import { ProjectService } from '$lib/services/projectService';

const projectService = new ProjectService(container.httpClient);

class ProjectStore {
    projects = $state<Project[]>([]);

    async fetchAll() {
        try {
            const projects = await projectService.getAll();
            this.projects = projects;
        } catch {
            // Keep empty state
        }
    }

    async create(input: CreateProjectInput) {
        try {
            const project = await projectService.create(input);
            this.projects = [...this.projects, project];
            return project;
        } catch {
            return null;
        }
    }

    async update(id: string, input: UpdateProjectInput) {
        try {
            const updated = await projectService.update(id, input);
            this.projects = this.projects.map(p => (p.id === id ? updated : p));
            return updated;
        } catch {
            return null;
        }
    }

    async remove(id: string) {
        try {
            await projectService.delete(id);
            this.projects = this.projects.filter(p => p.id !== id);
            return true;
        } catch {
            return false;
        }
    }
}

export const projectStore = new ProjectStore();
