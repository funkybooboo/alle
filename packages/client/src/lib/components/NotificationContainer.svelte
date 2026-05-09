<script lang="ts">
    import { notificationStore } from '$lib/stores/notificationStore.svelte';
    import { preferencesStore } from '$lib/stores/preferencesStore.svelte';
    import { Icon } from 'svelte-icons-pack';
    import { LuWifi, LuWifiOff, LuCloudOff, LuCheck, LuRefreshCw } from 'svelte-icons-pack/lu';

    const iconMap: Record<string, typeof LuCheck> = {
        connected: LuWifi,
        disconnected: LuWifiOff,
        reconnecting: LuRefreshCw,
        synced: LuCheck,
        error: LuCloudOff,
    };

    function getIcon(type: string) {
        return iconMap[type] ?? LuCheck;
    }

    const positionClass = $derived(
        preferencesStore.notificationPosition === 'bottom-left' ? 'bottom-left' :
        preferencesStore.notificationPosition === 'bottom-center' ? 'bottom-center' :
        preferencesStore.notificationPosition === 'top-right' ? 'top-right' :
        preferencesStore.notificationPosition === 'top-left' ? 'top-left' :
        'bottom-right',
    );
</script>

{#if notificationStore.notifications.length > 0}
    <div class="notification-container {positionClass}" role="status" aria-live="polite">
        {#each notificationStore.notifications as notification (notification.id)}
            <div
                class="notification"
                class:notification--success={notification.kind === 'success'}
                class:notification--warning={notification.kind === 'warning'}
                class:notification--error={notification.kind === 'error'}
                class:notification--info={notification.kind === 'info'}
                class:notification--leaving={notification.leaving}
            >
                <span class="notification-icon">
                    <Icon src={getIcon(notification.iconType)} />
                </span>
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
        z-index: 300;
        display: flex;
        flex-direction: column-reverse;
        gap: 8px;
        max-width: 320px;
        pointer-events: none;
    }

    .bottom-right {
        bottom: 48px;
        right: 16px;
    }

    .bottom-left {
        bottom: 48px;
        left: 16px;
    }

    .bottom-center {
        bottom: 48px;
        left: 50%;
        transform: translateX(-50%);
    }

    .top-right {
        top: 16px;
        right: 16px;
    }

    .top-left {
        top: 16px;
        left: 16px;
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
        border-left: 3px solid #22c55e;
    }

    .notification--warning {
        border-left: 3px solid #f59e0b;
    }

    .notification--error {
        border-left: 3px solid #ef4444;
    }

    .notification--info {
        border-left: 3px solid #3b82f6;
    }

    .notification-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .notification-icon :global(svg) {
        width: 16px;
        height: 16px;
        color: var(--color-text-secondary);
    }

    .notification--success .notification-icon :global(svg) {
        color: #22c55e;
    }

    .notification--error .notification-icon :global(svg) {
        color: #ef4444;
    }

    .notification--warning .notification-icon :global(svg) {
        color: #f59e0b;
    }

    .notification--info .notification-icon :global(svg) {
        color: #3b82f6;
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