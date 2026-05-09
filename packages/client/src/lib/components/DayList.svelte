<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import {
        taskStore,
        preferencesStore,
        uiStore,
    } from '$lib/stores';
    import { groupTasksByDate, SOMEDAY_KEY } from '@alle/shared';
    import { applyFilters } from '$lib/filters';
    import { container } from '$lib/container';
    import DaySection from './DaySection.svelte';

    const CHUNK_DAYS = 30;
    const MAX_RANGE_YEARS = 5;
    const OBSERVER_ROOT_MARGIN = 400;

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

    function maxRangeBound(yearsOffset: number): string {
        const d = new Date();
        d.setFullYear(d.getFullYear() + yearsOffset);
        return d.toISOString().split('T')[0];
    }

    const todayISO = container.dateProvider.today();

    let containerEl: HTMLElement;
    let sentinelTopEl: HTMLElement;
    let sentinelBottomEl: HTMLElement;

    let filteredTasks = $derived(applyFilters(taskStore.tasks, preferencesStore.activeFilters));

    let tasksByDate = $derived(groupTasksByDate(filteredTasks));

    let dateKeys = $derived([...tasksByDate.keys()]
        .filter(k => k !== SOMEDAY_KEY)
        .sort());

    const todayStr = $derived(container.dateProvider.today());

    let visibleStartDate = $state(dateOffset(todayISO, -CHUNK_DAYS));
    let visibleEndDate = $state(dateOffset(todayISO, CHUNK_DAYS));

    let displayDateKeys = $derived.by(() => {
        if (!preferencesStore.showEmptyDays) {
            const taskDatesInRange = dateKeys.filter(
                k => k >= visibleStartDate && k <= visibleEndDate,
            );
            if (taskDatesInRange.length === 0) return [todayStr];
            const result = [...taskDatesInRange];
            if (!result.includes(todayStr)) {
                const idx = result.findIndex(k => k > todayStr);
                if (idx === -1) result.push(todayStr);
                else result.splice(idx, 0, todayStr);
            }
            return result;
        }

        return dateRange(visibleStartDate, visibleEndDate);
    });

    let scrollContainer: HTMLElement | null = null;
    let topObserver: IntersectionObserver | null = null;
    let bottomObserver: IntersectionObserver | null = null;
    let todayObserver: IntersectionObserver | null = null;
    let isExtendingUp = false;
    let isExtendingDown = false;

    function extendUp() {
        if (isExtendingUp) return;

        const newStart = dateOffset(visibleStartDate, -CHUNK_DAYS);
        if (newStart <= maxRangeBound(-MAX_RANGE_YEARS)) {
            if (topObserver && sentinelTopEl) topObserver.unobserve(sentinelTopEl);
            return;
        }

        if (!preferencesStore.showEmptyDays) {
            if (!dateKeys.some(k => k < visibleStartDate)) {
                if (topObserver && sentinelTopEl) topObserver.unobserve(sentinelTopEl);
                return;
            }
        }

        isExtendingUp = true;
        const prevScrollHeight = scrollContainer?.scrollHeight ?? 0;
        visibleStartDate = newStart;

        requestAnimationFrame(() => {
            if (scrollContainer) {
                scrollContainer.scrollTop += scrollContainer.scrollHeight - prevScrollHeight;
            }
            isExtendingUp = false;
        });
    }

    function extendDown() {
        if (isExtendingDown) return;

        const newEnd = dateOffset(visibleEndDate, CHUNK_DAYS);
        if (newEnd >= maxRangeBound(MAX_RANGE_YEARS)) {
            if (bottomObserver && sentinelBottomEl) bottomObserver.unobserve(sentinelBottomEl);
            return;
        }

        if (!preferencesStore.showEmptyDays) {
            if (!dateKeys.some(k => k > visibleEndDate)) {
                if (bottomObserver && sentinelBottomEl) bottomObserver.unobserve(sentinelBottomEl);
                return;
            }
        }

        isExtendingDown = true;
        visibleEndDate = newEnd;
        requestAnimationFrame(() => {
            isExtendingDown = false;
        });
    }

    function formatDateHeader(dateStr: string): string {
        const date = new Date(dateStr + 'T00:00:00');
        const opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', opts);
    }

function scrollToToday(smooth = true) {
        const el = document.getElementById(`day-${todayISO}`);
        if (!el) return;
        if (scrollContainer) {
            const elRect = el.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();
            const elCenter = elRect.top - containerRect.top + elRect.height / 2;
            const scrollTarget = Math.max(0, scrollContainer.scrollTop + elCenter - containerRect.height / 2);
            scrollContainer.scrollTo({
                top: scrollTarget,
                behavior: smooth ? 'smooth' : 'instant',
            });
        } else {
            el.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'center' });
        }
    }

    onMount(() => {
        scrollContainer = containerEl?.closest('.day-list-area') ?? containerEl?.parentElement ?? null;

        scrollToToday(false);

        const todayEl = document.getElementById(`day-${todayISO}`);
        if (todayEl && scrollContainer) {
            todayObserver = new IntersectionObserver(
                ([entry]) => {
                    uiStore.setTodayVisible(entry.isIntersecting);
                },
                { root: scrollContainer, threshold: 0.1 },
            );
            todayObserver.observe(todayEl);
        }

        if (scrollContainer) {
            topObserver = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) extendUp();
                },
                { root: scrollContainer, rootMargin: `${OBSERVER_ROOT_MARGIN}px 0px 0px 0px` },
            );

            bottomObserver = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) extendDown();
                },
                { root: scrollContainer, rootMargin: `0px 0px ${OBSERVER_ROOT_MARGIN}px 0px` },
            );

            if (sentinelTopEl) topObserver.observe(sentinelTopEl);
            if (sentinelBottomEl) bottomObserver.observe(sentinelBottomEl);
        }
    });

    onDestroy(() => {
        topObserver?.disconnect();
        bottomObserver?.disconnect();
        todayObserver?.disconnect();
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
    {:else}
        <div class="empty-state">
            <p>No tasks yet. Press <kbd>n</kbd> or <kbd>a</kbd> to add one.</p>
        </div>
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

    .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        color: var(--color-text-muted);
    }

    .empty-state kbd {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 4px;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 0.85em;
    }

    
</style>