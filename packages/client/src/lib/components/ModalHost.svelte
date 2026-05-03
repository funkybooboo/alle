<script lang="ts">
    import { uiStore, taskStore, type ModalType } from '$lib/stores';
    import SummaryModal from './modals/SummaryModal.svelte';
    import ProjectsModal from './modals/ProjectsModal.svelte';
    import HabitsModal from './modals/HabitsModal.svelte';
    import CalendarModal from './modals/CalendarModal.svelte';
    import SearchModal from './modals/SearchModal.svelte';
    import FilterModal from './modals/FilterModal.svelte';
    import TrashModal from './modals/TrashModal.svelte';
    import SettingsModal from './modals/SettingsModal.svelte';
    import HelpModal from './modals/HelpModal.svelte';
    import TaskDetailModal from './modals/TaskDetailModal.svelte';

    let activeModal = $derived(uiStore.activeModal);

    function close() {
        uiStore.closeModal();
    }
</script>

{#if activeModal === 'summary'}
    <SummaryModal onclose={close} />
{:else if activeModal === 'projects'}
    <ProjectsModal onclose={close} />
{:else if activeModal === 'habits'}
    <HabitsModal onclose={close} />
{:else if activeModal === 'calendar'}
    <CalendarModal onclose={close} />
{:else if activeModal === 'search'}
    <SearchModal onclose={close} />
{:else if activeModal === 'filter'}
    <FilterModal onclose={close} />
{:else if activeModal === 'trash'}
    <TrashModal onclose={close} />
{:else if activeModal === 'settings'}
    <SettingsModal onclose={close} />
{:else if activeModal === 'help'}
    <HelpModal onclose={close} />
{:else if activeModal === 'taskDetail'}
    <TaskDetailModal onclose={close} />
{/if}