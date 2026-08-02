<script lang="ts">
    import { preferencesStore, someDayGroupStore, taskStore } from '$lib/stores';
    import { applyFilters } from '$lib/filters';
    import TaskRow from './TaskRow.svelte';
    import InlineAddTask from './InlineAddTask.svelte';
    import SectionHeader from './SectionHeader.svelte';
    import { Icon } from 'svelte-icons-pack';
    import { LuPencil, LuTrash2, LuCheck } from 'svelte-icons-pack/lu';
    import type { SomeDayGroup } from '@alle/shared';

    let showAddGroupForm = $state(false);
    let newGroupName = $state('');
    let newGroupInput: HTMLInputElement | undefined = $state();
    let editingGroupId = $state<string | null>(null);
    let editGroupName = $state('');
    let editGroupInput: HTMLInputElement | undefined = $state();

    let isCollapsed = $derived(preferencesStore.someDayPanelWidth === 0);

    let filteredSomedayTasks = $derived(applyFilters(taskStore.somedayTasks, preferencesStore.activeFilters));

    // Tasks with date=null and no someDayGroupId — rendered in an Ungrouped
    // section below the named groups so they're never invisible.
    let ungroupedTasks = $derived(filteredSomedayTasks.filter(t => t.someDayGroupId === null));

    let groups = $derived(someDayGroupStore.sortedGroups);

    let newlyCreatedIds = $state<Set<string>>(new Set());

    $effect(() => {
        if (showAddGroupForm && newGroupInput) newGroupInput.focus();
    });

    $effect(() => {
        if (editingGroupId && editGroupInput) editGroupInput.focus();
    });

    function groupTasks(group: SomeDayGroup) {
        return filteredSomedayTasks.filter(t => t.someDayGroupId === group.id);
    }

    function submitNewGroup() {
        const name = newGroupName.trim();
        if (!name) return;
        const tag = name.toLowerCase().replace(/\s+/g, '-');
        someDayGroupStore.create({ name, tag, position: groups.length });
        newGroupName = '';
        showAddGroupForm = false;
    }

    function cancelNewGroup() {
        newGroupName = '';
        showAddGroupForm = false;
    }

    function startRenameGroup(group: SomeDayGroup) {
        editingGroupId = group.id;
        editGroupName = group.name;
    }

    function commitRenameGroup() {
        if (!editingGroupId) return;
        const name = editGroupName.trim();
        if (name) {
            const tag = name.toLowerCase().replace(/\s+/g, '-');
            someDayGroupStore.update(editingGroupId, { name, tag });
        }
        editingGroupId = null;
        editGroupName = '';
    }

    function cancelRenameGroup() {
        editingGroupId = null;
        editGroupName = '';
    }

    function handleRenameKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitRenameGroup();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelRenameGroup();
        }
    }

    function handleNewGroupKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitNewGroup();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelNewGroup();
        }
    }

    async function handleDeleteGroup(id: string) {
        const group = groups.find(g => g.id === id);
        if (!group) return;
        const tasks = groupTasks(group);
        const taskCount = tasks.length;
        const msg = taskCount > 0
            ? `Delete "${group.name}" and its ${taskCount} task${taskCount !== 1 ? 's' : ''}? This cannot be undone.`
            : `Delete "${group.name}"? This cannot be undone.`;
        if (!window.confirm(msg)) return;

        for (const task of [...tasks]) {
            await taskStore.remove(task.id);
        }
        await someDayGroupStore.remove(id);
    }

    function handleTaskCreated(id: string) {
        newlyCreatedIds.add(id);
        setTimeout(() => newlyCreatedIds.delete(id), 600);
    }

    const DEFAULT_PANEL_WIDTH = 280;

    function togglePanel() {
        if (isCollapsed) {
            preferencesStore.setPanelWidth(preferencesStore.someDayPanelLastOpenWidth || DEFAULT_PANEL_WIDTH);
        } else {
            preferencesStore.setPanelWidth(0);
        }
    }
</script>

{#if isCollapsed}
    <div class="collapsed-strip" role="separator" aria-label="Expand Someday panel">
        <button class="expand-btn" onclick={togglePanel} aria-label="Open Someday panel" title="Open Someday panel">
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="8,2 2,9 8,16" />
            </svg>
        </button>
    </div>
{:else}
    <aside class="someday-panel" style="width: {preferencesStore.someDayPanelWidth}px" aria-label="Someday panel">
        <div class="panel-content">
            <div class="panel-header">
                <h2 class="panel-title">Someday</h2>
                <div class="panel-actions">
                    {#if showAddGroupForm}
                        <div class="new-group-form">
                            <input
                                bind:this={newGroupInput}
                                bind:value={newGroupName}
                                class="new-group-input"
                                placeholder="Group name..."
                                onkeydown={handleNewGroupKeydown}
                                onblur={() => { if (!newGroupName.trim()) cancelNewGroup(); }}
                            />
                            <button class="icon-btn" onclick={submitNewGroup} aria-label="Create group" title="Create group">
                                <Icon src={LuCheck} size={14} />
                            </button>
                        </div>
                    {:else}
                        <button class="add-group-btn" onclick={() => (showAddGroupForm = true)} aria-label="Add group" title="Add group">
                            + add group
                        </button>
                    {/if}
                </div>
            </div>

            <div class="groups-container">
                {#each groups as group (group.id)}
                    {@const tasks = groupTasks(group)}
                    {@const taskCount = tasks.length}
                    {@const completedCount = tasks.filter(t => t.completed).length}
                    {@const sectionId = `someday-${group.id}`}

                    <div class="someday-group" role="listitem">
                        {#if editingGroupId === group.id}
                            <div class="group-rename-row">
                                <input
                                    bind:this={editGroupInput}
                                    bind:value={editGroupName}
                                    class="rename-input"
                                    onkeydown={handleRenameKeydown}
                                    onblur={commitRenameGroup}
                                />
                                <button class="icon-btn" onclick={commitRenameGroup} aria-label="Save rename" title="Save">
                                    <Icon src={LuCheck} size={13} />
                                </button>
                                <button class="icon-btn" onclick={cancelRenameGroup} aria-label="Cancel rename" title="Cancel">
                                    ✕
                                </button>
                            </div>
                        {:else}
                            <div class="group-header-row">
                                <SectionHeader
                                    {sectionId}
                                    title={`#${group.tag} ${group.name}`}
                                    {taskCount}
                                    {completedCount}
                                />
                                <div class="group-actions">
                                    <button class="icon-btn" onclick={() => startRenameGroup(group)} aria-label="Rename group" title="Rename group">
                                        <Icon src={LuPencil} size={13} />
                                    </button>
                                    <button class="icon-btn icon-btn-danger" onclick={() => handleDeleteGroup(group.id)} aria-label="Delete group" title="Delete group">
                                        <Icon src={LuTrash2} size={13} />
                                    </button>
                                </div>
                            </div>
                        {/if}
                        <div class="group-tasks" role="list">
                            {#each tasks as task (task.id)}
                                <TaskRow {task} dateStr="" isNew={newlyCreatedIds.has(task.id)} />
                            {/each}
                        </div>
                        <InlineAddTask date="" someDayGroupId={group.id} oncreated={handleTaskCreated} />
                    </div>
                {:else}
                    <p class="empty-state">No groups yet. Create one above.</p>
                {/each}

                {#if ungroupedTasks.length > 0}
                    <div class="someday-group">
                        <div class="group-header-row">
                            <SectionHeader
                                sectionId="someday-ungrouped"
                                title="Ungrouped"
                                taskCount={ungroupedTasks.length}
                                completedCount={ungroupedTasks.filter(t => t.completed).length}
                            />
                        </div>
                        <div class="group-tasks" role="list">
                            {#each ungroupedTasks as task (task.id)}
                                <TaskRow {task} dateStr="" isNew={newlyCreatedIds.has(task.id)} />
                            {/each}
                        </div>
                        <InlineAddTask date="" oncreated={handleTaskCreated} />
                    </div>
                {/if}
            </div>
        </div>
    </aside>
{/if}

<style>
    .collapsed-strip {
        width: 24px;
        min-width: 24px;
        background: var(--color-surface);
        border-left: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: col-resize;
        transition: background-color 0.15s;
    }

    .collapsed-strip:hover {
        background: var(--color-surface-hover);
    }

    .expand-btn {
        background: none;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: 4px 2px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s, background-color 0.15s;
    }

    .expand-btn:hover {
        color: var(--color-accent);
        background: var(--color-surface-hover);
    }

    .someday-panel {
        position: relative;
        min-width: 200px;
        max-width: 600px;
        background: var(--color-surface);
        display: flex;
        flex-direction: row;
        transition: width 0.2s ease;
    }

    .panel-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-left: 1px solid var(--color-border);
    }

    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 12px 8px;
        border-bottom: 1px solid var(--color-border);
    }

    .panel-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
    }

    .panel-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .add-group-btn {
        background: none;
        border: none;
        font-size: 12px;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        transition: color 0.15s, background-color 0.15s;
    }

    .add-group-btn:hover {
        color: var(--color-text);
        background: var(--color-surface-hover);
    }

    .new-group-form {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .new-group-input {
        font-size: 12px;
        padding: 2px 6px;
        border: 1px solid var(--color-accent);
        border-radius: 4px;
        outline: none;
        background: var(--color-surface);
        color: var(--color-text);
        width: 120px;
    }

    .new-group-input::placeholder {
        color: var(--color-text-muted);
    }

    .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-muted);
        padding: 2px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s, background-color 0.15s;
    }

    .icon-btn:hover {
        color: var(--color-text);
        background: var(--color-surface-hover);
    }

    .icon-btn-danger:hover {
        color: var(--color-danger);
    }

    .group-header-row {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .group-header-row :global(.section-header) {
        flex: 1;
        min-width: 0;
    }

    .group-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.15s;
    }

    .someday-group:hover .group-actions {
        opacity: 1;
    }

    .group-rename-row {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 0;
        border-bottom: 1px solid var(--color-border);
    }

    .rename-input {
        font-size: 13px;
        font-weight: 500;
        padding: 1px 4px;
        border: 1px solid var(--color-accent);
        border-radius: 4px;
        outline: none;
        background: var(--color-surface);
        color: var(--color-text);
        flex: 1;
    }

    .groups-container {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
    }

    .someday-group {
        margin-bottom: 16px;
        padding: 0 12px;
    }

    .group-tasks {
        display: flex;
        flex-direction: column;
    }

    .empty-state {
        font-size: 13px;
        color: var(--color-text-muted);
        text-align: center;
        padding: 20px 12px;
    }
</style>