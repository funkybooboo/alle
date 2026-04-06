import type { CreateProjectInput, DateProvider, Project, UpdateProjectInput } from '@alle/shared';
import type { ProjectRepository } from './ProjectRepository';

export class InMemoryProjectRepository implements ProjectRepository {
    private projects: Map<string, Project> = new Map();
    private idCounter = 0;

    constructor(private dateProvider: DateProvider) {}

    async findAll(): Promise<Project[]> {
        return Array.from(this.projects.values()).sort((a, b) =>
            a.createdAt.localeCompare(b.createdAt),
        );
    }

    async findActive(): Promise<Project[]> {
        return (await this.findAll()).filter(p => p.isActive);
    }

    async findById(id: string): Promise<Project | null> {
        return this.projects.get(id) ?? null;
    }

    async create(input: CreateProjectInput): Promise<Project> {
        const id = (++this.idCounter).toString();
        const project: Project = {
            id,
            name: input.name,
            description: input.description ?? null,
            startDate: input.startDate ?? null,
            dueDate: input.dueDate ?? null,
            isActive: true,
            createdAt: this.dateProvider.timestamp(),
            completedAt: null,
        };
        this.projects.set(id, project);
        return project;
    }

    async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
        const existing = this.projects.get(id);
        if (!existing) return null;
        const updated: Project = { ...existing, ...input };
        this.projects.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return this.projects.delete(id);
    }

    async deleteAll(): Promise<void> {
        this.projects.clear();
        this.idCounter = 0;
    }
}
