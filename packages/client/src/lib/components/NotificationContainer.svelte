<script lang="ts">
    import { notificationStore } from '$lib/stores/notificationStore.svelte';

    // Inline SVG icons for the notification kinds. Removes the
    // svelte-icons-pack dependency from this component (part of the
    // icon-pack removal; kept local because the icon set is tiny).
    const icons: Record<string, string> = {
        connected: '<path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.8a15 15 0 0 1 20 0"/><path d="M12 20h.01"/>',
        disconnected: '<path d="M5 13a10 10 0 0 1 4-2.6"/><path d="M8.5 16.5a5 5 0 0 1 3-1.6"/><path d="M2 8.8a15 15 0 0 1 5-2.4"/><path d="M19 5l-14 14"/><path d="M22 8.8a15 15 0 0 0-4.4-2.4"/>',
        reconnecting: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v4h-4"/>',
        synced: '<path d="M20 6 9 17l-5-5"/>',
        error: '<path d="M17.5 19H9a7 7 0 6.7-9.9"/><path d="M3 21l3.5-3.5"/><path d="M7 13l3 3"/><path d="M14 3l7 7"/>',
    };

    function iconSvg(type: string): string {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[type] ?? icons.synced}</svg>`;
    }
</script>

{#if notificationStore.notifications.length > 0}
    <div class="notification-container" role="status" aria-live="polite">
        {#each notificationStore.notifications as notification (notification.id)}
            <div
                class="notification"
                class:notification--success={notification.kind === 'success'}
                class:notification--warning={notification.kind === 'warning'}
                class:notification--error={notification.kind === 'error'}
                class:notification--info={notification.kind === 'info'}
                class:notification--leaving={notification.leaving}
            >
                <span class="notification-icon">{@html iconSvg(notification.iconType)}</span>
                <span class="notification-message">{notification.message}</span>
                {#if notification.action}
                    <button class="notification-action" onclick={notification.action.fn}>
                        {notification.action.label}
                    </button>
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style>
    .notification-container {
        position: fixed;
        bottom: 48px;
        right: 16px;
        z-index: 300;
        display: flex;
        flex-direction: column-reverse;
        gap: 8px;
        max-width: 320px;
        pointer-events: none;
    }

    .notification {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: var(--color-text);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        pointer-events: auto;
        animation: slide-in 0.2s ease-out;
        transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .notification--leaving {
        opacity: 0;
        transform: translateX(16px);
    }

    .notification--success {
        border-left: 3px solid var(--color-success);
    }

    .notification--warning {
        border-left: 3px solid var(--color-warning);
    }

    .notification--error {
        border-left: 3px solid var(--color-danger);
    }

    .notification--info {
        border-left: 3px solid var(--color-accent);
    }

    .notification-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--color-text-secondary);
    }

    .notification-icon :global(svg) {
        width: 16px;
        height: 16px;
    }

    .notification--success .notification-icon {
        color: var(--color-success);
    }

    .notification--error .notification-icon {
        color: var(--color-danger);
    }

    .notification--warning .notification-icon {
        color: var(--color-warning);
    }

    .notification--info .notification-icon {
        color: var(--color-accent);
    }

    .notification-message {
        flex: 1;
        line-height: 1.4;
    }

    .notification-action {
        background: none;
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
        padding: 2px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        flex-shrink: 0;
        transition: background-color 0.15s;
    }

    .notification-action:hover {
        background: var(--color-surface-hover);
    }

    @keyframes slide-in {
        from {
            opacity: 0;
            transform: translateX(16px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
</style>