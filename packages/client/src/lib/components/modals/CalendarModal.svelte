<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { uiStore } from '$lib/stores';
    import { container } from '$lib/container';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    let selectedDate = $state('');

    function handleDateSelect() {
        if (!selectedDate) return;
        const el = document.getElementById(`day-${selectedDate}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        uiStore.closeModal();
    }

    function goToToday() {
        selectedDate = container.dateProvider.today();
        handleDateSelect();
    }

    const today = new Date();
    let viewYear = $state(today.getFullYear());
    let viewMonth = $state(today.getMonth());

    let monthName = $derived(new Date(viewYear, viewMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' }));
    let daysInMonth = $derived(new Date(viewYear, viewMonth + 1, 0).getDate());
    let firstDayOfWeek = $derived(new Date(viewYear, viewMonth, 1).getDay());
    let calendarDays = $derived(generateCalendarDays());

    function generateCalendarDays() {
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        return days;
    }

    function prevMonth() {
        viewMonth--;
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    }

    function nextMonth() {
        viewMonth++;
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    }

    function dateStr(day: number): string {
        return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
</script>

<Modal title="Calendar" onclose={onclose}>
    <div class="calendar">
        <button class="today-btn" onclick={goToToday}>Today</button>

        <div class="month-nav">
            <button onclick={prevMonth} aria-label="Previous month">&#8249;</button>
            <span class="month-name">{monthName}</span>
            <button onclick={nextMonth} aria-label="Next month">&#8250;</button>
        </div>

        <div class="weekday-headers">
            {#each ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as day}
                <span class="weekday">{day}</span>
            {/each}
        </div>

        <div class="days-grid">
            {#each calendarDays as day}
                {#if day === null}
                    <span class="day-cell empty"></span>
                {:else}
                    <button
                        class="day-cell"
                        class:selected={selectedDate === dateStr(day)}
                        class:today={dateStr(day) === container.dateProvider.today()}
                        onclick={() => { selectedDate = dateStr(day); handleDateSelect(); }}
                    >
                        {day}
                    </button>
                {/if}
            {/each}
        </div>
    </div>
</Modal>

<style>
    .calendar {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .today-btn {
        align-self: flex-start;
        background: var(--color-accent);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 13px;
        cursor: pointer;
    }

    .today-btn:hover {
        background: var(--color-accent-hover);
    }

    .month-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 15px;
        font-weight: 600;
    }

    .month-nav button {
        background: none;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        width: 28px;
        height: 28px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .month-nav button:hover {
        background: var(--color-surface-hover);
    }

    .weekday-headers {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
    }

    .weekday {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-text-secondary);
        padding: 4px;
    }

    .days-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
    }

    .day-cell {
        width: 100%;
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        color: var(--color-text);
        transition: background-color 0.1s;
    }

    .day-cell:hover {
        background: var(--color-surface-hover);
    }

    .day-cell.today {
        font-weight: 700;
        color: var(--color-accent);
    }

    .day-cell.selected {
        background: var(--color-accent);
        color: white;
    }

    .day-cell.empty {
        cursor: default;
    }
</style>