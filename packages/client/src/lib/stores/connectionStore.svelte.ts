import type { ConnectionStatus } from '@alle/shared';
import { container } from '$lib/container';
import { websocketService } from '$lib/services/websocketService';
import { notificationStore } from './notificationStore.svelte';

class ConnectionStore {
    status = $state<ConnectionStatus>('disconnected');
    clientId: string | null = $state(null);
    #statusUnsubscribe: (() => void) | null = null;
    #messageUnsubscribe: (() => void) | null = null;
    #lastStatus: ConnectionStatus = 'disconnected';

    get isConnected(): boolean {
        return this.status === 'connected';
    }

    get isReconnecting(): boolean {
        return this.status === 'reconnecting';
    }

    init(): void {
        this.#statusUnsubscribe = websocketService.onStatusChange(status => {
            this.status = status;

            if (status === 'connected' && this.#lastStatus !== 'connected') {
                notificationStore.push('Connected', {
                    kind: 'success',
                    iconType: 'connected',
                    duration: 3000,
                });
            } else if (status === 'reconnecting' && this.#lastStatus === 'connected') {
                notificationStore.push('Connection lost — reconnecting...', {
                    kind: 'warning',
                    iconType: 'reconnecting',
                    duration: 5000,
                });
            } else if (status === 'disconnected' && this.#lastStatus !== 'disconnected') {
                notificationStore.push('Disconnected', {
                    kind: 'error',
                    iconType: 'disconnected',
                    duration: 5000,
                });
            }

            if (status === 'disconnected' || status === 'reconnecting') {
                this.clientId = null;
                container.setClientId(null);
            }

            this.#lastStatus = status;
        });

        this.#messageUnsubscribe = websocketService.onMessage(message => {
            if (message.type === 'connection:ack') {
                this.clientId = message.payload.clientId;
                container.setClientId(message.payload.clientId);
            }
        });

        websocketService.connect();
    }

    destroy(): void {
        this.#statusUnsubscribe?.();
        this.#messageUnsubscribe?.();
        container.setClientId(null);
        websocketService.disconnect();
    }
}

export const connectionStore = new ConnectionStore();
