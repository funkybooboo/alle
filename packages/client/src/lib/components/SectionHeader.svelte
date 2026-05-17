<script lang="ts">
    import { preferencesStore } from '$lib/stores';

    let {
        sectionId,
        title,
        taskCount,
        completedCount,
        overdueCount = 0,
        isToday = false,
        isOverdue = false,
    }: {
        sectionId: string;
        title: string;
        taskCount: number;
        completedCount: number;
        overdueCount?: number;
        isToday?: boolean;
        isOverdue?: boolean;
    } = $props();
</script>

<div
    class="section-header"
    class:today={isToday}
    class:overdue={isOverdue}
>
    <span class="section-title">{title}</span>
    <span class="section-stats">
        {taskCount} task{taskCount !== 1 ? 's' : ''}{taskCount > 0 ? ` \u2022 ${completedCount} done` : ''}
        {#if overdueCount > 0}
            <span class="overdue-count">{overdueCount} overdue</span>
        {/if}
    </span>
</div>

<style>
    .section-header {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        padding: 6px 0;
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text);
        text-align: left;
        font-family: inherit;
    }

    .section-header.today {
        color: var(--color-accent);
    }

    .section-header.overdue {
        border-left: 3px solid var(--color-danger);
        padding-left: 5px;
        border-radius: 0;
    }

    .section-title {
        font-size: 14px;
        font-weight: 600;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .section-stats {
        font-weight: 400;
        font-size: 12px;
        color: var(--color-text-secondary);
        flex-shrink: 0;
        white-space: nowrap;
    }

    .overdue-count {
        color: var(--color-danger);
        font-weight: 500;
    }
</style>
