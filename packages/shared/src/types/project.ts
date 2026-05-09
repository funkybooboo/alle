/**
 * Project — a named collection of tasks linked by tag.
 * The `tag` field holds the project's tag (e.g. "project:build-alle").
 * Tasks belong to this project when their tags array includes `tag`.
 */
export interface Project {
    id: string;
    name: string;
    tag: string;
    description: string | null;
    startDate: string | null;
    dueDate: string | null;
    isActive: boolean;
    createdAt: string;
    completedAt: string | null;
}

/**
 * Input for creating a new project.
 * `tag` is auto-generated from name if not provided.
 */
export type CreateProjectInput = {
    name: string;
    tag?: string;
    description?: string | null;
    startDate?: string | null;
    dueDate?: string | null;
};

/**
 * Input for updating an existing project
 */
export type UpdateProjectInput = Partial<{
    name: string;
    tag: string;
    description: string | null;
    startDate: string | null;
    dueDate: string | null;
    isActive: boolean;
    completedAt: string | null;
}>;
