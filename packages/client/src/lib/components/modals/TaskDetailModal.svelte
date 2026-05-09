<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { taskStore, uiStore } from '$lib/stores';
    import { TASK_CONSTRAINTS, isValidTimeString, isValidTimeRange } from '@alle/shared';
    import type { Task } from '@alle/shared';
    import { Icon } from 'svelte-icons-pack';
    import { LuTrash2, LuPlus, LuCheck, LuCircle } from 'svelte-icons-pack/lu';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    let task = $state<Task | null>(null);
    let editText = $state('');
    let editNotes = $state('');
    let editDate = $state('');
    let editStartTime = $state('');
    let editEndTime = $state('');
    let editTags = $state('');
    let editRollover = $state(true);
    let showAddSubTask = $state(false);
    let newSubTaskText = $state('');
    let subTaskInputEl: HTMLInputElement | null = $state(null);

    let subTasks = $derived(task ? taskStore.tasks.filter(t => t.parentId === task!.id) : []);
    let subTaskStats = $derived({
        completed: subTasks.filter(t => t.completed).length,
        total: subTasks.length,
    });

    $effect(() => {
        const id = uiStore.focusedTaskId;
        if (id) {
            task = taskStore.tasks.find(t => t.id === id) ?? null;
            if (task) {
                editText = task.text;
                editNotes = task.notes ?? '';
                editDate = task.date ?? '';
                editStartTime = task.startTime ?? '';
                editEndTime = task.endTime ?? '';
                editTags = task.tags.join(', ');
                editRollover = task.rolloverEnabled;
            }
        }
    });

    $effect(() => {
        if (showAddSubTask && subTaskInputEl) {
            subTaskInputEl.focus();
        }
    });

    async function handleSave() {
        if (!task) return;
        const updates: Record<string, unknown> = {};

        if (editText.trim() !== task.text) updates.text = editText.trim();
        if (editNotes.trim() !== (task.notes ?? '')) updates.notes = editNotes.trim() || null;
        if (editDate !== (task.date ?? '')) updates.date = editDate || null;
        if (editStartTime !== (task.startTime ?? '')) updates.startTime = editStartTime || null;
        if (editEndTime !== (task.endTime ?? '')) updates.endTime = editEndTime || null;
        if (editTags !== task.tags.join(', ')) {
            updates.tags = editTags.split(',').map(t => t.trim()).filter(Boolean);
        }
        if (editRollover !== task.rolloverEnabled) updates.rolloverEnabled = editRollover;

        if (Object.keys(updates).length > 0) {
            await taskStore.update(task.id, updates);
        }
        uiStore.closeModal();
    }

    function clearDate() {
        editDate = '';
    }

    async function handleAddSubTask() {
        if (!task || !newSubTaskText.trim()) return;
        await taskStore.create({
            text: newSubTaskText.trim(),
            parentId: task.id,
            date: task.date,
        });
        newSubTaskText = '';
    }

    function handleSubTaskKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSubTask();
        } else if (e.key === 'Escape') {
            showAddSubTask = false;
            newSubTaskText = '';
        }
    }

    async function handleToggleSubTask(subTask: Task) {
        await taskStore.update(subTask.id, { completed: !subTask.completed });
    }

    async function handleDeleteSubTask(subTask: Task) {
        await taskStore.remove(subTask.id);
    }

    async function handleDeleteTask() {
        if (!task) return;
        const removedTask: Task = { ...task };
        const success = await taskStore.remove(task.id);
        if (success) {
            uiStore.showToast('Task deleted', {
                label: 'Undo',
                fn: () => taskStore.restore(removedTask),
            });
        }
        uiStore.closeModal();
    }
</script>

{#if task}
    <Modal title="Task Details" onclose={onclose}>
        <div class="task-detail">
            <label class="field">
                <span class="label">Text</span>
                <input
                    class="input"
                    type="text"
                    bind:value={editText}
                    maxlength={TASK_CONSTRAINTS.MAX_TEXT_LENGTH}
                    aria-label="Task text"
                />
            </label>

            <label class="field">
                <span class="label">Notes</span>
                <textarea
                    class="textarea"
                    bind:value={editNotes}
                    rows={4}
                    placeholder="Add notes (markdown supported later)"
                    aria-label="Task notes"
                ></textarea>
            </label>

            <label class="field">
                <span class="label">Date</span>
                <div class="date-row">
                    <input class="input" type="date" bind:value={editDate} aria-label="Task date" />
                    {#if editDate}
                        <button class="clear-date-btn" onclick={clearDate} aria-label="Clear date">Clear</button>
                    {/if}
                </div>
            </label>

            <div class="time-row">
                <label class="field time-field">
                    <span class="label">Start time</span>
                    <input
                        class="input"
                        type="time"
                        bind:value={editStartTime}
                        aria-label="Start time"
                    />
                </label>
                <label class="field time-field">
                    <span class="label">End time</span>
                    <input
                        class="input"
                        type="time"
                        bind:value={editEndTime}
                        aria-label="End time"
                    />
                </label>
            </div>

            <label class="field">
                <span class="label">Tags</span>
                <input
                    class="input"
                    type="text"
                    bind:value={editTags}
                    placeholder="work, p1, important"
                    aria-label="Tags (comma-separated)"
                />
            </label>

            <label class="checkbox-field">
                <input type="checkbox" bind:checked={editRollover} />
                <span>Auto-rollover enabled</span>
            </label>

            {#if task.parentId}
                <div class="info-text">Sub-task of: {taskStore.tasks.find(t => t.id === task?.parentId)?.text ?? 'unknown'}</div>
            {/if}

            {#if task.recurringTaskId}
                <div class="info-text">This is a recurring task instance</div>
            {/if}

            <div class="subtask-section">
                <span class="label">
                    {#if subTaskStats.total === 0}
                        No sub-tasks
                    {:else}
                        Sub-tasks ({subTaskStats.completed}/{subTaskStats.total})
                    {/if}
                </span>

                {#if subTaskStats.total > 0}
                    <ul class="subtask-list">
                        {#each subTasks as subTask (subTask.id)}
                            <li class="subtask-item" class:completed={subTask.completed}>
                                <button
                                    class="subtask-checkbox"
                                    class:checked={subTask.completed}
                                    onclick={() => handleToggleSubTask(subTask)}
                                    aria-label="{subTask.completed ? 'Mark incomplete' : 'Mark complete'}"
                                >
                                    <Icon src={subTask.completed ? LuCheck : LuCircle} size={14} />
                                </button>
                                <span class="subtask-text">{subTask.text}</span>
                                <button
                                    class="subtask-delete-btn"
                                    onclick={() => handleDeleteSubTask(subTask)}
                                    aria-label="Delete sub-task"
                                >
                                    <Icon src={LuTrash2} size={14} />
                                </button>
                            </li>
                        {/each}
                    </ul>
                {/if}

                {#if showAddSubTask}
                    <div class="add-subtask-row">
                        <input
                            class="add-subtask-input"
                            type="text"
                            bind:value={newSubTaskText}
                            bind:this={subTaskInputEl}
                            placeholder="Sub-task name..."
                            onkeydown={handleSubTaskKeydown}
                            aria-label="New sub-task name"
                        />
                    </div>
                {:else}
                    <button class="add-subtask-btn" onclick={() => { showAddSubTask = true; newSubTaskText = ''; }}>
                        <Icon src={LuPlus} size={14} />
                        add sub-task
                    </button>
                {/if}
            </div>

            <div class="actions">
                <button class="delete-task-btn" onclick={handleDeleteTask}>Delete task</button>
                <div class="actions-spacer"></div>
                <button class="save-btn" onclick={handleSave}>Save</button>
                <button class="cancel-btn" onclick={() => uiStore.closeModal()}>Cancel</button>
            </div>
        </div>
    </Modal>
{/if}

<style>
    .task-detail {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .label {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .input, .textarea {
        padding: 8px 12px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        font-size: 14px;
        background: var(--color-surface-dim);
        color: var(--color-text);
        outline: none;
        width: 100%;
    }

    .input:focus, .textarea:focus {
        border-color: var(--color-accent);
    }

    .textarea {
        resize: vertical;
        min-height: 80px;
        font-family: inherit;
    }

    .date-row {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .clear-date-btn {
        background: none;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        color: var(--color-text-secondary);
    }

    .clear-date-btn:hover {
        background: var(--color-danger-light);
        color: var(--color-danger);
        border-color: var(--color-danger);
    }

    .time-row {
        display: flex;
        gap: 12px;
    }

    .time-field {
        flex: 1;
    }

    .checkbox-field {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
    }

    .checkbox-field input[type="checkbox"] {
        width: 16px;
        height: 16px;
    }

    .info-text {
        font-size: 13px;
        color: var(--color-text-secondary);
        padding: 8px 12px;
        background: var(--color-surface-dim);
        border-radius: 6px;
    }

    .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 8px;
    }

    .save-btn {
        background: var(--color-accent);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.15s;
    }

    .save-btn:hover {
        background: var(--color-accent-hover);
    }

    .cancel-btn {
        background: none;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        padding: 8px 20px;
        font-size: 14px;
        cursor: pointer;
        color: var(--color-text-secondary);
        transition: background-color 0.15s;
    }

    .cancel-btn:hover {
        background: var(--color-surface-hover);
    }

    .subtask-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .subtask-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .subtask-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 6px;
        background: var(--color-surface-dim);
        font-size: 13px;
    }

    .subtask-item.completed .subtask-text {
        text-decoration: line-through;
        color: var(--color-text-secondary);
    }

    .subtask-checkbox {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        color: var(--color-text-secondary);
        flex-shrink: 0;
    }

    .subtask-checkbox.checked {
        color: var(--color-accent);
    }

    .subtask-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--color-text);
    }

    .subtask-delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        color: var(--color-text-secondary);
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.15s, color 0.15s;
    }

    .subtask-item:hover .subtask-delete-btn {
        opacity: 1;
    }

    .subtask-delete-btn:hover {
        color: var(--color-danger);
    }

    .add-subtask-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 13px;
        color: var(--color-text-secondary);
        padding: 4px 0;
        transition: color 0.15s;
    }

    .add-subtask-btn:hover {
        color: var(--color-accent);
    }

    .add-subtask-row {
        display: flex;
        gap: 8px;
    }

    .add-subtask-input {
        flex: 1;
        padding: 6px 10px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        font-size: 13px;
        background: var(--color-surface-dim);
        color: var(--color-text);
        outline: none;
    }

    .add-subtask-input:focus {
        border-color: var(--color-accent);
    }

    .delete-task-btn {
        background: none;
        border: 1px solid var(--color-danger);
        color: var(--color-danger);
        border-radius: 6px;
        padding: 8px 20px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.15s, color 0.15s;
    }

    .delete-task-btn:hover {
        background: var(--color-danger);
        color: white;
    }

    .actions-spacer {
        flex: 1;
    }
</style>