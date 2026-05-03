<script lang="ts">
    import TaskRow from './TaskRow.svelte';
    import InlineAddTask from './InlineAddTask.svelte';
    import type { Task } from '@alle/shared';
    import { uiStore, taskStore, getTasksByDate } from '$lib/stores';
    import { dndzone } from 'svelte-dnd-action';

    let { id, dateStr, label, tasks }: { id: string; dateStr: string; label: string; tasks: Task[] } = $props();

    const todayStr = new Date().toISOString().split('T')[0];
    let isToday = $derived(dateStr === todayStr);
    let taskCount = $derived(tasks.length);
    let completedCount = $derived(tasks.filter(t => t.completed).length);

    let localTasks = $state<Task[]>([]);
    let prevTasksKey = $state('');

    $effect(() => {
        const key = tasks.map(t => `${t.id}_${t.completed}_${t.updatedAt}_${t.text}`).join('|');
        if (key !== prevTasksKey) {
            prevTasksKey = key;
            localTasks = [...tasks];
        }
    });

    function handleConsider(e: CustomEvent) {
        localTasks = e.detail.items;
    }

    function handleFinalize(e: CustomEvent) {
        localTasks = e.detail.items;
        for (let i = 0; i < localTasks.length; i++) {
            const task = localTasks[i];
            const updates: Record<string, unknown> = {};
            if (task.position !== i) {
                updates.position = i;
            }
            if (task.date !== dateStr) {
                updates.date = dateStr;
            }
            if (task.someDayGroupId !== null) {
                updates.someDayGroupId = null;
            }
            if (Object.keys(updates).length > 0) {
                taskStore.update(task.id, updates);
            }
        }
    }
</script>

<section {id} class="day-section" class:today={isToday} role="listitem" aria-label={label}>
    <div class="day-header">
        <h2 class="day-title">
            {label}
            <span class="task-count">{taskCount} task{taskCount !== 1 ? 's' : ''}{taskCount > 0 ? ` \u2022 ${completedCount} done` : ''}</span>
        </h2>
    </div>
    <div class="task-list" role="list" use:dndzone={{ items: localTasks, type: "task" }} onconsider={handleConsider} onfinalize={handleFinalize}>
        {#if localTasks.length === 0}
            <div class="drop-placeholder" aria-hidden="true"></div>
        {/if}
        {#each localTasks as task (task.id)}
            <div class="task-drag-wrapper" class:sub-task={task.parentId !== null}>
                <TaskRow {task} {dateStr} />
            </div>
        {/each}
    </div>
    {#if uiStore.addingTo === dateStr}
        <InlineAddTask date={dateStr} oncancel={() => uiStore.startAdding(null)} />
    {:else}
        <button class="add-task-btn" onclick={() => uiStore.startAdding(dateStr)} aria-label="Add task">
            + add task
        </button>
    {/if}
</section>

<style>
    .day-section {
        margin-bottom: 24px;
    }

    .day-section.today {
        background: var(--color-accent-light);
        margin: -8px -12px 24px -12px;
        padding: 8px 12px;
        border-radius: 8px;
    }

    .day-header {
        border-bottom: 1px solid var(--color-border);
        padding-bottom: 6px;
        margin-bottom: 8px;
    }

    .day-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
    }

    .day-section.today .day-title {
        color: var(--color-accent);
    }

    .task-count {
        font-weight: 400;
        font-size: 12px;
        color: var(--color-text-secondary);
        margin-left: 8px;
    }

    .task-list {
        display: flex;
        flex-direction: column;
    }

    .drop-placeholder {
        min-height: 36px;
    }

    .task-drag-wrapper {
        cursor: default;
    }

    .task-drag-wrapper.sub-task {
        margin-left: 24px;
    }

    .add-task-btn {
        background: none;
        border: none;
        color: var(--color-text-muted);
        font-size: 13px;
        padding: 6px 24px;
        cursor: pointer;
        border-radius: 4px;
        width: 100%;
        text-align: left;
        transition: color 0.15s, background-color 0.15s;
    }

    .add-task-btn:hover {
        color: var(--color-text);
        background: var(--color-surface-hover);
    }

    .add-task-btn:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: -2px;
    }
</style>