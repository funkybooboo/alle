import { describe, expect, it, vi } from 'bun:test';

type NotificationKind = 'success' | 'warning' | 'error' | 'info';

interface NotificationEntry {
    id: string;
    message: string;
    kind: NotificationKind;
    iconType: string;
    action?: { label: string; fn: () => void };
    duration: number;
    entering: boolean;
    leaving: boolean;
}

class TestNotificationStore {
    notifications: NotificationEntry[] = [];
    private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
    private nextId = 0;

    push(
        message: string,
        options?: {
            kind?: NotificationKind;
            iconType?: string;
            action?: { label: string; fn: () => void };
            duration?: number;
        },
    ): string {
        const id = `notif_${++this.nextId}`;
        const kind = options?.kind ?? 'info';
        const notification: NotificationEntry = {
            id,
            message,
            kind,
            iconType: options?.iconType ?? kind,
            action: options?.action,
            duration: options?.duration ?? 4000,
            entering: true,
            leaving: false,
        };
        this.notifications = [...this.notifications, notification];
        this.notifications = this.notifications.map(n =>
            n.id === id ? { ...n, entering: false } : n,
        );
        this.scheduleDismiss(id, notification.duration);
        return id;
    }

    dismiss(id: string): void {
        const timer = this.timers.get(id);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(id);
        }
        this.notifications = this.notifications.map(n =>
            n.id === id ? { ...n, leaving: true } : n,
        );
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    clear(): void {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
        this.notifications = [];
    }

    private scheduleDismiss(id: string, duration: number): void {
        const timer = setTimeout(() => {
            this.dismiss(id);
        }, duration);
        this.timers.set(id, timer);
    }
}

describe('NotificationStore', () => {
    it('pushes a notification and it appears in the list', () => {
        const store = new TestNotificationStore();
        const id = store.push('Test message');
        expect(id).toBeDefined();
        expect(store.notifications.length).toBe(1);
        expect(store.notifications[0]?.message).toBe('Test message');
    });

    it('pushes with default kind "info"', () => {
        const store = new TestNotificationStore();
        store.push('Hello');
        expect(store.notifications[0]?.kind).toBe('info');
    });

    it('pushes with custom kind', () => {
        const store = new TestNotificationStore();
        store.push('Error!', { kind: 'error' });
        expect(store.notifications[0]?.kind).toBe('error');
    });

    it('pushes with custom iconType', () => {
        const store = new TestNotificationStore();
        store.push('Connected', { iconType: 'connected' });
        expect(store.notifications[0]?.iconType).toBe('connected');
    });

    it('dismisses a notification by id', () => {
        const store = new TestNotificationStore();
        const id = store.push('Dismiss me');
        expect(store.notifications.length).toBe(1);
        store.dismiss(id);
        expect(store.notifications.length).toBe(0);
    });

    it('clears all notifications', () => {
        const store = new TestNotificationStore();
        store.push('One');
        store.push('Two');
        store.push('Three');
        expect(store.notifications.length).toBe(3);
        store.clear();
        expect(store.notifications.length).toBe(0);
    });

    it('auto-dismisses after duration', () => {
        vi.useFakeTimers();
        const store = new TestNotificationStore();
        store.push('Temporary', { duration: 1000 });
        expect(store.notifications.length).toBe(1);

        vi.advanceTimersByTime(1200);
        expect(store.notifications.length).toBe(0);
        vi.useRealTimers();
    });

    it('supports action buttons', () => {
        const store = new TestNotificationStore();
        const action = { label: 'Undo', fn: () => {} };
        store.push('Deleted', { action });
        expect(store.notifications[0]?.action?.label).toBe('Undo');
    });

    it('stacks multiple notifications', () => {
        const store = new TestNotificationStore();
        store.push('First');
        store.push('Second');
        store.push('Third');
        expect(store.notifications.length).toBe(3);
        expect(store.notifications[0]?.message).toBe('First');
        expect(store.notifications[2]?.message).toBe('Third');
    });
});
