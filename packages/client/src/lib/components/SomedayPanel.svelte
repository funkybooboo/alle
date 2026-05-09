<script lang="ts">
    import { preferencesStore, someDayGroupStore, uiStore, taskStore } from '$lib/stores';
    import { applyFilters } from '$lib/filters';
    import TaskRow from './TaskRow.svelte';
    import InlineAddTask from './InlineAddTask.svelte';
    import { Icon } from 'svelte-icons-pack';
    import { LuPencil, LuTrash2, LuCheck } from 'svelte-icons-pack/lu';
    import { dndzone } from 'svelte-dnd-action';
    import type { SomeDayGroup, Task } from '@alle/shared';

    let showAddGroupForm = $state(false);
    let newGroupName = $state('');
    let newGroupInput: HTMLInputElement | undefined = $state();
    let editingGroupId = $state<string | null>(null);
    let editGroupName = $state('');
    let editGroupInput: HTMLInputElement | undefined = $state();

    let isDragging = $state(false);

    const MIN_PANEL_WIDTH = 200;
    const MAX_PANEL_WIDTH = 600;
    const COLLAPSED_THRESHOLD = 100;

    let isCollapsed = $derived(preferencesStore.someDayPanelWidth < COLLAPSED_THRESHOLD);

    let filteredSomedayTasks = $derived(applyFilters(taskStore.somedayTasks, preferencesStore.activeFilters));

    let groupLocalTasks = $state<Record<string, Task[]>>({});
    let groupTasksKeys = $state<Record<string, string>>({});

    $effect(() => {
        for (const group of someDayGroupStore.sortedGroups) {
            const tasks = filteredSomedayTasks.filter(t => t.someDayGroupId === group.id);
            const key = tasks.map(t => `${t.id}_${t.completed}_${t.updatedAt}_${t.text}`).join('|');
            if (key !== groupTasksKeys[group.id]) {
                groupTasksKeys[group.id] = key;
                groupLocalTasks[group.id] = [...tasks];
            }
        }
    });

    $effect(() => {
        if (showAddGroupForm && newGroupInput) newGroupInput.focus();
    });

    $effect(() => {
        if (editingGroupId && editGroupInput) editGroupInput.focus();
    });

    function submitNewGroup() {
        const name = newGroupName.trim();
        if (!name) return;
        const tag = name.toLowerCase().replace(/\s+/g, '-');
        someDayGroupStore.create({ name, tag, position: someDayGroupStore.groups.length });
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
        await someDayGroupStore.remove(id);
        for (const task of taskStore.tasks) {
            if (task.someDayGroupId === id) {
                taskStore.update(task.id, { someDayGroupId: null });
            }
        }
    }

    function handleGroupConsider(groupId: string, e: CustomEvent) {
        groupLocalTasks[groupId] = e.detail.items;
    }

    function handleGroupFinalize(groupId: string, e: CustomEvent) {
        const items: Task[] = e.detail.items;
        groupLocalTasks[groupId] = items;
        for (let i = 0; i < items.length; i++) {
            const task = items[i];
            const updates: Record<string, unknown> = {};
            if (task.position !== i) {
                updates.position = i;
            }
            if (task.someDayGroupId !== groupId) {
                updates.someDayGroupId = groupId;
            }
            if (task.date !== null) {
                updates.date = null;
            }
            if (Object.keys(updates).length > 0) {
                taskStore.update(task.id, updates);
            }
        }
    }

    let lastOpenWidth = $state(preferencesStore.someDayPanelWidth >= MIN_PANEL_WIDTH ? preferencesStore.someDayPanelWidth : 280);

    function startResize(e: MouseEvent) {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = preferencesStore.someDayPanelWidth;
        isDragging = true;

        function onMouseMove(e: MouseEvent) {
            const deltaX = startX - e.clientX;
            const newWidth = Math.max(0, Math.min(MAX_PANEL_WIDTH, startWidth + deltaX));
            preferencesStore.setPanelWidth(newWidth);
        }

        function onMouseUp() {
            isDragging = false;
            if (preferencesStore.someDayPanelWidth >= COLLAPSED_THRESHOLD) {
                lastOpenWidth = preferencesStore.someDayPanelWidth;
            } else if (preferencesStore.someDayPanelWidth > 0) {
                preferencesStore.setPanelWidth(0);
            }
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function handleDoubleClick() {
        if (isCollapsed) {
            preferencesStore.setPanelWidth(lastOpenWidth);
        } else {
            lastOpenWidth = preferencesStore.someDayPanelWidth;
            preferencesStore.setPanelWidth(0);
        }
    }

    function handleCollapsedDragStart(e: MouseEvent) {
        e.preventDefault();
        isDragging = true;
        const startX = e.clientX;

        function onMouseMove(e: MouseEvent) {
            const deltaX = e.clientX - startX;
            if (deltaX > 10) {
                preferencesStore.setPanelWidth(Math.min(lastOpenWidth, deltaX));
            }
        }

        function onMouseUp() {
            isDragging = false;
            if (preferencesStore.someDayPanelWidth >= COLLAPSED_THRESHOLD) {
                lastOpenWidth = preferencesStore.someDayPanelWidth;
            } else {
                preferencesStore.setPanelWidth(0);
            }
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
</script>

{#if isCollapsed}
    <div class="collapsed-strip" ondblclick={handleDoubleClick} onmousedown={handleCollapsedDragStart} role="separator" aria-label="Expand Someday panel — drag or double-click to open">
        <div class="collapsed-handle"></div>
    </div>
{:else}
    <aside class="someday-panel" style="width: {preferencesStore.someDayPanelWidth}px" aria-label="Someday panel">
        <div class="resize-handle" role="separator" aria-orientation="vertical" onmousedown={startResize} ondblclick={handleDoubleClick} aria-label="Resize panel — drag to resize, double-click to collapse"></div>
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
                {#each someDayGroupStore.sortedGroups as group (group.id)}
                    {@const groupTasks = groupLocalTasks[group.id] ?? filteredSomedayTasks.filter(t => t.someDayGroupId === group.id)}

                    <div class="someday-group" role="listitem">
                        <div class="group-header">
                            {#if editingGroupId === group.id}
                                <input
                                    bind:this={editGroupInput}
                                    bind:value={editGroupName}
                                    class="rename-input"
                                    onkeydown={handleRenameKeydown}
                                    onblur={commitRenameGroup}
                                />
                            {:else}
                                <span class="group-tag">#{group.tag}</span>
                                <span class="group-name">{group.name}</span>
                            {/if}
                            <span class="group-count">{groupTasks.length}</span>
                            {#if editingGroupId !== group.id}
                                <div class="group-actions">
                                    <button class="icon-btn" onclick={() => startRenameGroup(group)} aria-label="Rename group" title="Rename group">
                                        <Icon src={LuPencil} size={13} />
                                    </button>
                                    <button class="icon-btn icon-btn-danger" onclick={() => handleDeleteGroup(group.id)} aria-label="Delete group" title="Delete group">
                                        <Icon src={LuTrash2} size={13} />
                                    </button>
                                </div>
                            {/if}
                        </div>
                        <div class="group-tasks" role="list" use:dndzone={{ items: groupTasks, type: "task" }} onconsider={(e: CustomEvent) => handleGroupConsider(group.id, e)} onfinalize={(e: CustomEvent) => handleGroupFinalize(group.id, e)}>
                            {#if groupTasks.length === 0}
                                <div class="drop-placeholder" aria-hidden="true"></div>
                            {/if}
                            {#each groupTasks as task (task.id)}
                                <div class="task-drag-wrapper">
                                    <TaskRow {task} dateStr="" />
                                </div>
                            {/each}
                        </div>
                        {#if uiStore.addingTo === `someday-${group.id}`}
                            <InlineAddTask date="" someDayGroupId={group.id} oncancel={() => uiStore.startAdding(null)} />
                        {:else}
                            <button
                                class="add-task-btn"
                                onclick={() => uiStore.startAdding(`someday-${group.id}`)}
                            >
                                + add task
                            </button>
                        {/if}
                    </div>
                {:else}
                    <p class="empty-state">No groups yet. Create one above.</p>
                {/each}
            </div>
        </div>
    </aside>
{/if}

<style>
    .collapsed-strip {
        width: 8px;
        min-width: 8px;
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

    .collapsed-handle {
        width: 4px;
        height: 32px;
        border-radius: 2px;
        background: var(--color-border);
        transition: background-color 0.15s;
    }

    .collapsed-strip:hover .collapsed-handle {
        background: var(--color-accent);
    }

    .someday-panel {
        position: relative;
        min-width: 200px;
        max-width: 600px;
        background: var(--color-surface);
        display: flex;
        flex-direction: row;
    }

    .resize-handle {
        width: 4px;
        cursor: col-resize;
        background: transparent;
        flex-shrink: 0;
        transition: background-color 0.15s;
        position: relative;
        z-index: 5;
    }

    .resize-handle:hover {
        background: var(--color-accent);
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

    .group-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        margin-left: auto;
        opacity: 0;
        transition: opacity 0.15s;
    }

    .group-header:hover .group-actions {
        opacity: 1;
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

    .group-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        padding-bottom: 4px;
        border-bottom: 1px solid var(--color-border);
    }

    .group-tag {
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 10px;
        background: var(--color-iron-100);
        color: var(--color-text-secondary);
    }

    .group-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text);
    }

    .group-count {
        font-size: 11px;
        color: var(--color-text-muted);
    }

    .group-tasks {
        display: flex;
        flex-direction: column;
    }

    .drop-placeholder {
        min-height: 36px;
    }

    .task-drag-wrapper {
        cursor: default;
    }

    .empty-group {
        font-size: 12px;
        color: var(--color-text-muted);
        padding: 4px 0;
    }

    .add-task-btn {
        background: none;
        border: none;
        font-size: 12px;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: 4px 0;
        text-align: left;
        transition: color 0.15s;
    }

    .add-task-btn:hover {
        color: var(--color-text);
    }

    .empty-state {
        font-size: 13px;
        color: var(--color-text-muted);
        text-align: center;
        padding: 20px 12px;
    }
</style>