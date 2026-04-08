<script lang="ts">
    import { onMount } from 'svelte';
    import { API_ROUTES, type ApiResponse, type Task } from '@alle/shared';
    import { container } from '$lib/container';

    let status = 'Loading...';
    let tasks: Task[] = [];

    onMount(() => {
        container.httpClient
            .get<ApiResponse<{ status: string }>>(API_ROUTES.HEALTH)
            .then(data => {
                status = `Server: ${data.data.status}`;
            })
            .catch(() => {
                status = 'Server not running';
            });

        container.httpClient
            .get<ApiResponse<Task[]>>(API_ROUTES.TASKS)
            .then(data => {
                tasks = data.data;
            })
            .catch(() => {
                tasks = [];
            });
    });
</script>

<div
    style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif; flex-direction: column; gap: 1rem;"
>
    <h1>Alle - Task App</h1>
    <p>{status}</p>
    {#if tasks.length === 0}
        <p style="color: #888;">No tasks yet.</p>
    {:else}
        <ul style="list-style: none; padding: 0; margin: 0; min-width: 300px;">
            {#each tasks as task}
                <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                    <span style="margin-right: 0.5rem;">{task.completed ? '✓' : '○'}</span>
                    <span style={task.completed ? 'text-decoration: line-through; color: #888;' : ''}>{task.text}</span>
                    {#if task.date}
                        <span style="margin-left: 0.5rem; color: #888; font-size: 0.85em;">({task.date})</span>
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</div>
