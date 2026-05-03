<script lang="ts">
    import { uiStore } from '$lib/stores';
</script>

{#if uiStore.toastMessage}
    <div class="toast-container" role="status" aria-live="polite">
        <div class="toast">
            <span class="toast-message">{uiStore.toastMessage}</span>
            {#if uiStore.toastAction}
                <button
                    class="toast-action"
                    onclick={uiStore.toastAction.fn}
                >
                    {uiStore.toastAction.label}
                </button>
            {/if}
        </div>
    </div>
{/if}

<style>
    .toast-container {
        position: fixed;
        bottom: 48px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 200;
    }

    .toast {
        background: var(--color-iron-800);
        color: white;
        padding: 10px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
    }

    .toast-message {
        flex: 1;
    }

    .toast-action {
        background: none;
        border: 1px solid rgba(255, 255, 255, 0.4);
        color: white;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.15s;
    }

    .toast-action:hover {
        background: rgba(255, 255, 255, 0.15);
    }
</style>