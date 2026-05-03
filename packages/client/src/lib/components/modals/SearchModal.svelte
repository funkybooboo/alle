<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { taskStore, uiStore } from '$lib/stores';
    import type { Task } from '@alle/shared';
    import { Icon } from 'svelte-icons-pack';
    import { LuCheck, LuCircle } from 'svelte-icons-pack/lu';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    let query = $state('');
    let results = $state<Task[]>([]);

    $effect(() => {
        if (query.trim()) {
            const q = query.toLowerCase();
            results = taskStore.tasks.filter(t =>
                t.text.toLowerCase().includes(q) ||
                t.tags.some(tag => tag.toLowerCase().includes(q)) ||
                (t.notes && t.notes.toLowerCase().includes(q))
            ).slice(0, 20);
        } else {
            results = [];
        }
    });

    function handleSelect(task: Task) {
        uiStore.focusTask(task.id);
        if (task.date) {
            const el = document.getElementById(`day-${task.date}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        uiStore.closeModal();
    }
</script>

<Modal title="Search" onclose={onclose}>
    <div class="search">
        <input
            class="search-input"
            type="text"
            bind:value={query}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            autofocus
        />

        {#if results.length > 0}
            <ul class="results" role="listbox">
                {#each results as task (task.id)}
                    <li>
                        <button class="result-item" onclick={() => handleSelect(task)} role="option" aria-selected="false">
                            <span class="result-checkbox">{#if task.completed}<Icon src={LuCheck} />{:else}<Icon src={LuCircle} />{/if}</span>
                            <span class="result-text" class:completed={task.completed}>{task.text}</span>
                            {#if task.date}
                                <span class="result-date">{task.date}</span>
                            {/if}
                            {#each task.tags as tag}
                                <span class="result-tag">#{tag}</span>
                            {/each}
                        </button>
                    </li>
                {/each}
            </ul>
        {:else if query.trim()}
            <p class="empty">No tasks found.</p>
        {:else}
            <p class="hint">Type to search across task text, notes, and tags.</p>
        {/if}
    </div>
</Modal>

<style>
    .search {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .search-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        font-size: 14px;
        background: var(--color-surface-dim);
        color: var(--color-text);
        outline: none;
    }

    .search-input:focus {
        border-color: var(--color-accent);
    }

    .results {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 400px;
        overflow-y: auto;
    }

    .result-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 12px;
        background: none;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        text-align: left;
        color: var(--color-text);
        font-size: 14px;
        transition: background-color 0.1s;
    }

    .result-item:hover {
        background: var(--color-surface-hover);
    }

    .result-checkbox {
        color: var(--color-iron-400);
        flex-shrink: 0;
    }

    .result-checkbox :global(svg) {
        width: 14px;
        height: 14px;
    }

    .result-text.completed {
        text-decoration: line-through;
        color: var(--color-text-muted);
    }

    .result-date {
        font-size: 12px;
        color: var(--color-text-muted);
        font-family: monospace;
    }

    .result-tag {
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 10px;
        background: var(--color-iron-100);
        color: var(--color-text-secondary);
    }

    .empty, .hint {
        color: var(--color-text-muted);
        text-align: center;
        padding: 20px 0;
        font-size: 14px;
    }
</style>