<script lang="ts">
    import { uiStore, type ModalType } from '$lib/stores';
    import { Icon } from 'svelte-icons-pack';
    import { LuCalendar, LuBarChart3, LuRepeat, LuSearch, LuTag, LuTrash2, LuSettings, LuCircleHelp, LuList } from 'svelte-icons-pack/lu';

    const icons: { id: ModalType; icon: typeof LuCalendar; label: string }[] = [
        { id: 'summary', icon: LuList, label: 'Summary' },
        { id: 'projects', icon: LuBarChart3, label: 'Projects' },
        { id: 'habits', icon: LuRepeat, label: 'Habits' },
        { id: 'calendar', icon: LuCalendar, label: 'Calendar' },
        { id: 'search', icon: LuSearch, label: 'Search' },
        { id: 'filter', icon: LuTag, label: 'Filter' },
        { id: 'trash', icon: LuTrash2, label: 'Trash' },
        { id: 'settings', icon: LuSettings, label: 'Settings' },
        { id: 'help', icon: LuCircleHelp, label: 'Help' },
    ];

    function handleIconClick(id: ModalType) {
        if (uiStore.activeModal === id) {
            uiStore.closeModal();
        } else {
            uiStore.openModal(id);
        }
    }
</script>

<nav class="icon-rail" aria-label="App navigation">
    {#each icons as item}
        <button
            class="icon-btn"
            class:active={uiStore.activeModal === item.id}
            onclick={() => handleIconClick(item.id)}
            aria-label={item.label}
            title={item.label}
        >
            <span class="icon"><Icon src={item.icon} /></span>
            <span class="label">{item.label}</span>
        </button>
    {/each}
</nav>

<style>
    .icon-rail {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: 64px;
        min-width: 64px;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border);
        padding: 8px 0;
        gap: 4px;
        overflow-y: auto;
    }

    .icon-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 100%;
        box-sizing: border-box;
        min-height: 56px;
        padding: 8px 4px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 6px;
        transition: background-color 0.15s;
        color: var(--color-text-secondary);
        text-align: center;
    }

    .icon-btn:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
    }

    .icon-btn.active {
        background: var(--color-accent-light);
        color: var(--color-accent);
    }

    .icon :global(svg) {
        width: 22px;
        height: 22px;
        flex-shrink: 0;
    }

    .label {
        font-size: 10px;
        font-weight: 500;
        line-height: 1.2;
        white-space: nowrap;
    }

    .icon-btn:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: -2px;
    }
</style>