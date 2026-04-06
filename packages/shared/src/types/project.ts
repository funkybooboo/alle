/**
 * Project — a named collection of tasks
 */
export interface Project {
    id: string;
    name: string;
    description: string | null;
    startDate: string | null;
    dueDate: string | null;
    isActive: boolean;
    createdAt: string;
    completedAt: string | null;
}

/**
 * Input for creating a new project
 */
export type CreateProjectInput = {
    name: string;
    description?: string | null;
    startDate?: string | null;
    dueDate?: string | null;
};

/**
 * Input for updating an existing project
 */
export type UpdateProjectInput = Partial<{
    name: string;
    description: string | null;
    startDate: string | null;
    dueDate: string | null;
    isActive: boolean;
    completedAt: string | null;
}>;
