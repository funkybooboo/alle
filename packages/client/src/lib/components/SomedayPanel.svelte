<script lang="ts">
    import { preferencesStore, someDayGroupStore, uiStore, taskStore } from '$lib/stores';
    import { applyFilters } from '$lib/filters';
    import TaskRow from './TaskRow.svelte';
    import InlineAddTask from './InlineAddTask.svelte';
    import SectionHeader from './SectionHeader.svelte';
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

    let localGroups = $state<SomeDayGroup[]>([]);
    let prevGroupsKey = $state('');

    $effect(() => {
        const sorted = someDayGroupStore.sortedGroups;
        const key = sorted.map(g => `${g.id}_${g.position}_${g.name}`).join('|');
        if (key !== prevGroupsKey) {
            prevGroupsKey = key;
            localGroups = [...sorted];
        }
    });

    $effect(() => {
        for (const group of localGroups) {
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
        someDayGroupStore.create({ name, tag, position: localGroups.length });
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
        const group = localGroups.find(g => g.id === id);
        if (!group) return;
        const taskCount = (groupLocalTasks[group.id] ?? []).length;
        const msg = taskCount > 0
            ? `Delete "${group.name}" and its ${taskCount} task${taskCount !== 1 ? 's' : ''}? This cannot be undone.`
            : `Delete "${group.name}"? This cannot be undone.`;
        if (!window.confirm(msg)) return;

        for (const task of [...(groupLocalTasks[group.id] ?? [])]) {
            await taskStore.remove(task.id);
        }
        await someDayGroupStore.remove(id);
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

    function handleGroupHeaderConsider(e: CustomEvent) {
        localGroups = e.detail.items;
    }

    function handleGroupHeaderFinalize(e: CustomEvent) {
        localGroups = e.detail.items;
        for (let i = 0; i < localGroups.length; i++) {
            const group = localGroups[i];
            if (group.position !== i) {
                someDayGroupStore.update(group.id, { position: i });
            }
        }
    }

    

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
                preferencesStore.setPanelWidth(preferencesStore.someDayPanelWidth);
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
            preferencesStore.setPanelWidth(preferencesStore.someDayPanelLastOpenWidth);
        } else {
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
                preferencesStore.setPanelWidth(Math.min(preferencesStore.someDayPanelLastOpenWidth, deltaX));
            }
        }

        function onMouseUp() {
            isDragging = false;
            if (preferencesStore.someDayPanelWidth >= COLLAPSED_THRESHOLD) {
                preferencesStore.setPanelWidth(preferencesStore.someDayPanelWidth);
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

            <div class="groups-container" use:dndzone={{ items: localGroups, type: "someday-group" }} onconsider={handleGroupHeaderConsider} onfinalize={handleGroupHeaderFinalize}>
                {#each localGroups as group (group.id)}
                    {@const groupTasks = groupLocalTasks[group.id] ?? filteredSomedayTasks.filter(t => t.someDayGroupId === group.id)}
                    {@const taskCount = groupTasks.length}
                    {@const completedCount = groupTasks.filter(t => t.completed).length}
                    {@const sectionId = `someday-${group.id}`}
                    {@const isGroupCollapsed = preferencesStore.isSectionCollapsed(sectionId)}

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
                        {#if !isGroupCollapsed}
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
        transition: width 0.2s ease;
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

    .drop-placeholder {
        min-height: 36px;
    }

    .task-drag-wrapper {
        cursor: default;
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