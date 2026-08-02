<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { recurringTaskStore, taskStore } from '$lib/stores';
    import { Icon } from 'svelte-icons-pack';
    import { LuPlus, LuPencil, LuTrash2 } from 'svelte-icons-pack/lu';
    import { WEEKDAY_ABBREVIATIONS, MONTH_NAMES as MONTH_ABBREVIATIONS } from '@alle/shared';
    import { container } from '$lib/container';
    import { onMount } from 'svelte';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    onMount(() => {
        recurringTaskStore.fetchAll();
    });

    const DAY_NAMES = WEEKDAY_ABBREVIATIONS;
    const MONTH_NAMES = MONTH_ABBREVIATIONS;

    function formatFrequency(habit: { frequency: string; interval: number; dayOfWeek: number | null; dayOfMonth: number | null }): string {
        const freq = habit.frequency;
        const interval = habit.interval || 1;

        if (freq === 'daily') {
            return interval === 1 ? 'Daily' : `Every ${interval} days`;
        }
        if (freq === 'weekly') {
            if (habit.dayOfWeek !== null && habit.dayOfWeek !== undefined) {
                return `Weekly on ${DAY_NAMES[habit.dayOfWeek]}`;
            }
            return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
        }
        if (freq === 'monthly') {
            if (habit.dayOfMonth !== null && habit.dayOfMonth !== undefined) {
                return `Monthly on day ${habit.dayOfMonth}`;
            }
            return interval === 1 ? 'Monthly' : `Every ${interval} months`;
        }
        if (freq === 'yearly') {
            return interval === 1 ? 'Yearly' : `Every ${interval} years`;
        }
        return freq;
    }

    function getInstanceCount(habitId: string): number {
        return taskStore.tasks.filter(t => t.recurringTaskId === habitId).length;
    }

    let showNewForm = $state(false);
    let newHabitName = $state('');
    let newHabitFrequency = $state<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    let newHabitStartDate = $state(container.dateProvider.today());
    let creating = $state(false);

    function handleNewKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && newHabitName.trim()) {
            createHabit();
        } else if (e.key === 'Escape') {
            cancelNew();
        }
    }

    async function createHabit() {
        if (!newHabitName.trim()) return;
        creating = true;
        const result = await recurringTaskStore.create({
            text: newHabitName.trim(),
            frequency: newHabitFrequency,
            startDate: newHabitStartDate,
        });
        creating = false;
        if (result) {
            newHabitName = '';
            newHabitFrequency = 'daily';
            newHabitStartDate = container.dateProvider.today();
            showNewForm = false;
        }
    }

    function cancelNew() {
        showNewForm = false;
        newHabitName = '';
        newHabitFrequency = 'daily';
        newHabitStartDate = container.dateProvider.today();
    }

    let editingHabitId = $state<string | null>(null);
    let editText = $state('');
    let editFrequency = $state<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

    function startEdit(habitId: string, text: string, frequency: string) {
        editingHabitId = habitId;
        editText = text;
        editFrequency = frequency as 'daily' | 'weekly' | 'monthly' | 'yearly';
    }

    function cancelEdit() {
        editingHabitId = null;
        editText = '';
    }

    function handleEditKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && editText.trim()) {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    }

    async function saveEdit() {
        if (!editingHabitId || !editText.trim()) return;
        await recurringTaskStore.update(editingHabitId, {
            text: editText.trim(),
            frequency: editFrequency,
        });
        editingHabitId = null;
    }

    async function deleteHabit(id: string) {
        await recurringTaskStore.remove(id);
    }
</script>

<Modal title="Habits" onclose={onclose}>
    <div class="habits">
        <div class="list-header">
            <h3>Recurring Tasks</h3>
            <button class="icon-btn" onclick={() => (showNewForm = true)} aria-label="New habit">
                <Icon src={LuPlus} />
            </button>
        </div>

        {#if showNewForm}
            <div class="inline-form">
                <input type="text" bind:value={newHabitName} placeholder="Habit name" onkeydown={handleNewKeydown} />
                <div class="form-row">
                    <label for="new-frequency">Frequency</label>
                    <select id="new-frequency" bind:value={newHabitFrequency}>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
                <div class="form-row">
                    <label for="new-start">Start date</label>
                    <input type="date" id="new-start" bind:value={newHabitStartDate} />
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick={createHabit} disabled={!newHabitName.trim() || creating}>
                        {creating ? 'Creating...' : 'Create'}
                    </button>
                    <button class="btn btn-secondary" onclick={cancelNew}>Cancel</button>
                </div>
            </div>
        {/if}

        {#if recurringTaskStore.tasks.length > 0}
            {#each recurringTaskStore.tasks as habit (habit.id)}
                {#if editingHabitId === habit.id}
                    <div class="habit-card editing">
                        <input type="text" bind:value={editText} placeholder="Habit name" onkeydown={handleEditKeydown} />
                        <div class="form-row">
                            <label for="edit-frequency-{habit.id}">Frequency</label>
                            <select id="edit-frequency-{habit.id}" bind:value={editFrequency}>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button class="btn btn-primary" onclick={saveEdit}>Save</button>
                            <button class="btn btn-secondary" onclick={cancelEdit}>Cancel</button>
                        </div>
                    </div>
                {:else}
                    <div class="habit-card" aria-label="{habit.text}, {habit.frequency}">
                        <div class="card-top">
                            <div class="habit-name">
                                {habit.text}
                                <span class="habit-freq">{formatFrequency(habit)}</span>
                            </div>
                            <div class="card-actions">
                                <button class="icon-btn small" onclick={() => startEdit(habit.id, habit.text, habit.frequency)} aria-label="Edit habit">
                                    <Icon src={LuPencil} />
                                </button>
                                <button class="icon-btn small danger" onclick={() => deleteHabit(habit.id)} aria-label="Delete habit">
                                    <Icon src={LuTrash2} />
                                </button>
                            </div>
                        </div>
                        {#if habit.tags.length > 0}
                            <div class="habit-tags">
                                {#each habit.tags as tag}
                                    <span class="tag-chip">#{tag}</span>
                                {/each}
                            </div>
                        {/if}
                        <div class="habit-meta">
                            <span>Starts: {habit.startDate}</span>
                            {#if habit.endDate}
                                <span>Ends: {habit.endDate}</span>
                            {/if}
                        </div>
                        <div class="habit-streak">
                            {#if getInstanceCount(habit.id) > 0}
                                <span class="streak-badge">{getInstanceCount(habit.id)} instance{getInstanceCount(habit.id) !== 1 ? 's' : ''}</span>
                            {:else}
                                <span class="streak-badge empty">No instances yet</span>
                            {/if}
                        </div>
                    </div>
                {/if}
            {/each}
        {:else if !showNewForm}
            <p class="empty">No recurring tasks yet. Create one above to start building habits.</p>
        {/if}
    </div>
</Modal>

<style>
    .habits {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .list-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
    }

    .list-header h3 {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
    }

    .habit-card {
        padding: 12px;
        background: var(--color-surface-dim);
        border: 1px solid var(--color-border);
        border-radius: 8px;
    }

    .habit-card.editing {
        cursor: default;
    }

    .card-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
    }

    .card-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
    }

    .habit-name {
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
    }

    .habit-freq {
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 10px;
        background: var(--color-accent-light);
        color: var(--color-accent);
        font-weight: 500;
        white-space: nowrap;
    }

    .habit-tags {
        display: flex;
        gap: 4px;
        margin-top: 6px;
    }

    .tag-chip {
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 10px;
        background: var(--color-surface-hover);
        color: var(--color-text-secondary);
    }

    .habit-meta {
        font-size: 12px;
        color: var(--color-text-muted);
        margin-top: 6px;
        display: flex;
        gap: 12px;
    }

    .habit-streak {
        margin-top: 6px;
    }

    .streak-badge {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 10px;
        background: var(--color-success-light, #d4edda);
        color: var(--color-success, #155724);
        font-weight: 500;
    }

    .streak-badge.empty {
        background: var(--color-surface-hover);
        color: var(--color-text-muted);
    }

    .inline-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: var(--color-surface-dim);
        border: 1px solid var(--color-border);
        border-radius: 8px;
    }

    .inline-form input[type="text"] {
        padding: 8px 10px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        background: var(--color-surface);
        color: var(--color-text);
        font-size: 13px;
        outline: none;
    }

    .inline-form input[type="text"]:focus {
        border-color: var(--color-accent);
    }

    .form-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .form-row label {
        font-size: 13px;
        color: var(--color-text-secondary);
        min-width: 70px;
    }

    .form-row select,
    .form-row input[type="date"] {
        padding: 6px 10px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        background: var(--color-surface);
        color: var(--color-text);
        font-size: 13px;
        outline: none;
    }

    .form-row select:focus,
    .form-row input[type="date"]:focus {
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
        background: var(--color-border);
        color: var(--color-text-secondary);
    }

    .btn-secondary:hover {
        background: var(--color-text-muted);
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
        background: var(--color-border);
    }

    .icon-btn.small {
        width: 24px;
        height: 24px;
    }

    .icon-btn.danger:hover {
        color: var(--color-danger);
        background: var(--color-danger-light);
    }

    .icon-btn :global(svg) {
        width: 16px;
        height: 16px;
    }

    .icon-btn.small :global(svg) {
        width: 14px;
        height: 14px;
    }

    .empty {
        color: var(--color-text-muted);
        text-align: center;
        padding: 20px 0;
    }
</style>