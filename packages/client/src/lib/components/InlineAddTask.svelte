<script lang="ts">
    import { tick } from 'svelte';
    import { taskStore } from '$lib/stores';
    import { TASK_CONSTRAINTS } from '@alle/shared';
    import { Icon } from 'svelte-icons-pack';
    import { LuCircle } from 'svelte-icons-pack/lu';

    let {
        date,
        someDayGroupId = null,
        oncreated,
    }: { date: string; someDayGroupId?: string | null; oncreated?: (id: string) => void } = $props();

    let text = $state('');
    let inputEl: HTMLInputElement;

    async function handleSubmit() {
        if (!text.trim()) return;
        const input: Record<string, unknown> = {
            text: text.trim(),
            date: date || null,
        };
        if (someDayGroupId) input.someDayGroupId = someDayGroupId;
        text = '';
        const task = await taskStore.create(input as Parameters<typeof taskStore.create>[0]);
        if (task && oncreated) oncreated(task.id);
        await tick();
        inputEl?.focus();
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            text = '';
            inputEl?.blur();
        }
    }
</script>

<div class="add-row">
    <span class="drag-spacer" aria-hidden="true"></span>
    <span class="add-checkbox"><Icon src={LuCircle} /></span>
    <input
        bind:this={inputEl}
        bind:value={text}
        class="add-input"
        placeholder="Add a task..."
        onkeydown={handleKeydown}
        maxlength={TASK_CONSTRAINTS.MAX_TEXT_LENGTH}
        aria-label="New task text"
    />
    <span class="add-actions-spacer" aria-hidden="true"></span>
</div>

<style>
    .add-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 4px;
        min-height: 36px;
        border-radius: 4px;
        transition: background-color 0.1s;
    }

    .add-row:hover {
        background: var(--color-surface-hover);
    }

    .drag-spacer {
        color: var(--color-iron-300);
        font-size: 12px;
        opacity: 0;
        user-select: none;
        width: 12px;
        text-align: center;
        flex-shrink: 0;
    }

    .add-checkbox {
        flex-shrink: 0;
        color: var(--color-iron-300);
        padding: 2px;
        line-height: 1;
    }

    .add-checkbox :global(svg) {
        width: 16px;
        height: 16px;
    }

    .add-input {
        flex: 1;
        font-size: 14px;
        padding: 2px 4px;
        border: 1px solid transparent;
        border-radius: 4px;
        outline: none;
        background: transparent;
        color: var(--color-text);
        transition: border-color 0.15s, background-color 0.15s;
        min-width: 0;
    }

    .add-input::placeholder {
        color: var(--color-text-muted);
        opacity: 0.6;
    }

    .add-input:focus {
        border-color: var(--color-border-focus);
        background: var(--color-surface);
    }

    .add-actions-spacer {
        flex-shrink: 0;
        width: 36px;
    }
</style>