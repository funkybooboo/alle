<script lang="ts">
    import { onMount } from 'svelte';
    import { taskStore, preferencesStore, someDayGroupStore } from '$lib/stores';
    import DayList from '$lib/components/DayList.svelte';

    onMount(() => {
        preferencesStore.load();
        taskStore.fetchAll();
        someDayGroupStore.fetchAll();
    });
</script>

<svelte:head>
    <title>Alle - Task App</title>
</svelte:head>

{#if taskStore.loading && taskStore.tasks.length === 0}
    <div class="loading">
        <p>Loading tasks...</p>
    </div>
{:else if taskStore.error}
    <div class="error">
        <p>Something went wrong: {taskStore.error}</p>
        <button onclick={() => taskStore.fetchAll()}>Retry</button>
    </div>
{:else}
    <DayList />
{/if}

<style>
    .loading, .error {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        color: var(--color-text-muted);
    }

    .error button {
        margin-left: 12px;
        padding: 4px 12px;
        background: var(--color-accent);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
</style>