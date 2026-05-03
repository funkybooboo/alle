<script lang="ts">
    import Modal from '$lib/components/Modal.svelte';
    let { onclose = () => {} }: { onclose?: () => void } = $props();
</script>

<Modal title="Keyboard Shortcuts" onclose={onclose}>
    <div class="help">
        <section class="section">
            <h3>Navigation</h3>
            <table class="shortcut-table">
                <tbody>
                    <tr><td><kbd>j</kbd> / <kbd>&#8595;</kbd></td><td>Focus next task</td></tr>
                    <tr><td><kbd>k</kbd> / <kbd>&#8593;</kbd></td><td>Focus previous task</td></tr>
                    <tr><td><kbd>g</kbd> <kbd>t</kbd></td><td>Jump to today</td></tr>
                    <tr><td><kbd>Ctrl</kbd>+<kbd>\</kbd></td><td>Toggle Someday panel</td></tr>
                </tbody>
            </table>
        </section>

        <section class="section">
            <h3>Task Actions</h3>
            <table class="shortcut-table">
                <tbody>
                    <tr><td><kbd>n</kbd> / <kbd>a</kbd></td><td>Add new task</td></tr>
                    <tr><td><kbd>e</kbd></td><td>Edit task / open detail</td></tr>
                    <tr><td><kbd>Space</kbd></td><td>Complete / uncomplete</td></tr>
                    <tr><td><kbd>d</kbd></td><td>Delete task (with undo)</td></tr>
                    <tr><td><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd></td><td>Set priority #p1 #p2 #p3</td></tr>
                    <tr><td><kbd>0</kbd></td><td>Clear priority</td></tr>
                </tbody>
            </table>
        </section>

        <section class="section">
            <h3>Panels & Modals</h3>
            <table class="shortcut-table">
                <tbody>
                    <tr><td><kbd>Cmd</kbd>+<kbd>K</kbd></td><td>Search / Command palette</td></tr>
                    <tr><td><kbd>?</kbd></td><td>This help modal</td></tr>
                    <tr><td><kbd>Esc</kbd></td><td>Close modal / cancel edit</td></tr>
                </tbody>
            </table>
        </section>
    </div>
</Modal>

<style>
    .help {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .section h3 {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 8px;
    }

    .shortcut-table {
        width: 100%;
        border-collapse: collapse;
    }

    .shortcut-table td {
        padding: 6px 0;
        font-size: 14px;
        border-bottom: 1px solid var(--color-border);
    }

    .shortcut-table td:first-child {
        width: 160px;
        white-space: nowrap;
    }

    kbd {
        background: var(--color-surface-dim);
        border: 1px solid var(--color-border);
        border-radius: 4px;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 12px;
    }
</style>