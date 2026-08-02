<script lang="ts">
    import { onMount, onDestroy, tick, untrack } from 'svelte';
    import { dateViewStore, preferencesStore } from '$lib/stores';
    import { container } from '$lib/container';

    // Month granularity: each row is one month. The minimap has its OWN
    // bidirectional infinite scroll. There is NO hard wall: extension
    // trims the far end so the rendered window slides, keeping the DOM
    // bounded while scrolling is genuinely unbounded in both directions.

    const CHUNK_MONTHS = 12;
    // Max months kept in the DOM at once (~10yr). Extension trims beyond it.
    const MAX_RENDER_MONTHS = 120;
    // Trigger extension slightly before the edge is reached. Smaller than
    // DayList's because each row is only ~18px; a 400px margin would dwarf
    // the minimap's own overflow and make the sentinel always intersect.
    const ROOT_MARGIN_PX = 120;

    // --- month math (operates on "YYYY-MM" keys) ---

    function toMonthKey(dateStr: string): string {
        return dateStr.slice(0, 7); // YYYY-MM
    }

    function monthOffset(monthKey: string, months: number): string {
        const [y, m] = monthKey.split('-').map(Number) as [number, number];
        const idx = (y - 1) * 12 + (m - 1) + months;
        const ny = Math.floor(idx / 12) + 1;
        const nm = (idx % 12) + 1;
        return `${ny}-${String(nm).padStart(2, '0')}`;
    }

    function monthRange(start: string, end: string): string[] {
        const out: string[] = [];
        let cur = start;
        while (cur <= end) {
            out.push(cur);
            cur = monthOffset(cur, 1);
        }
        return out;
    }

    function monthLabel(monthKey: string): string {
        const m = Number(monthKey.slice(5, 7));
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1] ?? '';
    }

    function yearOf(monthKey: string): number {
        return Number(monthKey.slice(0, 4));
    }

    function firstOfMonth(monthKey: string): string {
        return `${monthKey}-01`;
    }

    // --- today (reactive to timezone preference) ---

    const todayStr = $derived.by(() => {
        preferencesStore.timezone;
        return container.dateProvider.today();
    });
    const todayMonth = $derived(toMonthKey(todayStr));

    // --- own infinite-scroll window (months) ---

    let visibleStart = $state(monthOffset(toMonthKey(todayStr), -CHUNK_MONTHS));
    let visibleEnd = $state(monthOffset(toMonthKey(todayStr), CHUNK_MONTHS));

    let rows = $derived(monthRange(visibleStart, visibleEnd));

    // --- single selected month (the month centered in DayList's viewport) ---
    const selectedMonth = $derived(dateViewStore.focusedDate ? toMonthKey(dateViewStore.focusedDate) : null);

    // Keep enough months rendered to show the focused month (so DayList
    // scrolling tracks the selection) WITHOUT fighting the manual-browse
    // trim. Only the tracked `selectedMonth` re-triggers this; window reads
    // happen under untrack so trimming never re-fires the effect.
    $effect(() => {
        const sel = selectedMonth;
        if (!sel) return;
        untrack(() => {
            if (sel < visibleStart) {
                visibleStart = monthOffset(sel, -CHUNK_MONTHS);
                const desiredEnd = monthOffset(visibleStart, MAX_RENDER_MONTHS);
                if (visibleEnd > desiredEnd) visibleEnd = desiredEnd;
            }
            if (sel > visibleEnd) {
                visibleEnd = monthOffset(sel, CHUNK_MONTHS);
                const desiredStart = monthOffset(visibleEnd, -MAX_RENDER_MONTHS);
                if (visibleStart < desiredStart) visibleStart = desiredStart;
            }
        });
    });

    // When a navigation request arrives (today button, etc.), slide the
    // minimap window to include that month. Keying on ``requestId`` (monotonic)
    // means this re-fires even when the target is the same as last time
    // (e.g. clicking Today twice).
    $effect(() => {
        const id = dateViewStore.requestId;
        if (id === 0) return;
        const target = dateViewStore.pendingScrollTarget;
        if (!target) return;
        const mk = toMonthKey(target);
        untrack(() => {
            if (mk < visibleStart) {
                visibleStart = monthOffset(mk, -CHUNK_MONTHS);
                const desiredEnd = monthOffset(visibleStart, MAX_RENDER_MONTHS);
                if (visibleEnd > desiredEnd) visibleEnd = desiredEnd;
            }
            if (mk > visibleEnd) {
                visibleEnd = monthOffset(mk, CHUNK_MONTHS);
                const desiredStart = monthOffset(visibleEnd, -MAX_RENDER_MONTHS);
                if (visibleStart < desiredStart) visibleStart = desiredStart;
            }
        });
    });

    // --- scroll anchor (keep viewport stable across re-renders) ---

    function pickAnchorEl(): HTMLElement | null {
        const el = scrollContainer;
        if (!el) return null;
        const center = el.scrollTop + el.clientHeight / 2;
        const btns = el.querySelectorAll('.month-row');
        let best: HTMLElement | null = null;
        let bestDist = Infinity;
        for (const b of btns) {
            const top = (b as HTMLElement).offsetTop;
            const bottom = top + (b as HTMLElement).offsetHeight;
            const dist = top <= center && bottom >= center ? 0
                : Math.min(Math.abs(top - center), Math.abs(bottom - center));
            if (dist < bestDist) { bestDist = dist; best = b as HTMLElement; }
        }
        return best;
    }

    // --- infinite scroll plumbing ---

    let scrollEl: HTMLElement;
    let sentinelTopEl: HTMLElement;
    let sentinelBottomEl: HTMLElement;
    let scrollContainer: HTMLElement | null = null;
    let topObserver: IntersectionObserver | null = null;
    let bottomObserver: IntersectionObserver | null = null;
    let extendingUp = false;
    let extendingDown = false;

    function extendUp() {
        if (extendingUp) return;
        // Unobserve so the observer can re-fire after the sentinel settles
        // at its new position; otherwise a sentinel that stays within the
        // root margin never transitions and the callback never re-triggers.
        topObserver?.unobserve(sentinelTopEl);
        extendingUp = true;
        const next = monthOffset(visibleStart, -CHUNK_MONTHS);
        const anchor = pickAnchorEl();
        const oldTop = anchor ? anchor.getBoundingClientRect().top : 0;
        visibleStart = next;
        const desiredEnd = monthOffset(next, MAX_RENDER_MONTHS);
        if (visibleEnd > desiredEnd) visibleEnd = desiredEnd;
        tick().then(() => {
            if (scrollContainer && anchor) {
                const newTop = anchor.getBoundingClientRect().top;
                scrollContainer.scrollTop += newTop - oldTop;
            }
            extendingUp = false;
            topObserver?.observe(sentinelTopEl);
        });
    }

    function extendDown() {
        if (extendingDown) return;
        bottomObserver?.unobserve(sentinelBottomEl);
        extendingDown = true;
        const next = monthOffset(visibleEnd, CHUNK_MONTHS);
        const desiredStart = monthOffset(next, -MAX_RENDER_MONTHS);
        const anchor = pickAnchorEl();
        const oldTop = anchor ? anchor.getBoundingClientRect().top : 0;
        if (desiredStart > visibleStart) visibleStart = desiredStart;
        visibleEnd = next;
        tick().then(() => {
            if (scrollContainer && anchor) {
                const newTop = anchor.getBoundingClientRect().top;
                scrollContainer.scrollTop += newTop - oldTop;
            }
            extendingDown = false;
            bottomObserver?.observe(sentinelBottomEl);
        });
    }

    function scrollToDateStart(dateStr: string) {
        dateViewStore.requestScroll(dateStr);
    }

    function isToday(monthKey: string): boolean {
        return monthKey === todayMonth;
    }
    function isSelected(monthKey: string): boolean {
        return monthKey === selectedMonth;
    }
    // Dot marks today's month, but is redundant once that month is selected.
    function showTodayDot(monthKey: string): boolean {
        return isToday(monthKey) && !isSelected(monthKey);
    }

    // Render a year header before the first month of each year.
    function showYearHeader(idx: number): boolean {
        if (idx === 0) return true;
        return yearOf(rows[idx]) !== yearOf(rows[idx - 1]);
    }

    // Keep the selected month on-screen in the minimap. Uses 'nearest' so we
    // only move the scroll when it's actually out of view -- never yanks the
    // scroll position while the user is browsing the minimap by hand.
    $effect(() => {
        const sel = selectedMonth;
        if (!sel || !scrollEl) return;
        const btn = scrollEl.querySelector(`[data-mk="${sel}"]`) as HTMLElement | null;
        if (btn) btn.scrollIntoView({ block: 'nearest' });
    });

    onMount(() => {
        scrollContainer = scrollEl;
        if (scrollContainer) {
            topObserver = new IntersectionObserver(
                ([e]) => { if (e.isIntersecting) extendUp(); },
                { root: scrollContainer, rootMargin: `${ROOT_MARGIN_PX}px 0px 0px 0px` },
            );
            bottomObserver = new IntersectionObserver(
                ([e]) => { if (e.isIntersecting) extendDown(); },
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

<div class="minimap" bind:this={scrollEl}>
    <div bind:this={sentinelTopEl} class="sentinel" aria-hidden="true"></div>
    {#each rows as mk, i (mk)}
        {#if showYearHeader(i)}
            <div class="year-header">{yearOf(mk)}</div>
        {/if}
        <button
            class="month-row"
            class:selected={isSelected(mk)}
            data-mk={mk}
            onclick={() => scrollToDateStart(firstOfMonth(mk))}
            aria-label="{monthLabel(mk)} {yearOf(mk)}"
            aria-current={isSelected(mk) ? 'true' : undefined}
            title="{monthLabel(mk)} {yearOf(mk)}"
        >
            <span class="month-label">{monthLabel(mk)}</span>
            <span class="today-dot" class:visible={showTodayDot(mk)} aria-hidden="true"></span>
        </button>
    {/each}
    <div bind:this={sentinelBottomEl} class="sentinel" aria-hidden="true"></div>
</div>

<style>
    .minimap {
        width: 62px;
        min-width: 62px;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        background: var(--color-surface-dim);
        border-right: 1px solid var(--color-border);
        padding: 6px 0;
        scrollbar-width: thin;
        position: relative;
    }

    .sentinel {
        height: 1px;
    }

    .year-header {
        font-size: 10px;
        font-weight: 600;
        color: var(--color-text-secondary);
        padding: 6px 8px 2px 8px;
        border-top: 1px solid var(--color-border);
        margin-top: 2px;
        text-align: left;
    }

    .month-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: calc(100% - 8px);
        margin: 0 4px;
        padding: 3px 6px 3px 8px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 4px;
        color: var(--color-text-secondary);
        transition: background-color 0.12s;
    }

    .month-row:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    .month-row.selected {
        background: var(--color-accent-light);
        color: var(--color-accent);
        font-weight: 600;
    }

    .month-label {
        font-size: 11px;
        font-weight: 500;
    }

    .today-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: transparent;
        flex-shrink: 0;
    }

    .today-dot.visible {
        background: var(--color-accent);
    }

    .month-row:hover .today-dot.visible {
        background: var(--color-accent);
    }

    .month-row:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: -2px;
    }

    /* Match the main scroll container's scrollbar look. */
    .minimap::-webkit-scrollbar { width: 6px; }
    .minimap::-webkit-scrollbar-thumb {
        background: var(--color-border);
        border-radius: 3px;
    }
</style>