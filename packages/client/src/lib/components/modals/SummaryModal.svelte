<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { taskStore } from '$lib/stores';
    import { container } from '$lib/container';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    const todayStr = container.dateProvider.today();

    let allTasks = $derived(taskStore.tasks);
    let todayTasks = $derived(allTasks.filter(t => t.date === todayStr));
    let completedToday = $derived(todayTasks.filter(t => t.completed).length);
    let totalToday = $derived(todayTasks.length);
    let completionPct = $derived(totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0);
    let overdue = $derived(allTasks.filter(t => !t.completed && t.date && t.date < todayStr && t.rolloverEnabled));
    let upcomingDeadlines = $derived(allTasks.filter(t => !t.completed && t.tags.includes('deadline') && t.date).slice(0, 5));
</script>

<Modal title="Summary" onclose={onclose}>
    <div class="summary" role="region" aria-label="Daily summary">
        <section class="section" aria-labelledby="summary-today-heading">
            <h3 id="summary-today-heading">Today</h3>
            <div class="stat-grid">
                <div class="stat">
                    <span class="stat-value">{completionPct}%</span>
                    <span class="stat-label">Complete</span>
                </div>
                <div class="stat">
                    <span class="stat-value">{completedToday}/{totalToday}</span>
                    <span class="stat-label">Tasks</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: {completionPct}%"></div>
            </div>
        </section>

        {#if overdue.length > 0}
            <section class="section" aria-labelledby="summary-overdue-heading">
                <h3 id="summary-overdue-heading">Overdue</h3>
                <ul class="list">
                    {#each overdue.slice(0, 10) as task}
                        <li class="list-item overdue">
                            <span class="task-text">{task.text}</span>
                            {#if task.daysLate > 0}
                                <span class="badge badge-danger">{task.daysLate}d</span>
                            {/if}
                        </li>
                    {/each}
                </ul>
            </section>
        {/if}

        {#if upcomingDeadlines.length > 0}
<section class="section" aria-labelledby="summary-deadlines-heading">
                <h3 id="summary-deadlines-heading">Upcoming Deadlines</h3>
                <ul class="list">
                    {#each upcomingDeadlines as task}
                        <li class="list-item">
                            <span class="task-text">{task.text}</span>
                            <span class="badge">{task.date}</span>
                        </li>
                    {/each}
                </ul>
            </section>
        {/if}
    </div>
</Modal>

<style>
    .summary {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .section h3 {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 8px;
    }

    .stat-grid {
        display: flex;
        gap: 24px;
        margin-bottom: 8px;
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--color-text);
    }

    .stat-label {
        font-size: 12px;
        color: var(--color-text-secondary);
    }

    .progress-bar {
        height: 6px;
        background: var(--color-border);
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: var(--color-success);
        border-radius: 3px;
        transition: width 0.3s ease;
    }

    .list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .list-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid var(--color-border);
    }

    .list-item.overdue .task-text {
        color: var(--color-danger);
    }

    .task-text {
        font-size: 14px;
    }

    .badge {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 10px;
        background: var(--color-surface-hover);
        color: var(--color-text-secondary);
    }

    .badge-danger {
        background: var(--color-danger-light);
        color: var(--color-danger);
    }
</style>