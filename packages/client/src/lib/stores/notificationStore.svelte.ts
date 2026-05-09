type NotificationKind = 'success' | 'warning' | 'error' | 'info';

interface Notification {
    id: string;
    message: string;
    kind: NotificationKind;
    iconType: string;
    action?: { label: string; fn: () => void };
    duration: number;
    entering: boolean;
    leaving: boolean;
}

let nextId = 0;

class NotificationStore {
    notifications = $state<Notification[]>([]);
    #timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

    push(
        message: string,
        options?: {
            kind?: NotificationKind;
            iconType?: string;
            action?: { label: string; fn: () => void };
            duration?: number;
        },
    ): string {
        const id = `notif_${++nextId}`;
        const kind = options?.kind ?? 'info';
        const notification: Notification = {
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

        requestAnimationFrame(() => {
            this.notifications = this.notifications.map(n =>
                n.id === id ? { ...n, entering: false } : n,
            );
        });

        this.#scheduleDismiss(id, notification.duration);
        return id;
    }

    dismiss(id: string): void {
        const timer = this.#timers.get(id);
        if (timer) {
            clearTimeout(timer);
            this.#timers.delete(id);
        }

        this.notifications = this.notifications.map(n =>
            n.id === id ? { ...n, leaving: true } : n,
        );

        setTimeout(() => {
            this.notifications = this.notifications.filter(n => n.id !== id);
        }, 200);
    }

    clear(): void {
        for (const timer of this.#timers.values()) {
            clearTimeout(timer);
        }
        this.#timers.clear();
        this.notifications = [];
    }

    #scheduleDismiss(id: string, duration: number): void {
        const timer = setTimeout(() => {
            this.dismiss(id);
        }, duration);
        this.#timers.set(id, timer);
    }
}

export const notificationStore = new NotificationStore();
export type { Notification, NotificationKind };
