<script lang="ts">
    import type { Snippet } from 'svelte';
    import { onMount, onDestroy } from 'svelte';
    import { Icon } from 'svelte-icons-pack';
    import { LuX } from 'svelte-icons-pack/lu';

    let { title = '', onclose = () => {}, children }: { title?: string; onclose?: () => void; children?: Snippet } = $props();

    let modalEl: HTMLElement;
    let previousFocusEl: HTMLElement | null = null;

    onMount(() => {
        previousFocusEl = document.activeElement as HTMLElement;
        modalEl?.focus();
    });

    onDestroy(() => {
        if (previousFocusEl) {
            previousFocusEl.focus();
        }
    });

    function handleBackdropClick() {
        onclose();
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            e.stopPropagation();
            onclose();
        }
    }

    function handleTabTrap(e: KeyboardEvent) {
        if (e.key !== 'Tab') return;

        const focusable = modalEl.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-backdrop" onclick={handleBackdropClick} role="presentation" aria-hidden="true">
    <div
        class="modal"
        bind:this={modalEl}
        onclick={(e) => { e.stopPropagation(); }}
        onkeydown={(e) => { if (e.key === 'Tab') e.stopPropagation(); handleTabTrap(e); }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabindex="-1"
    >
        <div class="modal-header">
            <h2 class="modal-title" id="modal-title">{title}</h2>
            <button class="close-btn" onclick={() => onclose()} aria-label="Close modal"><Icon src={LuX} /></button>
        </div>
        <div class="modal-body" role="document">
            {@render children?.()}
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex !important;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: var(--color-surface);
        border-radius: 8px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        max-width: 1400px;
        width: 96vw;
        max-height: calc(100vh - 32px);
        display: flex;
        flex-direction: column;
        outline: none;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--color-border);
    }

    .modal-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
    }

    .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-secondary);
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.15s, color 0.15s;
    }

    .close-btn :global(svg) {
        width: 18px;
        height: 18px;
    }

    .close-btn:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    .close-btn:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
    }

    .modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
    }
</style>