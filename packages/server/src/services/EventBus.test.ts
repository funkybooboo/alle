import { describe, expect, it } from 'bun:test';
import { EventBus } from './EventBus';

describe('EventBus', () => {
    it('calls subscribed handler when event is published', () => {
        const bus = new EventBus();
        const received: Array<{ type: string; payload: unknown }> = [];

        bus.subscribe('task:created', (type, payload) => {
            received.push({ type, payload });
        });

        bus.publish('task:created', { task: { id: '1' } });

        expect(received.length).toBe(1);
        expect(received[0]?.type).toBe('task:created');
        expect(received[0]?.payload).toEqual({ task: { id: '1' } });
    });

    it('does not call handler for different event type', () => {
        const bus = new EventBus();
        const received: unknown[] = [];

        bus.subscribe('task:created', () => {
            received.push('created');
        });

        bus.publish('task:updated', { task: { id: '1' } });

        expect(received.length).toBe(0);
    });

    it('supports unsubscribe via returned function', () => {
        const bus = new EventBus();
        const received: unknown[] = [];

        const unsub = bus.subscribe('task:created', () => {
            received.push('created');
        });

        bus.publish('task:created', {});
        expect(received.length).toBe(1);

        unsub();
        bus.publish('task:created', {});
        expect(received.length).toBe(1);
    });

    it('calls wildcard handlers for any event type', () => {
        const bus = new EventBus();
        const received: string[] = [];

        bus.onAny(type => {
            received.push(type);
        });

        bus.publish('task:created', {});
        bus.publish('task:updated', {});

        expect(received).toEqual(['task:created', 'task:updated']);
    });

    it('supports wildcard unsubscribe', () => {
        const bus = new EventBus();
        const received: string[] = [];

        const unsub = bus.onAny(type => {
            received.push(type);
        });

        bus.publish('task:created', {});
        unsub();
        bus.publish('task:updated', {});

        expect(received).toEqual(['task:created']);
    });

    it('passes originClientId to handler', () => {
        const bus = new EventBus();
        let originId: string | undefined;

        bus.subscribe('task:created', (_type, _payload, originClientId) => {
            originId = originClientId;
        });

        bus.publish('task:created', { id: '1' }, 'client_abc');

        expect(originId).toBe('client_abc');
    });

    it('passes originClientId to wildcard handler', () => {
        const bus = new EventBus();
        let originId: string | undefined;

        bus.onAny((_type, _payload, originClientId) => {
            originId = originClientId;
        });

        bus.publish('task:created', { id: '1' }, 'client_xyz');

        expect(originId).toBe('client_xyz');
    });

    it('supports multiple handlers for the same event', () => {
        const bus = new EventBus();
        const results: string[] = [];

        bus.subscribe('task:created', () => results.push('a'));
        bus.subscribe('task:created', () => results.push('b'));

        bus.publish('task:created', {});

        expect(results).toEqual(['a', 'b']);
    });

    it('clear removes all subscriptions', () => {
        const bus = new EventBus();
        const received: string[] = [];

        bus.subscribe('task:created', () => received.push('sub'));
        bus.onAny(() => received.push('any'));

        bus.clear();
        bus.publish('task:created', {});

        expect(received.length).toBe(0);
    });
});
