<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { preferencesStore, someDayGroupStore, tagStore, uiStore, taskStore } from '$lib/stores';
    import { container } from '$lib/container';
    import IconRail from '$lib/components/IconRail.svelte';
    import SomedayPanel from '$lib/components/SomedayPanel.svelte';
    import BottomBar from '$lib/components/BottomBar.svelte';
    import ModalHost from '$lib/components/ModalHost.svelte';
    import ToastContainer from '$lib/components/ToastContainer.svelte';

    let { children } = $props();

    function applyTheme(theme: 'light' | 'dark' | 'system') {
        let resolved: 'light' | 'dark';
        if (theme === 'system') {
            resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            resolved = theme;
        }
        document.documentElement.setAttribute('data-theme', resolved);
    }

    onMount(() => {
        preferencesStore.load().then(() => {
            applyTheme(preferencesStore.theme);
        });
        tagStore.fetchAll();
        document.querySelector('.app-shell')?.setAttribute('data-hydrated', 'true');

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (preferencesStore.theme === 'system') {
                applyTheme('system');
            }
        });
    });

    $effect(() => {
        applyTheme(preferencesStore.theme);
    });

    function handleGlobalKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            uiStore.closeModal();
            uiStore.startEditing(null);
            uiStore.startAdding(null);
            return;
        }

        if (uiStore.activeModal) return;

        if (e.key === 'n' || e.key === 'a') {
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
            e.preventDefault();
            const todayStr = container.dateProvider.today();
            uiStore.startAdding(todayStr);
        } else if (e.key === '/') {
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
            e.preventDefault();
            uiStore.openModal('search');
        } else if (e.key === '?') {
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
            e.preventDefault();
            uiStore.openModal('help');
        } else if (e.key === 'e' && uiStore.focusedTaskId) {
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
            e.preventDefault();
            uiStore.openModal('taskDetail');
        } else if (e.key === 'd' && uiStore.focusedTaskId) {
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
            e.preventDefault();
            const taskId = uiStore.focusedTaskId;
            const task = taskStore.tasks.find(t => t.id === taskId);
            if (!task) return;
            async function doDelete() {
                const removedTask = { ...task };
                const success = await taskStore.remove(taskId);
                if (success) {
                    uiStore.showToast('Task deleted', {
                        label: 'Undo',
                        fn: () => taskStore.restore(removedTask),
                    });
                }
            }
            if (preferencesStore.deleteConfirmation === 'confirm') {
                if (window.confirm(`Delete "${task.text}"?`)) {
                    doDelete();
                }
            } else {
                doDelete();
            }
        } else if (e.ctrlKey && e.key === '\\') {
            e.preventDefault();
            if (preferencesStore.someDayPanelWidth < 100) {
                preferencesStore.setPanelWidth(preferencesStore.someDayPanelLastOpenWidth);
            } else {
                preferencesStore.setPanelWidth(0);
            }
        }
    }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="app-shell" role="application" aria-label="Alle Task App">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <div class="main-area">
        <IconRail />
        <main id="main-content" class="day-list-area">
            {@render children()}
        </main>
        <SomedayPanel />
    </div>
    <BottomBar />
</div>

<ModalHost />
<ToastContainer />

<style>
    .app-shell {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
    }

    .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--color-accent);
        color: white;
        padding: 8px 16px;
        z-index: 200;
        font-size: 14px;
        text-decoration: none;
        border-radius: 0 0 4px 0;
    }

    .skip-link:focus {
        top: 0;
    }

    .main-area {
        display: flex;
        flex: 1;
        min-height: 0;
    }

    .day-list-area {
        flex: 1;
        min-width: 0;
        overflow-y: auto;
        transition: flex 0.2s ease;
    }
</style>