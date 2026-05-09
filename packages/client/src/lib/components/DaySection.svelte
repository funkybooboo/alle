<script lang="ts">
    import TaskRow from './TaskRow.svelte';
    import InlineAddTask from './InlineAddTask.svelte';
    import SectionHeader from './SectionHeader.svelte';
    import type { Task } from '@alle/shared';
    import { uiStore, taskStore, preferencesStore } from '$lib/stores';
    import { container } from '$lib/container';
    import { dndzone } from 'svelte-dnd-action';

    let { id, dateStr, label, tasks }: { id: string; dateStr: string; label: string; tasks: Task[] } = $props();

    const todayStr = container.dateProvider.today();
    let isToday = $derived(dateStr === todayStr);
    let isPast = $derived(dateStr < todayStr);
    let isOverdue = $derived(isPast && tasks.some(t => !t.completed));
    let overdueCount = $derived(isOverdue ? tasks.filter(t => !t.completed).length : 0);
    let taskCount = $derived(tasks.length);
    let completedCount = $derived(tasks.filter(t => t.completed).length);

    let sectionId = $derived(`day-${dateStr}`);
    let collapsed = $derived(preferencesStore.isSectionCollapsed(sectionId));

    let localTasks = $state<Task[]>([]);
    let prevTasksKey = $state('');
    let newlyCreatedIds = $state<Set<string>>(new Set());

    $effect(() => {
        const key = tasks.map(t => `${t.id}_${t.completed}_${t.updatedAt}_${t.text}`).join('|');
        if (key !== prevTasksKey) {
            prevTasksKey = key;
            localTasks = [...tasks];
        }
    });

    function handleTaskCreated(id: string) {
        newlyCreatedIds.add(id);
        setTimeout(() => newlyCreatedIds.delete(id), 600);
    }

    function handleConsider(e: CustomEvent) {
        localTasks = e.detail.items;
        uiStore.startDrag();
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
        uiStore.endDrag();
    }
</script>

<section {id} class="day-section" class:today={isToday} class:dragging={uiStore.isDragging} role="listitem" aria-label={label}>
    <SectionHeader
        sectionId={sectionId}
        title={label}
        {taskCount}
        {completedCount}
        {overdueCount}
        {isToday}
        {isOverdue}
    />
    {#if !collapsed}
        <div class="task-list" role="list" use:dndzone={{ items: localTasks, type: "task" }} onconsider={handleConsider} onfinalize={handleFinalize}>
            {#if localTasks.length === 0}
                <div class="drop-placeholder" aria-hidden="true"></div>
            {/if}
            {#each localTasks as task (task.id)}
                <div class="task-drag-wrapper" class:sub-task={task.parentId !== null}>
                    <TaskRow {task} {dateStr} isNew={newlyCreatedIds.has(task.id)} />
                </div>
            {/each}
        </div>
        <InlineAddTask date={dateStr} oncreated={handleTaskCreated} />
    {/if}
</section>

<style>
    .day-section {
        margin-bottom: 16px;
    }

    .day-section.today {
        background: var(--color-accent-light);
        margin: -8px -12px 16px -12px;
        padding: 8px 12px;
        border-radius: 8px;
    }

    .task-list {
        display: flex;
        flex-direction: column;
    }

    .drop-placeholder {
        min-height: 4px;
        transition: min-height 0.15s ease;
    }

    .dragging .drop-placeholder {
        min-height: 36px;
        border-top: 2px solid var(--color-warning);
    }

    .task-drag-wrapper {
        cursor: default;
    }

    .task-drag-wrapper.sub-task {
        margin-left: 24px;
    }
</style>