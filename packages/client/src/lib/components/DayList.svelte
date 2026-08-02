<script lang="ts">
    import { onMount, onDestroy, tick, untrack } from 'svelte';
    import { taskStore, preferencesStore, dateViewStore } from '$lib/stores';
    import { groupTasksByDate, SOMEDAY_KEY } from '@alle/shared';
    import { applyFilters } from '$lib/filters';
    import { container } from '$lib/container';
    import DaySection from './DaySection.svelte';

    // How many days to add each time the window extends.
    const CHUNK_DAYS = 30;
    // Max days kept in the DOM at once. Extension trims the far end so the
    // window slides -- genuinely unbounded scrolling with bounded memory.
    const MAX_RENDER_DAYS = 400;
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
        // Delegate to the provider so the weekday/date are anchored to the
        // calendar date itself (UTC), immune to the host or user's timezone.
        return container.dateProvider.formatDate(dateStr, 'full');
    }

    // Reactive to timezone changes: reading preferencesStore.timezone makes this
    // re-run when the user picks a new zone, re-resolving "today" via the
    // provider's (just-updated) timeZone.
    const todayStr = $derived.by(() => {
        preferencesStore.timezone;
        return container.dateProvider.today();
    });

    let filteredTasks = $derived(applyFilters(taskStore.tasks, preferencesStore.activeFilters));
    let tasksByDate = $derived(groupTasksByDate(filteredTasks));
    let dateKeys = $derived([...tasksByDate.keys()].filter(k => k !== SOMEDAY_KEY).sort());

    let visibleStartDate = $state(dateOffset(todayStr, -CHUNK_DAYS));
    let visibleEndDate = $state(dateOffset(todayStr, CHUNK_DAYS));

    let displayDateKeys = $derived.by(() => {
        // Empty days always render -- nothing is hidden. Every day in the
        // visible window is shown whether it has tasks or not, so the list
        // is always a clean contiguous calendar rail. today and any pending
        // navigation target are inside this range by construction.
        return dateRange(visibleStartDate, visibleEndDate);
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

    // Publish the loaded window to the shared store so DateMinimap can draw
    // its viewport indicator. ``displayDateKeys`` is the rendered range.
    $effect(() => {
        const keys = displayDateKeys;
        if (keys.length > 0) {
            dateViewStore.setVisible(keys[0], keys[keys.length - 1]);
        }
    });

    // Pick a rendered day element near the viewport center to use as a scroll
    // anchor across re-renders (prepending/trimming shifts content).
    function pickAnchorEl(): HTMLElement | null {
        const el = scrollContainer;
        if (!el) return null;
        const center = el.scrollTop + el.clientHeight / 2;
        const days = el.querySelectorAll('[id^="day-"]');
        let best: HTMLElement | null = null;
        let bestDist = Infinity;
        for (const d of days) {
            const top = (d as HTMLElement).offsetTop;
            const bottom = top + (d as HTMLElement).offsetHeight;
            const dist = top <= center && bottom >= center ? 0
                : Math.min(Math.abs(top - center), Math.abs(bottom - center));
            if (dist < bestDist) { bestDist = dist; best = d as HTMLElement; }
        }
        return best;
    }

    function extendUp() {
        if (isExtendingUp) return;

        isExtendingUp = true;
        const newStart = dateOffset(visibleStartDate, -CHUNK_DAYS);
        const anchor = pickAnchorEl();
        const oldTop = anchor ? anchor.getBoundingClientRect().top : 0;
        visibleStartDate = newStart;
        // Slide: trim the bottom so the rendered span stays bounded.
        const desiredEnd = dateOffset(newStart, MAX_RENDER_DAYS);
        if (visibleEndDate > desiredEnd) visibleEndDate = desiredEnd;
        // Preserve scroll: prepend above + trim below both shift content;
        // re-anchor the pre-render element to its old screen position.
        tick().then(() => {
            if (scrollContainer && anchor) {
                const newTop = anchor.getBoundingClientRect().top;
                scrollContainer.scrollTop += newTop - oldTop;
            }
            isExtendingUp = false;
        });
    }

    function extendDown() {
        if (isExtendingDown) return;

        isExtendingDown = true;
        const newEnd = dateOffset(visibleEndDate, CHUNK_DAYS);
        // Slide: trim the top so the rendered span stays bounded.
        const desiredStart = dateOffset(newEnd, -MAX_RENDER_DAYS);
        const anchor = pickAnchorEl();
        const oldTop = anchor ? anchor.getBoundingClientRect().top : 0;
        if (desiredStart > visibleStartDate) visibleStartDate = desiredStart;
        visibleEndDate = newEnd;
        tick().then(() => {
            if (scrollContainer && anchor) {
                const newTop = anchor.getBoundingClientRect().top;
                scrollContainer.scrollTop += newTop - oldTop;
            }
            isExtendingDown = false;
        });
    }

    function scrollToToday(smooth = true) {
        scrollToDate(todayStr, smooth);
    }

    function scrollToDate(dateStr: string, smooth = true) {
        const el = document.getElementById(`day-${dateStr}`);
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

    // Find which loaded day is nearest the vertical center of the viewport
    // and publish it so DateMinimap can highlight a single selected month.
    // Uses setTimeout instead of requestAnimationFrame -- in some headless
    // environments rAF callbacks don't fire for off-screen content, and
    // setTimeout(defer) is equally effective for throttling scroll handlers.
    let focusTimer: ReturnType<typeof setTimeout> | null = null;
    function updateFocusedDate() {
        if (focusTimer) clearTimeout(focusTimer);
        focusTimer = setTimeout(() => {
            focusTimer = null;
            const scrollEl = scrollContainer;
            if (!scrollEl) return;
            const center = scrollEl.scrollTop + scrollEl.clientHeight / 2;
            const days = scrollEl.querySelectorAll('section[id^="day-"]');
            let best: string | null = null;
            let bestDist = Infinity;
            for (const d of days) {
                const top = (d as HTMLElement).offsetTop;
                const bottom = top + (d as HTMLElement).offsetHeight;
                const dist = top <= center && bottom >= center
                    ? 0
                    : Math.min(Math.abs(top - center), Math.abs(bottom - center));
                if (dist < bestDist) {
                    bestDist = dist;
                    best = (d as HTMLElement).id.slice(4);
                }
            }
            dateViewStore.setFocusedDate(best);
        }, 16);
    }

    // Watch for navigation requests from the minimap, today button, etc.
    // Key on ``requestId`` (monotonic, always changes) rather than the target
    // string so repeated requests to the same date still re-fire. Window reads
    // happen under untrack so writing visibleStart/End here doesn't re-fire.
    $effect(() => {
        const id = dateViewStore.requestId;
        if (id === 0) return;
        const target = dateViewStore.pendingScrollTarget;
        if (!target) return;
        untrack(() => {
            const outOfWindow = target < visibleStartDate || target > visibleEndDate;
            if (outOfWindow) {
                // Slide the whole window to the target (bounded span) instead
                // of stretching one end, so a far jump never renders thousands
                // of days at once. Jump instantly since the DOM was replaced.
                const half = Math.floor(MAX_RENDER_DAYS / 2);
                visibleStartDate = dateOffset(target, -half);
                visibleEndDate = dateOffset(target, half);
                tick().then(() => scrollToDate(target, false));
            } else {
                scrollToDate(target, true);
            }
        });
    });

    onMount(() => {
        scrollContainer = containerEl?.closest('.day-list-area') as HTMLElement | null ?? containerEl?.parentElement ?? null;

        scrollToToday(false);
        updateFocusedDate();
        scrollContainer?.addEventListener('scroll', updateFocusedDate, { passive: true });

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
        scrollContainer?.removeEventListener('scroll', updateFocusedDate);
        if (focusTimer) clearTimeout(focusTimer);
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
        padding: 0 36px;
        position: relative;
    }

    .infinite-scroll-sentinel {
        height: 1px;
        width: 100%;
    }

</style>