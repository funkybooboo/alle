<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { preferencesStore, tagStore } from '$lib/stores';
    import { resolveTagKind } from '@alle/shared';
    import { onMount } from 'svelte';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    let safeTags = $derived(tagStore?.tags ?? []);
    let safeFilterTags = $derived(preferencesStore?.activeFilters.tags ?? []);
    let safeShowCompleted = $derived(preferencesStore?.activeFilters.showCompleted ?? true);
    let tagKinds = $derived(preferencesStore?.tagKinds ?? []);
    let tagKindMap = $derived(preferencesStore?.tagKindMap ?? {});

    let groupedTags = $derived(() => {
        const groups = new Map<string, { kind: typeof tagKinds[number] | null; tags: string[] }>();
        const kindOrder = [...tagKinds].sort((a, b) => a.sortOrder - b.sortOrder);
        const seenKinds = new Set<string>();

        for (const kind of kindOrder) {
            const tags: string[] = [];
            for (const tag of safeTags) {
                if (resolveTagKind(tag, tagKinds, tagKindMap)?.id === kind.id) {
                    tags.push(tag);
                }
            }
            if (tags.length > 0) {
                groups.set(kind.id, { kind, tags });
                seenKinds.add(kind.id);
            }
        }

        const uncategorized: string[] = [];
        for (const tag of safeTags) {
            const resolved = resolveTagKind(tag, tagKinds, tagKindMap);
            if (!resolved) {
                uncategorized.push(tag);
            }
        }
        if (uncategorized.length > 0) {
            groups.set('__uncategorized__', { kind: null, tags: uncategorized });
        }

        return groups;
    });

    onMount(() => {
        tagStore.fetchAll();
    });
</script>

<Modal title="Filter" onclose={onclose}>
    <div class="filter">
        {#each [...groupedTags().values()] as group}
            <fieldset class="section" aria-labelledby="filter-heading-{group.kind?.id ?? 'other'}">
                <legend class="section-heading" id="filter-heading-{group.kind?.id ?? 'other'}">
                    {group.kind?.name ?? 'Other tags'}
                </legend>
                {#if group.kind?.behavior === 'single'}
                    <div class="single-options" role="radiogroup" aria-label="{group.kind.name} filter">
                        <button
                            class="single-option"
                            class:active={!safeFilterTags.some(t => group.tags.includes(t))}
                            onclick={() => {
                                const current = safeFilterTags.filter(t => !group.tags.includes(t));
                                preferencesStore.setTags(current);
                            }}
                            role="radio"
                            aria-checked={!safeFilterTags.some(t => group.tags.includes(t))}
                        >
                            All
                        </button>
                        {#each group.tags as tag}
                            <button
                                class="single-option"
                                class:active={safeFilterTags.includes(tag)}
                                onclick={() => {
                                    const current = safeFilterTags.filter(t => !group.tags.includes(t));
                                    if (!safeFilterTags.includes(tag)) {
                                        current.push(tag);
                                    }
                                    preferencesStore.setTags(current);
                                }}
                                role="radio"
                                aria-checked={safeFilterTags.includes(tag)}
                            >
                                #{tag}
                            </button>
                        {/each}
                    </div>
                {:else}
                    <div class="tag-grid" role="group" aria-label="{group.kind?.name ?? 'Other'} tag filters">
                        {#each group.tags as tag}
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
                {/if}
            </fieldset>
        {/each}

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

    .single-options {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .single-option {
        background: var(--color-iron-100);
        border: 1px solid var(--color-border);
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 13px;
        cursor: pointer;
        color: var(--color-text-secondary);
        transition: all 0.15s;
    }

    .single-option:hover {
        background: var(--color-iron-200);
    }

    .single-option.active {
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