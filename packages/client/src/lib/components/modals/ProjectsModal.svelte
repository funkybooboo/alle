<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { projectStore, taskStore } from '$lib/stores';
    import { Icon } from 'svelte-icons-pack';
    import { LuPlus, LuPencil, LuTrash2, LuArrowLeft, LuX } from 'svelte-icons-pack/lu';
    import { onMount } from 'svelte';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    onMount(() => {
        projectStore.fetchAll();
    });

    let activeProjects = $derived(projectStore.projects.filter(p => p.isActive));
    let inactiveProjects = $derived(projectStore.projects.filter(p => !p.isActive));

    let showNewForm = $state(false);
    let newProjectName = $state('');
    let newProjectDesc = $state('');
    let creating = $state(false);

    let editingProjectId = $state<string | null>(null);
    let editName = $state('');
    let editDesc = $state('');

    let selectedProjectId = $state<string | null>(null);
    let selectedProject = $derived(projectStore.projects.find(p => p.id === selectedProjectId));
    let projectTasks = $derived(
        selectedProjectId && selectedProject
            ? taskStore.tasks.filter(t => t.tags.includes(selectedProject!.tag))
            : [],
    );

    function getTaskCount(tag: string): number {
        return taskStore.tasks.filter(t => t.tags.includes(tag)).length;
    }

    function handleNewKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && newProjectName.trim()) {
            createProject();
        } else if (e.key === 'Escape') {
            cancelNew();
        }
    }

    async function createProject() {
        if (!newProjectName.trim()) return;
        creating = true;
        const result = await projectStore.create({
            name: newProjectName.trim(),
            description: newProjectDesc.trim() || null,
        });
        creating = false;
        if (result) {
            newProjectName = '';
            newProjectDesc = '';
            showNewForm = false;
        }
    }

    function cancelNew() {
        showNewForm = false;
        newProjectName = '';
        newProjectDesc = '';
    }

    function startEdit(projectId: string, name: string, description: string | null) {
        editingProjectId = projectId;
        editName = name;
        editDesc = description ?? '';
    }

    function cancelEdit() {
        editingProjectId = null;
        editName = '';
        editDesc = '';
    }

    function handleEditKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && editName.trim()) {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    }

    async function saveEdit() {
        if (!editingProjectId || !editName.trim()) return;
        await projectStore.update(editingProjectId, {
            name: editName.trim(),
            description: editDesc.trim() || null,
        });
        editingProjectId = null;
    }

    async function deleteProject(id: string) {
        await projectStore.remove(id);
        if (selectedProjectId === id) {
            selectedProjectId = null;
        }
    }

    function selectProject(id: string) {
        selectedProjectId = id;
    }

    function backToList() {
        selectedProjectId = null;
    }

    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<Modal title="Projects" onclose={onclose}>
    {#if selectedProject}
        <div class="detail-view">
            <button class="back-btn" onclick={backToList}>
                <Icon src={LuArrowLeft} />
                <span>Back to list</span>
            </button>

            <div class="detail-header">
                <h3 class="detail-name">{selectedProject.name}</h3>
                <div class="detail-actions">
                    {#if editingProjectId !== selectedProject.id}
                        <button class="icon-btn" onclick={() => startEdit(selectedProject!.id, selectedProject!.name, selectedProject!.description)} aria-label="Edit project">
                            <Icon src={LuPencil} />
                        </button>
                    {/if}
                    <button class="icon-btn danger" onclick={() => deleteProject(selectedProject!.id)} aria-label="Delete project">
                        <Icon src={LuTrash2} />
                    </button>
                </div>
            </div>

            {#if editingProjectId === selectedProject.id}
                <div class="inline-form">
                    <input type="text" bind:value={editName} placeholder="Project name" onkeydown={handleEditKeydown} />
                    <input type="text" bind:value={editDesc} placeholder="Description (optional)" onkeydown={handleEditKeydown} />
                    <div class="form-actions">
                        <button class="btn btn-primary" onclick={saveEdit}>Save</button>
                        <button class="btn btn-secondary" onclick={cancelEdit}>Cancel</button>
                    </div>
                </div>
            {:else}
                {#if selectedProject.description}
                    <p class="detail-desc">{selectedProject.description}</p>
                {/if}
                <div class="detail-meta">
                    {#if selectedProject.startDate}
                        <span>Start: {selectedProject.startDate}</span>
                    {/if}
                    {#if selectedProject.dueDate}
                        <span>Due: {selectedProject.dueDate}</span>
                    {/if}
                    <span>Status: {selectedProject.isActive ? 'Active' : 'Inactive'}</span>
                </div>
            {/if}

            <section class="detail-tasks">
                <h4>Tasks ({projectTasks.length})</h4>
                {#if projectTasks.length > 0}
                    <ul class="task-list">
                        {#each projectTasks as task}
                            <li class="task-item" class:completed={task.completed}>
                                <span class="task-text">{task.text}</span>
                                {#if task.date}
                                    <span class="task-date">{task.date}</span>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p class="empty-small">No tasks assigned to this project.</p>
                {/if}
            </section>
        </div>
    {:else}
        <div class="projects">
            <div class="list-header">
                <h3>Projects</h3>
                <button class="icon-btn" onclick={() => (showNewForm = true)} aria-label="New project">
                    <Icon src={LuPlus} />
                </button>
            </div>

            {#if showNewForm}
                <div class="inline-form">
                    <input type="text" bind:value={newProjectName} placeholder="Project name" onkeydown={handleNewKeydown} />
                    <input type="text" bind:value={newProjectDesc} placeholder="Description (optional)" onkeydown={handleNewKeydown} />
                    <div class="form-actions">
                        <button class="btn btn-primary" onclick={createProject} disabled={!newProjectName.trim() || creating}>
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                        <button class="btn btn-secondary" onclick={cancelNew}>Cancel</button>
                    </div>
                </div>
            {/if}

            {#if activeProjects.length > 0}
                <section class="section" aria-label="Active projects">
                    <h4 id="projects-active-heading">Active</h4>
                    {#each activeProjects as project (project.id)}
                        {#if editingProjectId === project.id}
                            <div class="project-card editing">
                                <input type="text" bind:value={editName} placeholder="Project name" onkeydown={handleEditKeydown} />
                                <input type="text" bind:value={editDesc} placeholder="Description (optional)" onkeydown={handleEditKeydown} />
                                <div class="form-actions">
                                    <button class="btn btn-primary" onclick={saveEdit}>Save</button>
                                    <button class="btn btn-secondary" onclick={cancelEdit}>Cancel</button>
                                </div>
                            </div>
                        {:else}
                            <div class="project-card" onclick={() => selectProject(project.id)} role="button" tabindex="0" aria-label="{project.name}, active">
                                <div class="card-top">
                                    <div class="project-name">{project.name}</div>
                                    <div class="card-actions">
                                        <button class="icon-btn small" onclick={(e) => { e.stopPropagation(); startEdit(project.id, project.name, project.description); }} aria-label="Edit project">
                                            <Icon src={LuPencil} />
                                        </button>
<button class="icon-btn small danger" onclick={(e) => { e.stopPropagation(); deleteProject(project.id); }} aria-label="Delete project">
                                            <Icon src={LuTrash2} />
                                        </button>
                                    </div>
                                </div>
                                {#if project.description}
                                    <div class="project-desc">{project.description}</div>
                                {/if}
                                <div class="project-meta">
                                    {#if project.startDate}
                                        <span>Start: {project.startDate}</span>
                                    {/if}
                                    {#if project.dueDate}
                                        <span>Due: {project.dueDate}</span>
                                    {/if}
<span class="task-count">{getTaskCount(project.tag)} task{getTaskCount(project.tag) !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        {/if}
                    {/each}
                </section>
            {/if}

            {#if inactiveProjects.length > 0}
                <section class="section" aria-label="Inactive projects">
                    <h4 id="projects-inactive-heading">Inactive</h4>
                    {#each inactiveProjects as project (project.id)}
                        <div class="project-card inactive" onclick={() => selectProject(project.id)} role="button" tabindex="0" aria-label="{project.name}, inactive">
                            <div class="card-top">
                                <div class="project-name">{project.name}</div>
                                <div class="card-actions">
                                    <button class="icon-btn small danger" onclick={(e) => { e.stopPropagation(); deleteProject(project.id); }} aria-label="Delete project">
                                        <Icon src={LuTrash2} />
                                    </button>
                                </div>
                            </div>
                            {#if project.description}
                                <div class="project-desc">{project.description}</div>
                            {/if}
                            <div class="project-meta">
                                <span class="task-count">{getTaskCount(project.tag)} task{getTaskCount(project.tag) !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    {/each}
                </section>
            {/if}

            {#if projectStore.projects.length === 0 && !showNewForm}
                <p class="empty">No projects yet. Create one to organize your tasks.</p>
            {/if}
        </div>
    {/if}
</Modal>

<style>
    .projects, .detail-view {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .list-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .list-header h3 {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
    }

    .section h4 {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 8px;
    }

    .project-card {
        padding: 12px;
        background: var(--color-surface-dim);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: border-color 0.15s ease;
    }

    .project-card:hover {
        border-color: var(--color-accent);
    }

    .project-card.inactive {
        opacity: 0.6;
    }

    .project-card.editing {
        cursor: default;
    }

    .project-card.editing:hover {
        border-color: var(--color-border);
    }

    .card-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
    }

    .project-name {
        font-weight: 600;
        font-size: 14px;
    }

    .card-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
    }

    .project-desc {
        font-size: 13px;
        color: var(--color-text-secondary);
        margin-top: 4px;
    }

    .project-meta {
        font-size: 12px;
        color: var(--color-text-muted);
        margin-top: 6px;
        display: flex;
        gap: 12px;
    }

    .task-count {
        color: var(--color-text-secondary);
    }

    .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        border-radius: 6px;
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;
    }

    .icon-btn:hover {
        background: var(--color-iron-200);
    }

    .icon-btn.small {
        width: 24px;
        height: 24px;
    }

    .icon-btn.danger:hover {
        color: var(--color-danger);
        background: var(--color-danger-light);
    }

    .inline-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: var(--color-surface-dim);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        margin-bottom: 4px;
    }

    .inline-form input {
        padding: 8px 10px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        background: var(--color-surface);
        color: var(--color-text);
        font-size: 13px;
        outline: none;
    }

    .inline-form input:focus {
        border-color: var(--color-accent);
    }

    .form-actions {
        display: flex;
        gap: 8px;
    }

    .btn {
        padding: 6px 14px;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s ease;
    }

    .btn-primary {
        background: var(--color-accent);
        color: white;
    }

    .btn-primary:hover {
        opacity: 0.9;
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: var(--color-iron-200);
        color: var(--color-text-secondary);
    }

    .btn-secondary:hover {
        background: var(--color-iron-300);
    }

    .back-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        color: var(--color-text-secondary);
        font-size: 13px;
        cursor: pointer;
        padding: 4px 0;
    }

    .back-btn:hover {
        color: var(--color-text);
    }

    .detail-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
    }

    .detail-actions {
        display: flex;
        gap: 4px;
    }

    .detail-name {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
        color: var(--color-text);
    }

    .detail-desc {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin: 0;
    }

    .detail-meta {
        font-size: 13px;
        color: var(--color-text-muted);
        display: flex;
        gap: 16px;
    }

    .detail-tasks {
        margin-top: 4px;
    }

    .detail-tasks h4 {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 8px;
    }

    .task-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .task-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        border-bottom: 1px solid var(--color-border);
        font-size: 13px;
    }

    .task-item.completed .task-text {
        text-decoration: line-through;
        color: var(--color-text-muted);
    }

    .task-date {
        font-size: 11px;
        color: var(--color-text-muted);
    }

    .empty {
        color: var(--color-text-muted);
        text-align: center;
        padding: 20px 0;
    }

    .empty-small {
        color: var(--color-text-muted);
        font-size: 13px;
    }

    .icon-btn :global(svg) {
        width: 16px;
        height: 16px;
    }

    .icon-btn.small :global(svg) {
        width: 14px;
        height: 14px;
    }

    .back-btn :global(svg) {
        width: 16px;
        height: 16px;
    }
</style>