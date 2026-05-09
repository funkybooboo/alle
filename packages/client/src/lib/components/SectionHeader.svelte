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

    let collapsed = $derived(preferencesStore.isSectionCollapsed(sectionId));

    function toggle() {
        preferencesStore.toggleSectionCollapsed(sectionId);
    }
</script>

<button
    class="section-header"
    class:today={isToday}
    class:overdue={isOverdue}
    onclick={toggle}
    aria-expanded={!collapsed}
    aria-label="{collapsed ? 'Expand' : 'Collapse'} {title}"
>
    <span class="chevron" class:collapsed>{#if collapsed}&#9654;{:else}&#9660;{/if}</span>
    <span class="section-title">{title}</span>
    <span class="section-stats">
        {taskCount} task{taskCount !== 1 ? 's' : ''}{taskCount > 0 ? ` \u2022 ${completedCount} done` : ''}
        {#if overdueCount > 0}
            <span class="overdue-count">{overdueCount} overdue</span>
        {/if}
    </span>
</button>

<style>
    .section-header {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        padding: 6px 0;
        border: none;
        background: none;
        cursor: pointer;
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text);
        text-align: left;
        font-family: inherit;
    }

    .section-header:hover {
        background: var(--color-surface-hover);
        border-radius: 2px;
    }

    .section-header:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: -2px;
        border-radius: 2px;
    }

    .section-header.today {
        color: var(--color-accent);
    }

    .section-header.overdue {
        border-left: 3px solid var(--color-danger);
        padding-left: 5px;
        border-radius: 0;
    }

    .chevron {
        font-size: 10px;
        color: var(--color-text-muted);
        flex-shrink: 0;
        transition: transform 0.15s ease;
        width: 14px;
        text-align: center;
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