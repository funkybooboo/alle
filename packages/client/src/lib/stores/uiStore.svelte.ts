import { DEFAULT_TOAST_DURATION_MS } from '@alle/shared';

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
    addingTo = $state<string | null>(null);
    todayVisible = $state(true);
    isDragging = $state(false);
    toastMessage = $state<string | null>(null);
    toastAction = $state<{ label: string; fn: () => void } | null>(null);
    #toastTimer: ReturnType<typeof setTimeout> | null = null;

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

    startAdding(dateOrSomeday: string | null) {
        this.addingTo = dateOrSomeday;
    }

    setTodayVisible(visible: boolean) {
        this.todayVisible = visible;
    }

    startDrag() {
        this.isDragging = true;
    }

    endDrag() {
        this.isDragging = false;
    }

    showToast(
        message: string,
        action?: { label: string; fn: () => void },
        duration = DEFAULT_TOAST_DURATION_MS,
    ) {
        if (this.#toastTimer) clearTimeout(this.#toastTimer);
        this.toastMessage = message;
        this.toastAction = action ?? null;
        this.#toastTimer = setTimeout(() => {
            this.toastMessage = null;
            this.toastAction = null;
        }, duration);
    }

    dismissToast() {
        if (this.#toastTimer) clearTimeout(this.#toastTimer);
        this.toastMessage = null;
        this.toastAction = null;
    }

    reset() {
        this.focusedTaskId = null;
        this.activeModal = null;
        this.editingTaskId = null;
        this.addingTo = null;
        this.todayVisible = true;
        this.isDragging = false;
        this.toastMessage = null;
        this.toastAction = null;
    }
}

export const uiStore = new UIStore();
