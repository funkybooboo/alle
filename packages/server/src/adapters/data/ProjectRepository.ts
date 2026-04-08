import type { CreateProjectInput, Project, UpdateProjectInput } from '@alle/shared';

/**
 * Repository interface for Project persistence
 */
export interface ProjectRepository {
    findAll(): Promise<Project[]>;
    findActive(): Promise<Project[]>;
    findById(id: string): Promise<Project | null>;
    create(input: CreateProjectInput): Promise<Project>;
    update(id: string, input: UpdateProjectInput): Promise<Project | null>;
    delete(id: string): Promise<boolean>;
}
