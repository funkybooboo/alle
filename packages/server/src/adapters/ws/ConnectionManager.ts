export interface ClientData {
    clientId: string;
    connectedAt: string;
}

export class ConnectionManager {
    private clients: Map<string, unknown> = new Map();
    private clientData: Map<string, ClientData> = new Map();
    private onConnectCallback?: (clientId: string) => void;
    private onDisconnectCallback?: (clientId: string) => void;
    private onMessageCallback?: (clientId: string, message: unknown) => void;

    add(clientId: string, ws: unknown): void {
        this.clients.set(clientId, ws);
        this.clientData.set(clientId, {
            clientId,
            connectedAt: new Date().toISOString(),
        });
        this.onConnectCallback?.(clientId);
    }

    remove(clientId: string): void {
        this.clients.delete(clientId);
        this.clientData.delete(clientId);
        this.onDisconnectCallback?.(clientId);
    }

    get(clientId: string): unknown | undefined {
        return this.clients.get(clientId);
    }

    getAll(): Map<string, unknown> {
        return this.clients;
    }

    getData(clientId: string): ClientData | undefined {
        return this.clientData.get(clientId);
    }

    has(clientId: string): boolean {
        return this.clients.has(clientId);
    }

    size(): number {
        return this.clients.size;
    }

    onConnect(callback: (clientId: string) => void): void {
        this.onConnectCallback = callback;
    }

    onDisconnect(callback: (clientId: string) => void): void {
        this.onDisconnectCallback = callback;
    }

    onMessage(callback: (clientId: string, message: unknown) => void): void {
        this.onMessageCallback = callback;
    }

    handleMessage(clientId: string, message: unknown): void {
        this.onMessageCallback?.(clientId, message);
    }
}
