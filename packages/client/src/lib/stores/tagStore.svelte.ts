import type { TagKind, WsServerMessage } from '@alle/shared';
import { resolveTagKind } from '@alle/shared';
import { container } from '$lib/container';
import { type TagInfo, TagService } from '$lib/services/tagService';
import { websocketService } from '$lib/services/websocketService';

const tagService = new TagService(container.httpClient);

class TagStore {
    tags = $state<string[]>([]);
    tagInfo = $state<TagInfo[]>([]);
    #messageUnsubscribe: (() => void) | null = null;

    initWebSocket(): void {
        this.#messageUnsubscribe = websocketService.onMessage((message: WsServerMessage) => {
            const myClientId = websocketService.getClientId();
            if (message.originClientId === myClientId) return;

            switch (message.type) {
                case 'tag:renamed':
                case 'tag:merged':
                    this.fetchAll();
                    this.fetchInfo();
                    break;
            }
        });
    }

    destroyWebSocket(): void {
        this.#messageUnsubscribe?.();
        this.#messageUnsubscribe = null;
    }

    async fetchAll() {
        try {
            this.tags = await tagService.getAll();
        } catch {
            // Keep empty state
        }
    }

    async fetchInfo() {
        try {
            this.tagInfo = await tagService.getInfo();
        } catch {
            // Keep empty state
        }
    }

    async rename(from: string, to: string) {
        try {
            await tagService.rename(from, to);
            await this.fetchAll();
            return true;
        } catch {
            return false;
        }
    }

    async merge(sources: string[], target: string) {
        try {
            await tagService.merge(sources, target);
            await this.fetchAll();
            return true;
        } catch {
            return false;
        }
    }

    groupedByKind(
        kinds: TagKind[],
        kindMap: Record<string, string>,
    ): Map<TagKind | null, string[]> {
        const result = new Map<TagKind | null, string[]>();

        for (const tag of this.tags) {
            const kind = resolveTagKind(tag, kinds, kindMap);
            const existing = result.get(kind) ?? [];
            existing.push(tag);
            result.set(kind, existing);
        }

        return result;
    }
}

export const tagStore = new TagStore();
