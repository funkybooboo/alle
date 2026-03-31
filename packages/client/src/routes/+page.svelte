<script lang="ts">
    import { onMount } from 'svelte';
    import { API_ROUTES, type ApiResponse } from '@alle/shared';
    import { container } from '$lib/container';

    let message = 'Loading...';

    onMount(() => {
        container.httpClient
            .get<ApiResponse<{ status: string }>>(API_ROUTES.HEALTH)
            .then(data => {
                message = `Hello from Bun Server! Health: ${data.data.status}`;
            })
            .catch(() => {
                message = 'Hello from Client! (Server not running)';
            });
    });
</script>

<div
    style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif; flex-direction: column; gap: 1rem;"
>
    <h1>Alle - Task App</h1>
    <p>{message}</p>
</div>
