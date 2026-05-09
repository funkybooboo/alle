import type { WsServerMessage } from '@alle/shared';

export interface WebSocketServer {
    broadcast(message: WsServerMessage, excludeClientId?: string): void;
    send(clientId: string, message: WsServerMessage): void;
    getConnectedClientIds(): string[];
}
