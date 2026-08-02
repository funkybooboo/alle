<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import { taskStore, preferencesStore } from '$lib/stores';
    import { groupTasksByDate, SOMEDAY_KEY } from '@alle/shared';
    import { applyFilters } from '$lib/filters';
    import { container } from '$lib/container';
    import DaySection from './DaySection.svelte';

    // How many days to add each time the window extends.
    const CHUNK_DAYS = 30;
    // Hard bounds so a runaway can't render forever. ±20 years is, in
    // practice, infinite for a task list, but keeps memory sane.
    const MAX_RANGE_YEARS = 20;
    // Trigger extension slightly before the edge is reached.
    const ROOT_MARGIN_PX = 400;

    function dateOffset(dateStr: string, days: number): string {
        const d = new Date(dateStr + 'T00:00:00');
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    }

    function dateRange(start: string, end: string): string[] {
        const dates: string[] = [];
        const current = new Date(start + 'T00:00:00');
        const endDate = new Date(end + 'T00:00:00');
        while (current <= endDate) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }

    function formatDateHeader(dateStr: string): string {
        const date = new Date(dateStr + 'T00:00:00');
        const opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', opts);
    }

    const todayStr = $derived(container.dateProvider.today());

    let filteredTasks = $derived(applyFilters(taskStore.tasks, preferencesStore.activeFilters));
    let tasksByDate = $derived(groupTasksByDate(filteredTasks));
    let dateKeys = $derived([...tasksByDate.keys()].filter(k => k !== SOMEDAY_KEY).sort());

    let visibleStartDate = $state(dateOffset(todayStr, -CHUNK_DAYS));
    let visibleEndDate = $state(dateOffset(todayStr, CHUNK_DAYS));

    let displayDateKeys = $derived.by(() => {
        if (preferencesStore.showEmptyDays) {
            return dateRange(visibleStartDate, visibleEndDate);
        }
        // Only days that have tasks — but always include today so there's
        // always something to land on.
        const inRange = dateKeys.filter(k => k >= visibleStartDate && k <= visibleEndDate);
        if (inRange.length === 0) return [todayStr];
        const result = [...inRange];
        if (!result.includes(todayStr)) {
            const idx = result.findIndex(k => k > todayStr);
            if (idx === -1) result.push(todayStr);
            else result.splice(idx, 0, todayStr);
        }
        return result;
    });

    // --- infinite scroll state ---
    let containerEl: HTMLElement;
    let sentinelTopEl: HTMLElement;
    let sentinelBottomEl: HTMLElement;
    let scrollContainer: HTMLElement | null = null;
    let topObserver: IntersectionObserver | null = null;
    let bottomObserver: IntersectionObserver | null = null;
    let isExtendingUp = false;
    let isExtendingDown = false;

    let minBound = $derived(dateOffset(todayStr, -MAX_RANGE_YEARS * 365));
    let maxBound = $derived(dateOffset(todayStr, MAX_RANGE_YEARS * 365));

    function extendUp() {
        if (isExtendingUp) return;
        const newStart = dateOffset(visibleStartDate, -CHUNK_DAYS);
        if (newStart <= minBound) {
            topObserver?.unobserve(sentinelTopEl);
            visibleStartDate = minBound;
            return;
        }
        // When empty days are hidden, only extend if there are actually
        // older tasks to reveal; otherwise nothing would render anyway.
        if (!preferencesStore.showEmptyDays && !dateKeys.some(k => k < visibleStartDate)) return;

        isExtendingUp = true;
        const prevHeight = scrollContainer?.scrollHeight ?? 0;
        visibleStartDate = newStart;
        // Preserve scroll position: content was prepended above the current
        // viewport, so add the newly-gained height to scrollTop.
        tick().then(() => {
            if (scrollContainer) {
                scrollContainer.scrollTop += scrollContainer.scrollHeight - prevHeight;
            }
            isExtendingUp = false;
        });
    }

    function extendDown() {
        if (isExtendingDown) return;
        const newEnd = dateOffset(visibleEndDate, CHUNK_DAYS);
        if (newEnd >= maxBound) {
            bottomObserver?.unobserve(sentinelBottomEl);
            visibleEndDate = maxBound;
            return;
        }
        if (!preferencesStore.showEmptyDays && !dateKeys.some(k => k > visibleEndDate)) return;

        isExtendingDown = true;
        visibleEndDate = newEnd;
        tick().then(() => {
            isExtendingDown = false;
        });
    }

    function scrollToToday(smooth = true) {
        const el = document.getElementById(`day-${todayStr}`);
        if (!el) return;
        const scrollEl = scrollContainer ?? (document.querySelector('.day-list-area') as HTMLElement | null);
        if (scrollEl) {
            const elRect = el.getBoundingClientRect();
            const containerRect = scrollEl.getBoundingClientRect();
            const elCenter = elRect.top - containerRect.top + elRect.height / 2;
            const scrollTarget = Math.max(0, scrollEl.scrollTop + elCenter - containerRect.height / 2);
            scrollEl.scrollTo({ top: scrollTarget, behavior: smooth ? 'smooth' : 'instant' });
        } else {
            el.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'center' });
        }
    }

    onMount(() => {
        scrollContainer = containerEl?.closest('.day-list-area') as HTMLElement | null ?? containerEl?.parentElement ?? null;

        scrollToToday(false);

        if (scrollContainer) {
            topObserver = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) extendUp(); },
                { root: scrollContainer, rootMargin: `${ROOT_MARGIN_PX}px 0px 0px 0px` },
            );
            bottomObserver = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) extendDown(); },
                { root: scrollContainer, rootMargin: `0px 0px ${ROOT_MARGIN_PX}px 0px` },
            );
            if (sentinelTopEl) topObserver.observe(sentinelTopEl);
            if (sentinelBottomEl) bottomObserver.observe(sentinelBottomEl);
        }
    });

    onDestroy(() => {
        topObserver?.disconnect();
        bottomObserver?.disconnect();
    });
</script>

<div class="day-list" bind:this={containerEl} role="list" aria-label="Task list by day">
    <div bind:this={sentinelTopEl} class="infinite-scroll-sentinel" aria-hidden="true"></div>
    {#each displayDateKeys as dateStr (dateStr)}
        <DaySection
            id="day-{dateStr}"
            dateStr={dateStr}
            label={formatDateHeader(dateStr)}
            tasks={tasksByDate.get(dateStr) ?? []}
        />
    {/each}
    <div bind:this={sentinelBottomEl} class="infinite-scroll-sentinel" aria-hidden="true"></div>
</div>

<style>
    .day-list {
        padding: 16px 20px;
        max-width: 800px;
        margin: 0 auto;
    }

    .infinite-scroll-sentinel {
        height: 1px;
        width: 100%;
    }

</style>