<script lang="ts">
    let {
        sectionId,
        title,
        dateParts,
        taskCount,
        completedCount,
        isToday = false,
    }: {
        sectionId: string;
        title: string;
        dateParts: { weekday: string; month: string; day: string; year: string; weekdayShort: string; monthShort: string };
        taskCount: number;
        completedCount: number;
        isToday?: boolean;
    } = $props();

    // Completion state surfaced at a glance. Tasks that aren't done just roll
    // over to the next day (auto-rollover) -- there's no "overdue" state.
    let isComplete = $derived(taskCount > 0 && completedCount === taskCount);
</script>

<div
    class="section-header"
    class:today={isToday}
    class:complete={isComplete}
    id={sectionId}
>
    <span class="day-num">{dateParts.day}</span>
    <span class="weekday">{dateParts.weekdayShort}</span>
    <span class="month-year">{dateParts.monthShort} {dateParts.year}</span>
    <span class="section-stats">
        {taskCount} task{taskCount !== 1 ? 's' : ''}
        {completedCount} done
    </span>
</div>

<style>
    .section-header {
        display: flex;
        align-items: baseline;
        gap: 10px;
        width: 100%;
        padding: 8px 0;
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text);
        text-align: left;
        font-family: inherit;
        font-variant-numeric: tabular-nums;
    }

    .section-header.today {
        color: var(--color-accent);
    }

    /* Hero day number -- the visual anchor (TeuxDeux-style big number). */
    .day-num {
        font-size: 24px;
        font-weight: 700;
        line-height: 1;
        width: 32px;
        flex-shrink: 0;
        text-align: right;
        letter-spacing: -0.5px;
    }

    /* 3-letter uppercase weekday with letter-spacing -- clean + editorial. */
    .weekday {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--color-text);
        white-space: nowrap;
    }

    /* Abbreviated month + year, muted -- supporting metadata. */
    .month-year {
        font-size: 12px;
        font-weight: 400;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: var(--color-text-secondary);
        white-space: nowrap;
    }

    /* Stats pushed to the far right, always visible. */
    .section-stats {
        margin-left: auto;
        font-weight: 400;
        font-size: 12px;
        color: var(--color-text-secondary);
        white-space: nowrap;
        display: flex;
        gap: 12px;
        align-items: baseline;
    }

    /* Completion: success-green when everything is done (progress at a glance). */
    .section-header.complete .section-stats {
        color: var(--color-success);
        font-weight: 500;
    }

    .section-header.complete .day-num {
        color: var(--color-success);
    }

    .section-header.today .day-num {
        color: var(--color-accent);
    }

    /* Today wins over complete for the day number if both somehow apply. */
    .section-header.today.complete .day-num {
        color: var(--color-accent);
    }
</style>