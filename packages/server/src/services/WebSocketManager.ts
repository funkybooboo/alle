import type { WsServerMessage } from '@alle/shared';
import type { WebSocketServer } from '../adapters/ws/WebSocketServer';
import type { EventBus } from './EventBus';

export class WebSocketManager {
    private wsServer: WebSocketServer;
    private eventBus: EventBus;
    private unsubscribe: (() => void) | null = null;

    constructor(wsServer: WebSocketServer, eventBus: EventBus) {
        this.wsServer = wsServer;
        this.eventBus = eventBus;
    }

    start(): void {
        this.unsubscribe = this.eventBus.onAny((eventType, payload, originClientId) => {
            const message = {
                type: eventType,
                payload,
                ...(originClientId ? { originClientId } : {}),
            } as WsServerMessage;
            this.wsServer.broadcast(message, originClientId);
        });
    }

    stop(): void {
        this.unsubscribe?.();
        this.unsubscribe = null;
    }
}
