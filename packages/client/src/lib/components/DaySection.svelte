<script lang="ts">
    import TaskRow from './TaskRow.svelte';
    import InlineAddTask from './InlineAddTask.svelte';
    import SectionHeader from './SectionHeader.svelte';
    import type { Task } from '@alle/shared';
    import { container } from '$lib/container';
    import { preferencesStore } from '$lib/stores';

    let { id, dateStr, label, tasks }: { id: string; dateStr: string; label: string; tasks: Task[] } = $props();

    const todayStr = $derived.by(() => {
        preferencesStore.timezone;
        return container.dateProvider.today();
    });
    let isToday = $derived(dateStr === todayStr);
    let taskCount = $derived(tasks.length);
    let completedCount = $derived(tasks.filter(t => t.completed).length);

    let sectionId = $derived(`day-${dateStr}`);
    let dateParts = $derived(container.dateProvider.formatDateParts(dateStr));

    let newlyCreatedIds = $state<Set<string>>(new Set());

    function handleTaskCreated(id: string) {
        newlyCreatedIds.add(id);
        setTimeout(() => newlyCreatedIds.delete(id), 600);
    }
</script>

<section {id} class="day-section" class:today={isToday} role="listitem" aria-label={label}>
    <SectionHeader
        {sectionId}
        title={label}
        {dateParts}
        {taskCount}
        {completedCount}
        {isToday}
    />
    <div class="task-list" role="list">
        {#each tasks as task (task.id)}
            <div class="task-row-wrapper" class:sub-task={task.parentId !== null}>
                <TaskRow {task} {dateStr} isNew={newlyCreatedIds.has(task.id)} />
            </div>
        {/each}
    </div>
    <InlineAddTask date={dateStr} oncreated={handleTaskCreated} />
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

    .task-row-wrapper.sub-task {
        margin-left: 24px;
    }
</style>