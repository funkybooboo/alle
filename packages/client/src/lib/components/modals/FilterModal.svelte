<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { preferencesStore, tagStore } from '$lib/stores';
    import { onMount } from 'svelte';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    let tags = $derived(tagStore?.tags ?? []);
    let activeTags = $derived(preferencesStore?.activeFilters.tags ?? []);
    let showCompleted = $derived(preferencesStore?.activeFilters.showCompleted ?? true);

    let tagInput = $state('');
    let showSuggestions = $state(false);

    let suggestions = $derived.by(() => {
        if (!tagInput.trim()) return [];
        const lower = tagInput.trim().toLowerCase();
        return tags.filter(t => !activeTags.includes(t) && t.toLowerCase().includes(lower));
    });

    function addTag(tag: string) {
        const trimmed = tag.trim().toLowerCase();
        if (!trimmed || activeTags.includes(trimmed)) return;
        preferencesStore.setTags([...activeTags, trimmed]);
        tagInput = '';
        showSuggestions = false;
    }

    function removeTag(tag: string) {
        preferencesStore.setTags(activeTags.filter(t => t !== tag));
    }

    function handleInputKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (suggestions.length === 1) {
                addTag(suggestions[0]);
            } else if (tagInput.trim()) {
                addTag(tagInput.trim());
            }
        } else if (e.key === 'Escape') {
            showSuggestions = false;
        }
    }

    onMount(() => {
        tagStore.fetchAll();
    });
</script>

<Modal title="Filter" onclose={onclose}>
    <div class="filter">
        <fieldset class="section" aria-labelledby="filter-tags-heading">
            <legend class="section-heading" id="filter-tags-heading">Tags</legend>

            {#if activeTags.length > 0}
                <div class="active-tags">
                    {#each activeTags as tag}
                        <button class="tag-pill" onclick={() => removeTag(tag)}>
                            #{tag}
                            <span class="tag-remove">&times;</span>
                        </button>
                    {/each}
                </div>
            {/if}

            <div class="tag-input-row">
                <input
                    type="text"
                    class="tag-input"
                    placeholder="Add tag..."
                    bind:value={tagInput}
                    onkeydown={handleInputKeydown}
                    onfocus={() => showSuggestions = true}
                    onblur={() => setTimeout(() => showSuggestions = false, 150)}
                    id="filter-tag-input"
                />
                <button class="add-btn" onclick={() => addTag(tagInput)} disabled={!tagInput.trim()}>
                    +
                </button>
            </div>

            {#if showSuggestions && suggestions.length > 0}
                <ul class="suggestions" role="listbox">
                    {#each suggestions as tag}
                        <li>
                            <button class="suggestion-item" role="option" onclick={() => addTag(tag)}>
                                #{tag}
                            </button>
                        </li>
                    {/each}
                </ul>
            {/if}

            {#if tags.length > 0}
                <div class="available-tags">
                    {#each tags as tag}
                        {#if !activeTags.includes(tag)}
                            <button class="tag-option" onclick={() => addTag(tag)}>
                                #{tag}
                            </button>
                        {/if}
                    {/each}
                </div>
            {/if}
        </fieldset>

        <fieldset class="section" aria-labelledby="filter-status-heading">
            <legend class="section-heading" id="filter-status-heading">Status</legend>
            <label class="checkbox-label">
                <input
                    type="checkbox"
                    checked={showCompleted}
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

    .active-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;
    }

    .tag-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--color-accent-light);
        border: 1px solid var(--color-accent);
        border-radius: 14px;
        padding: 4px 10px;
        font-size: 12px;
        cursor: pointer;
        color: var(--color-accent);
        transition: all 0.15s;
    }

    .tag-pill:hover {
        opacity: 0.8;
    }

    .tag-remove {
        font-size: 14px;
        line-height: 1;
        margin-left: 2px;
    }

    .tag-input-row {
        display: flex;
        gap: 6px;
        align-items: center;
    }

    .tag-input {
        flex: 1;
        font-size: 13px;
        padding: 6px 10px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        background: var(--color-surface);
        color: var(--color-text);
        outline: none;
        transition: border-color 0.15s;
    }

    .tag-input:focus {
        border-color: var(--color-accent);
    }

    .tag-input::placeholder {
        color: var(--color-text-muted);
    }

    .add-btn {
        background: var(--color-accent);
        color: white;
        border: none;
        border-radius: 6px;
        width: 32px;
        height: 32px;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.15s;
    }

    .add-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .add-btn:not(:disabled):hover {
        opacity: 0.9;
    }

    .suggestions {
        list-style: none;
        margin: 4px 0 0;
        padding: 0;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        background: var(--color-surface);
        max-height: 150px;
        overflow-y: auto;
    }

    .suggestion-item {
        display: block;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
        color: var(--color-text-secondary);
        transition: background-color 0.1s;
    }

    .suggestion-item:hover {
        background: var(--color-surface-hover);
    }

    .available-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
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
</style>