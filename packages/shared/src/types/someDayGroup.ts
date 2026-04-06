/**
 * SomeDayGroup — a user-created group in the Someday panel
 *
 * Groups organize unscheduled tasks by topic. Each group is associated
 * with a tag so tasks can be filtered across the app.
 */
export interface SomeDayGroup {
    id: string;
    name: string;
    description: string | null;
    tag: string;
    position: number;
    createdAt: string;
}

/**
 * Input for creating a new Someday group
 */
export type CreateSomeDayGroupInput = {
    name: string;
    tag: string;
    position: number;
    description?: string | null;
};

/**
 * Input for updating an existing Someday group
 */
export type UpdateSomeDayGroupInput = Partial<{
    name: string;
    description: string | null;
    tag: string;
    position: number;
}>;
