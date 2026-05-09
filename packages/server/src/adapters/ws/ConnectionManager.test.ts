import { describe, expect, it } from 'bun:test';
import { ConnectionManager } from './ConnectionManager';

describe('ConnectionManager', () => {
    it('adds a client and tracks it', () => {
        const cm = new ConnectionManager();
        cm.add('client1', {} as WebSocket);

        expect(cm.has('client1')).toBe(true);
        expect(cm.size()).toBe(1);
    });

    it('removes a client', () => {
        const cm = new ConnectionManager();
        cm.add('client1', {} as WebSocket);
        cm.remove('client1');

        expect(cm.has('client1')).toBe(false);
        expect(cm.size()).toBe(0);
    });

    it('retrieves client data', () => {
        const cm = new ConnectionManager();
        cm.add('client1', {} as WebSocket);

        const data = cm.getData('client1');
        expect(data?.clientId).toBe('client1');
        expect(data?.connectedAt).toBeDefined();
    });

    it('returns undefined for unknown client', () => {
        const cm = new ConnectionManager();
        expect(cm.get('unknown')).toBeUndefined();
        expect(cm.getData('unknown')).toBeUndefined();
    });

    it('calls onConnect callback when client added', () => {
        const cm = new ConnectionManager();
        const connected: string[] = [];

        cm.onConnect(clientId => connected.push(clientId));
        cm.add('client1', {} as WebSocket);

        expect(connected).toEqual(['client1']);
    });

    it('calls onDisconnect callback when client removed', () => {
        const cm = new ConnectionManager();
        const disconnected: string[] = [];

        cm.onDisconnect(clientId => disconnected.push(clientId));
        cm.add('client1', {} as WebSocket);
        cm.remove('client1');

        expect(disconnected).toEqual(['client1']);
    });

    it('calls onMessage callback when handleMessage invoked', () => {
        const cm = new ConnectionManager();
        const messages: Array<{ clientId: string; message: unknown }> = [];

        cm.onMessage((clientId, message) => {
            messages.push({ clientId, message });
        });
        cm.add('client1', {} as WebSocket);
        cm.handleMessage('client1', { type: 'ping' });

        expect(messages.length).toBe(1);
        expect(messages[0]?.clientId).toBe('client1');
        expect(messages[0]?.message).toEqual({ type: 'ping' });
    });

    it('tracks multiple clients', () => {
        const cm = new ConnectionManager();
        cm.add('c1', {} as WebSocket);
        cm.add('c2', {} as WebSocket);
        cm.add('c3', {} as WebSocket);

        expect(cm.size()).toBe(3);
        const ids = Array.from(cm.getAll().keys());
        expect(ids).toEqual(['c1', 'c2', 'c3']);
    });

    it('getAll returns map of all clients', () => {
        const cm = new ConnectionManager();
        const ws1 = {} as WebSocket;
        const ws2 = {} as WebSocket;
        cm.add('c1', ws1);
        cm.add('c2', ws2);

        const all = cm.getAll();
        expect(all.size).toBe(2);
        expect(all.get('c1')).toBe(ws1);
        expect(all.get('c2')).toBe(ws2);
    });
});
