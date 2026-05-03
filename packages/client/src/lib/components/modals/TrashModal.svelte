<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { taskStore } from '$lib/stores';
    import { TaskService } from '$lib/services/taskService';
    import { container } from '$lib/container';
    import type { Task } from '@alle/shared';
    import { onMount } from 'svelte';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    const taskService = new TaskService(container.httpClient);
    let deletedTasks = $state<Task[]>([]);
    let loading = $state(true);

    onMount(async () => {
        try {
            deletedTasks = await taskService.getTrash();
        } catch {
            deletedTasks = [];
        } finally {
            loading = false;
        }
    });

    async function handleRestore(id: string) {
        try {
            const restored = await taskService.restore(id);
            deletedTasks = deletedTasks.filter(t => t.id !== id);
            taskStore.restore(restored);
        } catch {
            // Show error?
        }
    }

    function daysUntilPurge(deletedAt: string): number {
        const deleted = new Date(deletedAt);
        const now = new Date();
        const diff = 7 - Math.floor((now.getTime() - deleted.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    }
</script>

<Modal title="Trash" onclose={onclose}>
    <div class="trash">
        {#if loading}
            <p class="hint">Loading...</p>
        {:else if deletedTasks.length === 0}
            <p class="empty">No recently deleted tasks.</p>
            <p class="hint">Deleted tasks appear here for 7 days before being permanently removed.</p>
        {:else}
            <ul class="list">
                {#each deletedTasks as task (task.id)}
                    <li class="list-item">
                        <span class="task-text">{task.text}</span>
                        <span class="days-left">{daysUntilPurge(task.deletedAt!)}d left</span>
                        <button class="restore-btn" onclick={() => handleRestore(task.id)} aria-label="Restore task">
                            Restore
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</Modal>

<style>
    .trash {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .list-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
        border-bottom: 1px solid var(--color-border);
    }

    .task-text {
        flex: 1;
        font-size: 14px;
        color: var(--color-text-secondary);
        text-decoration: line-through;
    }

    .days-left {
        font-size: 11px;
        color: var(--color-text-muted);
    }

    .restore-btn {
        background: none;
        border: 1px solid var(--color-accent);
        border-radius: 4px;
        color: var(--color-accent);
        padding: 4px 10px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.15s;
    }

    .restore-btn:hover {
        background: var(--color-accent-light);
    }

    .empty {
        font-size: 14px;
        color: var(--color-text-muted);
        text-align: center;
    }

    .hint {
        font-size: 12px;
        color: var(--color-text-muted);
        text-align: center;
    }
</style>