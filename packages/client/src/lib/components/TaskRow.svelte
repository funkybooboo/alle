<script lang="ts">
    import { taskStore, uiStore, notificationStore } from '$lib/stores';
    import { TASK_CONSTRAINTS } from '@alle/shared';
    import type { Task } from '@alle/shared';
    import { Icon } from 'svelte-icons-pack';
    import { LuCheck, LuCircle, LuRepeat, LuFileText, LuX } from 'svelte-icons-pack/lu';

    let { task, dateStr = '', isNew = false }: { task: Task; dateStr?: string; isNew?: boolean } = $props();

    let isEditing = $derived(uiStore.editingTaskId === task.id);
    let hasStartTime = $derived(task.startTime !== null);

    let editText = $state('');
    let editInput = $state<HTMLInputElement | undefined>(undefined);

    $effect(() => {
        if (isEditing) {
            editText = task.text;
        }
    });

    $effect(() => {
        if (uiStore.editingTaskId === task.id && editInput) {
            editInput.focus();
        }
    });

    function handleCheckboxChange() {
        taskStore.update(task.id, { completed: !task.completed });
    }

    function startEdit() {
        uiStore.startEditing(task.id);
    }

    function commitEdit() {
        if (editText.trim() && editText.trim() !== task.text) {
            taskStore.update(task.id, { text: editText.trim() });
        }
        uiStore.startEditing(null);
    }

    function cancelEdit() {
        uiStore.startEditing(null);
        editText = task.text;
    }

    function handleEditKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    }

    function openDetail() {
        uiStore.focusTask(task.id);
        uiStore.openModal('taskDetail');
    }

    async function handleDelete() {
        const removedTask: Task = { ...task };
        const success = await taskStore.remove(task.id);
        if (success) {
            notificationStore.push('Task deleted', {
                kind: 'info',
                action: { label: 'Undo', fn: () => taskStore.restore(removedTask) },
            });
        }
    }
</script>

<div
    class="task-row"
    class:completed={task.completed}
    class:task-new={isNew}
    aria-label="{task.text}{task.completed ? ', completed' : ''}"
>
    <button
        class="checkbox"
        class:checked={task.completed}
        onclick={handleCheckboxChange}
        aria-label="{task.completed ? 'Mark incomplete' : 'Mark complete'}"
        aria-pressed={task.completed}
    >
        {#if task.completed}
            <Icon src={LuCheck} />
        {:else}
            <Icon src={LuCircle} />
        {/if}
    </button>

    {#if isEditing}
        <input
            bind:this={editInput}
            bind:value={editText}
            class="edit-input"
            onkeydown={handleEditKeydown}
            onblur={commitEdit}
            maxlength={TASK_CONSTRAINTS.MAX_TEXT_LENGTH}
        />
    {:else}
        <button class="task-text" onclick={startEdit} title="Click to edit">
            {#if hasStartTime}
                <span class="time-badge">{task.startTime}</span>
            {/if}
            {task.text}
        </button>
    {/if}

    <div class="task-meta">
        {#if task.recurringTaskId}
            <span class="recurring-icon" title="Recurring task"><Icon src={LuRepeat} /></span>
        {/if}

        {#each task.tags as tag}
            <span class="tag-chip">#{tag}</span>
        {/each}
    </div>

    <div class="task-actions">
        <button class="action-btn" onclick={openDetail} aria-label="Task details" title="Details (e)">
            <Icon src={LuFileText} />
        </button>
        <button class="action-btn danger" onclick={handleDelete} aria-label="Delete task" title="Delete (d)">
            <Icon src={LuX} />
        </button>
    </div>
</div>

<style>
    .task-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 4px;
        border-radius: 4px;
        transition: background-color 0.1s;
        min-height: 36px;
    }

    .task-row:hover {
        background: var(--color-surface-hover);
    }

    .task-row.completed .task-text {
        text-decoration: line-through;
        color: var(--color-text-muted);
    }

    .task-new {
        animation: task-flash 500ms ease-out;
    }

    @keyframes task-flash {
        from { background: var(--color-accent-light); }
        to { background: transparent; }
    }

    .checkbox {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        line-height: 1;
        color: var(--color-text-muted);
        transition: color 0.15s;
        flex-shrink: 0;
    }

    .checkbox :global(svg) {
        width: 16px;
        height: 16px;
    }

    .checkbox:hover {
        color: var(--color-accent);
    }

    .checkbox.checked {
        color: var(--color-success);
    }

    .checkbox:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
        border-radius: 2px;
    }

    .task-text {
        flex: 1;
        font-size: 14px;
        color: var(--color-text);
        cursor: text;
        min-width: 0;
        text-align: left;
    }

    .edit-input {
        flex: 1;
        font-size: 14px;
        padding: 2px 4px;
        border: 1px solid var(--color-accent);
        border-radius: 4px;
        outline: none;
        background: var(--color-surface);
        color: var(--color-text);
    }

    .time-badge {
        font-size: 12px;
        font-family: monospace;
        color: var(--color-text-secondary);
        margin-right: 6px;
        background: var(--color-surface-hover);
        padding: 1px 4px;
        border-radius: 3px;
    }

    .task-meta {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
    }

    .recurring-icon :global(svg) {
        width: 13px;
        height: 13px;
    }

    .tag-chip {
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 10px;
        background: var(--color-surface-hover);
        color: var(--color-text-secondary);
    }

    .task-actions {
        display: flex;
        gap: 2px;
        opacity: 0;
        transition: opacity 0.15s;
        flex-shrink: 0;
    }

    .task-row:hover .task-actions {
        opacity: 1;
    }

    .action-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 3px;
        color: var(--color-text-secondary);
        transition: background-color 0.15s, color 0.15s;
    }

    .action-btn :global(svg) {
        width: 14px;
        height: 14px;
    }

    .action-btn:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    .action-btn.danger:hover {
        background: var(--color-danger-light);
        color: var(--color-danger);
    }

    .action-btn:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: -2px;
    }
</style>