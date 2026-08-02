import { expect, test } from '@playwright/test';
import { cleanup, createTask } from '../api-tests/helpers';
import { hydrated, modal, todayISO } from './util';

const SERVER = 'http://localhost:4000';
const uniq = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

test.afterEach(async ({ request }) => {
    await cleanup(request, SERVER);
});

async function todayInput(page: import('@playwright/test').Page) {
    await hydrated(page);
    return page.locator('.day-section.today .add-input');
}

test.describe('task CRUD through the UI', () => {
    test('create a task in today\'s section via the inline input', async ({ page }) => {
        const text = uniq('UiCreated');
        const input = await todayInput(page);
        await input.fill(text);
        await input.press('Enter');
        // The task renders immediately in today's section after the HTTP round trip.
        await expect(page.locator('.day-section.today').getByText(text)).toBeVisible();
        // Input cleared and ready for the next task.
        await expect(input).toHaveValue('');
    });

    test('complete a task toggles its checkbox state', async ({ page }) => {
        const text = uniq('UiComplete');
        const task = await createTask(page.request, { text, date: todayISO() }, SERVER);
        await hydrated(page);
        const row = page.locator('.task-row', { hasText: text }).first();
        const checkbox = row.getByRole('button', { name: /Mark complete/ });
        await expect(checkbox).toBeVisible();
        await checkbox.click();
        // Toggling flips the aria-label to "Mark incomplete".
        const rowCheck = page.locator('.task-row', { hasText: text }).first();
        await expect(rowCheck.getByRole('button', { name: /Mark incomplete/ })).toBeVisible();
        // And the server agrees.
        const res = await page.request.get(`${SERVER}/api/tasks/${task.id}`);
        expect((await res.json()).data.completed).toBe(true);
    });

    test('inline edit changes the task text and persists', async ({ page }) => {
        const original = uniq('UiEditOrig');
        const edited = uniq('UiEditDone');
        const task = await createTask(page.request, { text: original, date: todayISO() }, SERVER);
        await hydrated(page);
        const row = page.locator('.task-row', { hasText: original }).first();
        await row.locator('.task-text').click();
        // Only one task edits at a time, so there is a single .edit-input on the
        // page; resolve it globally (the row's hasText filter stops matching
        // once the text button is swapped for an input whose value isn't text).
        const editInput = page.locator('.edit-input').first();
        await expect(editInput).toBeVisible();
        await editInput.fill(edited);
        await editInput.press('Enter');
        await expect(page.locator('.task-row', { hasText: edited })).toBeVisible();
        const res = await page.request.get(`${SERVER}/api/tasks/${task.id}`);
        expect((await res.json()).data.text).toBe(edited);
    });

    test('delete a task surfaces an Undo notification that restores it', async ({ page }) => {
        const text = uniq('UiDeleteUndo');
        const task = await createTask(page.request, { text, date: todayISO() }, SERVER);
        await hydrated(page);
        const row = page.locator('.task-row', { hasText: text }).first();
        await row.getByRole('button', { name: 'Delete task' }).click();
        // Notification appears.
        const notif = page.locator('.notification', { hasText: 'Task deleted' });
        await expect(notif).toBeVisible();
        // Undo button restores.
        await notif.getByRole('button', { name: 'Undo' }).click();
        await expect(page.locator('.task-row', { hasText: text })).toBeVisible();
        // Server confirms the task is restored (not soft-deleted).
        const res = await page.request.get(`${SERVER}/api/tasks/${task.id}`);
        expect(res.status()).toBe(200);
        expect((await res.json()).data.deletedAt).toBeNull();
    });

    test('tags entered via the detail modal persist on the task', async ({ page }) => {
        const text = uniq('UiDetailTags');
        const task = await createTask(page.request, { text, date: todayISO() }, SERVER);
        await hydrated(page);
        const row = page.locator('.task-row', { hasText: text }).first();
        await row.getByRole('button', { name: 'Task details' }).click();
        const modalEl = modal(page, 'Task Details');
        await expect(modalEl).toBeVisible();
        const tagsInput = modalEl.getByLabel('Tags (comma-separated)');
        await tagsInput.fill('#e2e, #work');
        await modalEl.getByRole('button', { name: 'Save', exact: true }).click();
        // Save closes the modal and PATCHes; the server reflects the tags.
        await expect.poll(async () => {
            const r = await page.request.get(`${SERVER}/api/tasks/${task.id}`);
            return (await r.json()).data.tags;
        }).toEqual(['#e2e', '#work']);
        // Tag chip renders on the row after the store re-syncs.
        await expect(page.locator('.task-row', { hasText: text }).locator('.tag-chip', { hasText: '#e2e' })).toBeVisible();
    });
});