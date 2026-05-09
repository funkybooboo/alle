import type { WsServerMessage } from '@alle/shared';
import type { ConnectionManager } from './ConnectionManager';
import type { WebSocketServer } from './WebSocketServer';

interface BunSocket {
    send(data: string): void;
    readyState: number;
}

export class BunWebSocketServer implements WebSocketServer {
    private connectionManager: ConnectionManager;

    constructor(connectionManager: ConnectionManager) {
        this.connectionManager = connectionManager;
    }

    broadcast(message: WsServerMessage, excludeClientId?: string | undefined): void {
        const data = JSON.stringify(message);
        for (const [id, ws] of this.connectionManager.getAll()) {
            if (id === excludeClientId) continue;
            const socket = ws as BunSocket;
            if (socket?.readyState === 1) {
                socket.send(data);
            }
        }
    }

    send(clientId: string, message: WsServerMessage): void {
        const ws = this.connectionManager.get(clientId) as BunSocket | undefined;
        if (ws?.readyState === 1) {
            ws.send(JSON.stringify(message));
        }
    }

    getConnectedClientIds(): string[] {
        return Array.from(this.connectionManager.getAll().keys());
    }
}
