<script lang="ts">
    import { taskStore, filterStore } from '$lib/stores';
    import { Icon } from 'svelte-icons-pack';
    import { LuX, LuSquareCheck } from 'svelte-icons-pack/lu';

    let totalTasks = $derived(taskStore.tasks.length);
    let completedCount = $derived(taskStore.tasks.filter(t => t.completed).length);
    let todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    function handleHomeClick() {
        filterStore.clearAll();
        scrollToToday();
    }

    function scrollToToday() {
        const todayEl = document.getElementById(`day-${new Date().toISOString().split('T')[0]}`);
        const container = document.querySelector('.day-list-area') as HTMLElement | null;
        if (todayEl && container) {
            const elTop = todayEl.offsetTop - container.offsetTop;
            const elHeight = todayEl.offsetHeight;
            const containerHeight = container.clientHeight;
            container.scrollTo({
                top: elTop + elHeight / 2 - containerHeight / 2,
                behavior: 'smooth',
            });
        } else if (todayEl) {
            todayEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
</script>

<footer class="bottom-bar">
    <button class="logo-btn" onclick={handleHomeClick} aria-label="Home — clear filters and go to today">
        <Icon src={LuSquareCheck} />
        <strong>alle</strong>
    </button>

    <div class="filter-chips">
        {#each filterStore.tags ?? [] as tag}
            <span class="chip">
                #{tag}
                <button class="chip-remove" onclick={() => filterStore.toggleTag(tag)} aria-label="Remove filter #{tag}"><Icon src={LuX} /></button>
            </span>
        {/each}
        {#if filterStore.projectId}
            <span class="chip">
                Project
                <button class="chip-remove" onclick={() => filterStore.setProject(null)} aria-label="Remove project filter"><Icon src={LuX} /></button>
            </span>
        {/if}
        {#if filterStore.priority}
            <span class="chip">
                #{filterStore.priority}
                <button class="chip-remove" onclick={() => filterStore.setPriority(null)} aria-label="Remove priority filter"><Icon src={LuX} /></button>
            </span>
        {/if}
        {#if !filterStore.showCompleted}
            <span class="chip">
                Completed
                <button class="chip-remove" onclick={() => filterStore.setShowCompleted(true)} aria-label="Remove completed filter"><Icon src={LuX} /></button>
            </span>
        {/if}
        {#if filterStore.activeFilterCount > 1}
            <button class="clear-all-btn" onclick={filterStore.clearAll}>clear all</button>
        {/if}
    </div>

    <div class="status">
        <button class="date-btn" onclick={scrollToToday} aria-label="Scroll to today">
            {todayLabel}
        </button>
        <span class="task-stats">{totalTasks} task{totalTasks !== 1 ? 's' : ''} &bull; {completedCount} done</span>
    </div>
</footer>

<style>
    .bottom-bar {
        display: flex;
        align-items: center;
        height: 40px;
        min-height: 40px;
        padding: 0 12px;
        background: var(--color-surface);
        border-top: 1px solid var(--color-border);
        gap: 12px;
        font-size: 13px;
        color: var(--color-text-secondary);
    }

    .logo-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: none;
        border: none;
        font-size: 14px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        color: var(--color-text);
        transition: background-color 0.15s;
    }

    .logo-btn :global(svg) {
        width: 16px;
        height: 16px;
    }

    .logo-btn:hover {
        background: var(--color-surface-hover);
    }

    .filter-chips {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: 1;
        min-width: 0;
        overflow-x: auto;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        background: var(--color-accent-light);
        color: var(--color-accent);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        white-space: nowrap;
    }

    .chip-remove {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-accent);
        padding: 0 2px;
        line-height: 1;
    }

    .chip-remove :global(svg) {
        width: 12px;
        height: 12px;
    }

    .chip-remove:hover {
        color: var(--color-danger);
    }

    .clear-all-btn {
        background: none;
        border: none;
        font-size: 11px;
        color: var(--color-text-muted);
        cursor: pointer;
        text-decoration: underline;
    }

    .clear-all-btn:hover {
        color: var(--color-danger);
    }

    .status {
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
    }

    .date-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 12px;
        color: var(--color-text-secondary);
        padding: 2px 6px;
        border-radius: 4px;
        transition: background-color 0.15s, color 0.15s;
    }

    .date-btn:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    .date-btn:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
    }

    .task-stats {
        font-size: 12px;
        color: var(--color-text-secondary);
    }

    
</style>