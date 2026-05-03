<script lang="ts">
    import { taskStore } from '$lib/stores';
    import { TASK_CONSTRAINTS } from '@alle/shared';
    import { Icon } from 'svelte-icons-pack';
    import { LuCircle, LuX } from 'svelte-icons-pack/lu';

    let { date, someDayGroupId = null, oncancel = () => {} }: { date: string; someDayGroupId?: string | null; oncancel?: () => void } = $props();

    let text = $state('');
    let inputEl: HTMLInputElement;

    $effect(() => {
        if (inputEl) inputEl.focus();
    });

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && text.trim()) {
            e.preventDefault();
            const input: Record<string, unknown> = {
                text: text.trim(),
                date: date || null,
            };
            if (someDayGroupId) input.someDayGroupId = someDayGroupId;
            taskStore.create(input as Parameters<typeof taskStore.create>[0]);
            text = '';
        } else if (e.key === 'Escape') {
            e.preventDefault();
            oncancel();
        }
    }

    function handleBlur() {
        if (!text.trim()) {
            oncancel();
        }
    }
</script>

<div class="inline-add">
    <span class="checkbox-placeholder"><Icon src={LuCircle} /></span>
    <input
        bind:this={inputEl}
        bind:value={text}
        class="add-input"
        placeholder="Task text..."
        onkeydown={handleKeydown}
        onblur={handleBlur}
        maxlength={TASK_CONSTRAINTS.MAX_TEXT_LENGTH}
        aria-label="New task text"
    />
    <button class="cancel-btn" onclick={() => oncancel()} aria-label="Cancel">
        <Icon src={LuX} />
    </button>
</div>

<style>
    .inline-add {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 4px;
    }

    .checkbox-placeholder {
        color: var(--color-iron-300);
        flex-shrink: 0;
    }

    .checkbox-placeholder :global(svg) {
        width: 16px;
        height: 16px;
    }

    .add-input {
        flex: 1;
        font-size: 14px;
        padding: 4px 8px;
        border: 1px solid var(--color-accent);
        border-radius: 4px;
        outline: none;
        background: var(--color-surface);
        color: var(--color-text);
    }

    .add-input::placeholder {
        color: var(--color-text-muted);
    }

    .cancel-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-muted);
        padding: 4px;
        border-radius: 3px;
        transition: color 0.15s;
    }

    .cancel-btn :global(svg) {
        width: 14px;
        height: 14px;
    }

    .cancel-btn:hover {
        color: var(--color-danger);
    }
</style>