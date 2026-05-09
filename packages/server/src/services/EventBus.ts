type EventHandler = (eventType: string, payload: unknown, originClientId?: string) => void;

export class EventBus {
    private handlers: Map<string, Set<EventHandler>> = new Map();
    private wildcardHandlers: Set<EventHandler> = new Set();

    subscribe(eventType: string, handler: EventHandler): () => void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, new Set());
        }
        this.handlers.get(eventType)?.add(handler);

        return () => {
            this.handlers.get(eventType)?.delete(handler);
        };
    }

    onAny(handler: EventHandler): () => void {
        this.wildcardHandlers.add(handler);
        return () => {
            this.wildcardHandlers.delete(handler);
        };
    }

    publish(eventType: string, payload: unknown, originClientId?: string): void {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
            for (const handler of handlers) {
                handler(eventType, payload, originClientId);
            }
        }
        for (const handler of this.wildcardHandlers) {
            handler(eventType, payload, originClientId);
        }
    }

    clear(): void {
        this.handlers.clear();
        this.wildcardHandlers.clear();
    }
}
