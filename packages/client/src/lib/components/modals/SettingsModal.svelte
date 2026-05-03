<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { preferencesStore } from '$lib/stores';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    let themeSelection = $state(preferencesStore.theme);
    let showEmptyDays = $state(preferencesStore.showEmptyDays);
    let rolloverEnabled = $state(preferencesStore.rolloverEnabled);
    let deleteConfirmation = $state(preferencesStore.deleteConfirmation);

    $effect(() => {
        themeSelection = preferencesStore.theme;
        showEmptyDays = preferencesStore.showEmptyDays;
        rolloverEnabled = preferencesStore.rolloverEnabled;
        deleteConfirmation = preferencesStore.deleteConfirmation;
    });

    function handleThemeChange(e: Event) {
        const value = (e.target as HTMLSelectElement).value as 'light' | 'dark' | 'system';
        preferencesStore.setTheme(value);
    }

    function handleShowEmptyDaysChange(e: Event) {
        preferencesStore.setShowEmptyDays((e.target as HTMLInputElement).checked);
    }

    function handleRolloverChange(e: Event) {
        const value = (e.target as HTMLInputElement).checked;
        preferencesStore.save({ rolloverEnabled: value });
    }

    function handleDeleteConfirmationChange(e: Event) {
        const value = (e.target as HTMLSelectElement).value as 'instant' | 'confirm';
        preferencesStore.setDeleteConfirmation(value);
    }
</script>

<Modal title="Settings" onclose={onclose}>
    <div class="settings">
        <fieldset class="section">
            <legend class="section-heading">Appearance</legend>
            <label class="field">
                <span class="label" id="theme-label">Theme</span>
                <select class="select" value={themeSelection} onchange={handleThemeChange} aria-labelledby="theme-label" id="theme-select">
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </label>
        </fieldset>

        <fieldset class="section">
            <legend class="section-heading">Behavior</legend>
            <label class="checkbox-field">
                <input type="checkbox" checked={showEmptyDays} onchange={handleShowEmptyDaysChange} id="show-empty-days" />
                <span>Show empty days</span>
            </label>
            <label class="checkbox-field">
                <input type="checkbox" checked={rolloverEnabled} onchange={handleRolloverChange} id="rollover-enabled" />
                <span>Auto-rollover incomplete tasks</span>
            </label>
            <label class="field">
                <span class="label" id="delete-confirm-label">Delete confirmation</span>
                <select class="select" value={deleteConfirmation} onchange={handleDeleteConfirmationChange} aria-labelledby="delete-confirm-label" id="delete-confirm-select">
                    <option value="instant">Instant delete</option>
                    <option value="confirm">Ask before deleting</option>
                </select>
            </label>
        </fieldset>

        <section class="section" aria-label="Panel settings">
            <h3 class="section-heading">Panel</h3>
            <p class="hint">Toggle the Someday panel with <kbd>Ctrl</kbd>+<kbd>\</kbd></p>
        </section>
    </div>
</Modal>

<style>
    .settings {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .section h3, .section-heading {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 12px;
    }

    fieldset.section {
        border: none;
        padding: 0;
        margin: 0;
    }

    .field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .label {
        font-size: 14px;
        color: var(--color-text);
    }

    .select {
        padding: 6px 12px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        background: var(--color-surface-dim);
        color: var(--color-text);
        font-size: 14px;
    }

    .select:focus {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
    }

    .checkbox-field {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
        padding: 4px 0;
    }

    .checkbox-field input[type="checkbox"] {
        width: 16px;
        height: 16px;
    }

    .hint {
        font-size: 13px;
        color: var(--color-text-muted);
    }

    kbd {
        background: var(--color-surface-dim);
        border: 1px solid var(--color-border);
        border-radius: 4px;
        padding: 1px 6px;
        font-family: monospace;
        font-size: 12px;
    }
</style>