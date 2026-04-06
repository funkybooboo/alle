import type {
    CreateSomeDayGroupInput,
    DateProvider,
    SomeDayGroup,
    UpdateSomeDayGroupInput,
} from '@alle/shared';
import type { SomeDayGroupRepository } from './SomeDayGroupRepository';

export class InMemorySomeDayGroupRepository implements SomeDayGroupRepository {
    private groups: Map<string, SomeDayGroup> = new Map();
    private idCounter = 0;

    constructor(private dateProvider: DateProvider) {}

    async findAll(): Promise<SomeDayGroup[]> {
        return Array.from(this.groups.values()).sort((a, b) => {
            const posCompare = a.position - b.position;
            if (posCompare !== 0) return posCompare;
            return a.createdAt.localeCompare(b.createdAt);
        });
    }

    async findById(id: string): Promise<SomeDayGroup | null> {
        return this.groups.get(id) ?? null;
    }

    async create(input: CreateSomeDayGroupInput): Promise<SomeDayGroup> {
        const id = (++this.idCounter).toString();
        const group: SomeDayGroup = {
            id,
            name: input.name,
            description: input.description ?? null,
            tag: input.tag,
            position: input.position,
            createdAt: this.dateProvider.timestamp(),
        };
        this.groups.set(id, group);
        return group;
    }

    async update(id: string, input: UpdateSomeDayGroupInput): Promise<SomeDayGroup | null> {
        const existing = this.groups.get(id);
        if (!existing) return null;
        const updated: SomeDayGroup = { ...existing, ...input };
        this.groups.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return this.groups.delete(id);
    }

    async deleteAll(): Promise<void> {
        this.groups.clear();
        this.idCounter = 0;
    }
}
