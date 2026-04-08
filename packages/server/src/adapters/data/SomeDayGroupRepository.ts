import type { CreateSomeDayGroupInput, SomeDayGroup, UpdateSomeDayGroupInput } from '@alle/shared';

/**
 * Repository interface for SomeDayGroup persistence
 */
export interface SomeDayGroupRepository {
    findAll(): Promise<SomeDayGroup[]>;
    findById(id: string): Promise<SomeDayGroup | null>;
    create(input: CreateSomeDayGroupInput): Promise<SomeDayGroup>;
    update(id: string, input: UpdateSomeDayGroupInput): Promise<SomeDayGroup | null>;
    delete(id: string): Promise<boolean>;
}
