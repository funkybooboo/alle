import {
    type ConnectionStatus,
    WS_PING_INTERVAL_MS,
    WS_RECONNECT_BASE_MS,
    WS_RECONNECT_MAX_MS,
    type WsClientMessage,
    type WsServerMessage,
} from '@alle/shared';
import { container } from '$lib/container';

type MessageHandler = (message: WsServerMessage) => void;

class WebSocketServiceImpl {
    private ws: WebSocket | null = null;
    private url: string;
    private clientId: string | null = null;
    private status: ConnectionStatus = 'disconnected';
    private reconnectAttempts = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private pingTimer: ReturnType<typeof setInterval> | null = null;
    private messageHandlers: Set<MessageHandler> = new Set();
    private statusHandlers: Set<(status: ConnectionStatus) => void> = new Set();
    private intentionalDisconnect = false;

    constructor() {
        const apiBaseUrl = container.config.get('VITE_API_URL', 'http://localhost:4000');
        const url = new URL(apiBaseUrl);
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        url.pathname = '/ws';
        this.url = url.toString();
    }

    connect(): void {
        if (this.status === 'connected' || this.status === 'connecting') return;
        this.intentionalDisconnect = false;
        this.setStatus('connecting');

        try {
            this.ws = new WebSocket(this.url);
            this.ws.onopen = this.handleOpen.bind(this);
            this.ws.onmessage = this.handleMessage.bind(this);
            this.ws.onclose = this.handleClose.bind(this);
            this.ws.onerror = this.handleError.bind(this);
        } catch {
            this.scheduleReconnect();
        }
    }

    disconnect(): void {
        this.intentionalDisconnect = true;
        this.cleanup();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.setStatus('disconnected');
    }

    getClientId(): string | null {
        return this.clientId;
    }

    getStatus(): ConnectionStatus {
        return this.status;
    }

    onMessage(handler: MessageHandler): () => void {
        this.messageHandlers.add(handler);
        return () => {
            this.messageHandlers.delete(handler);
        };
    }

    onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
        this.statusHandlers.add(handler);
        return () => {
            this.statusHandlers.delete(handler);
        };
    }

    send(message: WsClientMessage): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    private handleOpen(): void {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        this.startPing();
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const data = JSON.parse(event.data as string) as WsServerMessage;

            if (data.type === 'connection:ack') {
                this.clientId = data.payload.clientId;
            }

            for (const handler of this.messageHandlers) {
                handler(data);
            }
        } catch {
            // Ignore malformed messages
        }
    }

    private handleClose(): void {
        this.stopPing();
        this.ws = null;

        if (!this.intentionalDisconnect) {
            this.scheduleReconnect();
        } else {
            this.setStatus('disconnected');
        }
    }

    private handleError(): void {
        this.stopPing();
        if (this.ws) {
            this.ws.close();
        }
    }

    private scheduleReconnect(): void {
        if (this.intentionalDisconnect) return;
        this.setStatus('reconnecting');

        const delay = Math.min(
            WS_RECONNECT_BASE_MS * 2 ** this.reconnectAttempts,
            WS_RECONNECT_MAX_MS,
        );
        this.reconnectAttempts++;

        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }

    private startPing(): void {
        this.stopPing();
        this.pingTimer = setInterval(() => {
            this.send({ type: 'ws:ping' });
        }, WS_PING_INTERVAL_MS);
    }

    private stopPing(): void {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    private cleanup(): void {
        this.stopPing();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private setStatus(status: ConnectionStatus): void {
        this.status = status;
        for (const handler of this.statusHandlers) {
            handler(status);
        }
    }
}

export const websocketService = new WebSocketServiceImpl();
