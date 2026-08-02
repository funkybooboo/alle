<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    import { preferencesStore } from '$lib/stores';
    import { isValidTimeZone } from '@alle/shared';
    import { onMount } from 'svelte';

    let { onclose = () => {} }: { onclose?: () => void } = $props();

    let themeSelection = $state(preferencesStore.theme);
    let rolloverEnabled = $state(preferencesStore.rolloverEnabled);
    let deleteConfirmation = $state(preferencesStore.deleteConfirmation);
    let timeFormat = $state(preferencesStore.timeFormat);
    let timezoneInput = $state((preferencesStore.timezone ?? '').toString());
    let tzInvalid = $state(false);

    // Full IANA timezone list from the runtime; a native <datalist> does the
    // substring search so ~400 options need no shipped data.
    const tzOptions: string[] = Intl.supportedValuesOf('timeZone');

    $effect(() => {
        themeSelection = preferencesStore.theme;
        rolloverEnabled = preferencesStore.rolloverEnabled;
        deleteConfirmation = preferencesStore.deleteConfirmation;
        timeFormat = preferencesStore.timeFormat;
        timezoneInput = (preferencesStore.timezone ?? '').toString();
        tzInvalid = false;
    });

    // Live preview of the wall-clock in the chosen zone, refreshed on a timer
    // so the user sees the offset effect while the modal is open.
    let now = $state(new Date());
    onMount(() => {
        const t = setInterval(() => {
            now = new Date();
        }, 1000);
        return () => clearInterval(t);
    });
    let tzPreview = $derived(buildTzPreview());
    function buildTzPreview(): string {
        const tz =
            preferencesStore.timezone !== null && !tzInvalid ? preferencesStore.timezone : null;
        const time = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: preferencesStore.timeFormat !== '24h',
            ...(tz ? { timeZone: tz } : {}),
        });
        const zoneLabel = (tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone) || 'system';
        return `Now: ${time} (${zoneLabel})`;
    }

    function handleThemeChange(e: Event) {
        const value = (e.target as HTMLSelectElement).value as 'light' | 'dark' | 'system';
        preferencesStore.setTheme(value);
    }

    function handleRolloverChange(e: Event) {
        const value = (e.target as HTMLInputElement).checked;
        preferencesStore.save({ rolloverEnabled: value });
    }

    function handleDeleteConfirmationChange(e: Event) {
        const value = (e.target as HTMLSelectElement).value as 'instant' | 'confirm';
        preferencesStore.setDeleteConfirmation(value);
    }

    function handleTimeFormatChange(e: Event) {
        const value = (e.target as HTMLSelectElement).value as '12h' | '24h';
        preferencesStore.setTimeFormat(value);
    }

    function handleTimezoneInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value.trim();
        timezoneInput = raw;
        if (raw === '') {
            tzInvalid = false;
            preferencesStore.setTimezone(null);
            return;
        }
        if (isValidTimeZone(raw)) {
            tzInvalid = false;
            preferencesStore.setTimezone(raw);
        } else {
            // Keep the previous valid zone in place; flag the input as invalid.
            tzInvalid = true;
        }
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
            <label class="field">
                <span class="label" id="time-format-label">Time format</span>
                <select class="select" value={timeFormat} onchange={handleTimeFormatChange} aria-labelledby="time-format-label" id="time-format-select">
                    <option value="12h">12-hour (08:53 PM)</option>
                    <option value="24h">24-hour (20:53)</option>
                </select>
            </label>
            <label class="field">
                <span class="label" id="tz-label">Timezone</span>
                <input
                    class="select tz-input"
                    list="tz-options"
                    id="tz-input"
                    value={timezoneInput}
                    oninput={handleTimezoneInput}
                    placeholder="System (device)"
                    aria-labelledby="tz-label"
                    aria-invalid={tzInvalid}
                />
                <datalist id="tz-options">
                    {#each tzOptions as tz}
                        <option value={tz}></option>
                    {/each}
                </datalist>
            </label>
            <span class="hint" class:invalid={tzInvalid}>
                {tzInvalid ? 'Unknown timezone' : tzPreview}
            </span>
            <details class="tz-help">
                <summary>Examples & format</summary>
                <p class="tz-help-text">
                    Use an IANA timezone identifier: <code>Area/Location</code>
                    (case-sensitive). E.g. <code>America/Denver</code>,
                    <code>America/Boise</code>, <code>Europe/London</code>,
                    <code>Asia/Tokyo</code>, <code>Asia/Kolkata</code>,
                    <code>Australia/Sydney</code>, <code>UTC</code>.
                </p>
                <p class="tz-help-text">
                    No abbreviations (MST, PST, EST are ambiguous) and no
                    numeric offsets (use a named zone instead). Leave blank to
                    follow your device's system timezone.
                </p>
                <p class="tz-help-text">
                    Full list:
                    <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" target="_blank" rel="noopener noreferrer">wikipedia.org &rarr;</a>
                </p>
            </details>
        </fieldset>

        <fieldset class="section">
            <legend class="section-heading">Behavior</legend>
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

    .hint.invalid {
        color: var(--color-danger);
    }

    .tz-input {
        width: 180px;
        font-family: inherit;
        box-sizing: border-box;
    }

    .tz-input[aria-invalid="true"] {
        border-color: var(--color-danger);
    }

    .tz-help {
        margin-top: 4px;
        font-size: 12px;
        color: var(--color-text-muted);
    }

    .tz-help summary {
        cursor: pointer;
        user-select: none;
        color: var(--color-text-secondary);
        padding: 2px 0;
    }

    .tz-help summary:hover {
        color: var(--color-text);
    }

    .tz-help-text {
        margin: 6px 0 8px;
        line-height: 1.5;
    }

    .tz-help code {
        background: var(--color-surface-dim);
        border: 1px solid var(--color-border);
        border-radius: 4px;
        padding: 1px 5px;
        font-family: monospace;
        font-size: 11px;
    }

    .tz-help a {
        color: var(--color-accent);
        text-decoration: none;
    }

    .tz-help a:hover {
        text-decoration: underline;
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