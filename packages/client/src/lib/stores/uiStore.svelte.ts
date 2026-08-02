export type ModalType =
    | 'summary'
    | 'projects'
    | 'habits'
    | 'calendar'
    | 'search'
    | 'filter'
    | 'trash'
    | 'settings'
    | 'help'
    | 'taskDetail';

class UIStore {
    focusedTaskId = $state<string | null>(null);
    activeModal = $state<ModalType | null>(null);
    editingTaskId = $state<string | null>(null);

    focusTask(id: string | null) {
        this.focusedTaskId = id;
    }

    openModal(modal: ModalType) {
        this.activeModal = modal;
    }

    closeModal() {
        this.activeModal = null;
    }

    startEditing(taskId: string | null) {
        this.editingTaskId = taskId;
    }

    reset() {
        this.focusedTaskId = null;
        this.activeModal = null;
        this.editingTaskId = null;
    }
}

export const uiStore = new UIStore();
