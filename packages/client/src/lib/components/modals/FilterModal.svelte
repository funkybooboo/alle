<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { preferencesStore, tagStore, projectStore } from '$lib/stores';
    import { PRIORITY_TAGS } from '@alle/shared';
    import { onMount } from 'svelte';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    let safeTags = $derived(tagStore?.tags ?? []);
    let safeFilterTags = $derived(preferencesStore?.activeFilters.tags ?? []);
    let safeProjectId = $derived(preferencesStore?.activeFilters.projectId ?? null);
    let safePriority = $derived(preferencesStore?.activeFilters.priority ?? null);
    let safeShowCompleted = $derived(preferencesStore?.activeFilters.showCompleted ?? true);

    onMount(() => {
        tagStore.fetchAll();
        projectStore.fetchAll();
    });
</script>

<Modal title="Filter" onclose={onclose}>
    <div class="filter">
        <fieldset class="section" aria-labelledby="filter-tags-heading">
            <legend class="section-heading" id="filter-tags-heading">Tags</legend>
            {#if safeTags.length > 0}
                <div class="tag-grid" role="group" aria-label="Tag filters">
                    {#each safeTags as tag}
                        <button
                            class="tag-option"
                            class:active={safeFilterTags.includes(tag)}
                            onclick={() => preferencesStore.toggleTag(tag)}
                            aria-pressed={safeFilterTags.includes(tag)}
                        >
                            #{tag}
                        </button>
                    {/each}
                </div>
            {:else}
                <p class="hint">No tags yet. Add tags to tasks to filter by them.</p>
            {/if}
        </fieldset>

        <fieldset class="section" aria-labelledby="filter-priority-heading">
            <legend class="section-heading" id="filter-priority-heading">Priority</legend>
            <div class="priority-options" role="radiogroup" aria-label="Priority filter">
                {#each [null, ...PRIORITY_TAGS] as p}
                    <button
                        class="priority-option"
                        class:active={safePriority === p}
                        onclick={() => preferencesStore.setPriority(p)}
                        role="radio"
                        aria-checked={safePriority === p}
                    >
                        {p ? `#${p}` : 'All'}
                    </button>
                {/each}
            </div>
        </fieldset>

        <fieldset class="section" aria-labelledby="filter-project-heading">
            <legend class="section-heading" id="filter-project-heading">Project</legend>
            <div class="project-options" role="radiogroup" aria-label="Project filter">
                <button
                    class="project-option"
                    class:active={safeProjectId === null}
                    onclick={() => preferencesStore.setProject(null)}
                    role="radio"
                    aria-checked={safeProjectId === null}
                >
                    All projects
                </button>
                {#each projectStore.projects as project}
                    <button
                        class="project-option"
                        class:active={safeProjectId === project.id}
                        onclick={() => preferencesStore.setProject(project.id)}
                        role="radio"
                        aria-checked={safeProjectId === project.id}
                    >
                        {project.name}
                    </button>
                {/each}
            </div>
        </fieldset>

        <fieldset class="section" aria-labelledby="filter-status-heading">
            <legend class="section-heading" id="filter-status-heading">Status</legend>
            <label class="checkbox-label">
                <input
                    type="checkbox"
                    checked={safeShowCompleted}
                    onchange={(e) => preferencesStore.setShowCompleted(e.currentTarget.checked)}
                    id="filter-show-completed"
                />
                <span>Show completed tasks</span>
            </label>
        </fieldset>

        <button class="clear-btn" onclick={() => preferencesStore.clearAll()}>
            Clear all filters
        </button>
    </div>
</Modal>

<style>
    .filter {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .section-heading {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 8px;
    }

    fieldset.section {
        border: none;
        padding: 0;
        margin: 0;
    }

    .tag-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .tag-option {
        background: var(--color-iron-100);
        border: 1px solid var(--color-border);
        border-radius: 14px;
        padding: 4px 10px;
        font-size: 12px;
        cursor: pointer;
        color: var(--color-text-secondary);
        transition: all 0.15s;
    }

    .tag-option:hover {
        background: var(--color-iron-200);
    }

    .tag-option.active {
        background: var(--color-accent-light);
        border-color: var(--color-accent);
        color: var(--color-accent);
    }

    .priority-options, .project-options {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .priority-option, .project-option {
        background: var(--color-iron-100);
        border: 1px solid var(--color-border);
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 13px;
        cursor: pointer;
        color: var(--color-text-secondary);
        transition: all 0.15s;
    }

    .priority-option:hover, .project-option:hover {
        background: var(--color-iron-200);
    }

    .priority-option.active, .project-option.active {
        background: var(--color-accent-light);
        border-color: var(--color-accent);
        color: var(--color-accent);
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
        width: 16px;
        height: 16px;
    }

    .clear-btn {
        background: none;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 13px;
        cursor: pointer;
        color: var(--color-text-secondary);
        transition: all 0.15s;
    }

    .clear-btn:hover {
        background: var(--color-danger-light);
        border-color: var(--color-danger);
        color: var(--color-danger);
    }

    .hint {
        font-size: 13px;
        color: var(--color-text-muted);
    }
</style>