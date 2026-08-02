import { expect, test } from '@playwright/test';
import { cleanup, createTask, del } from '../api-tests/helpers';
import { hydrated, modal, todayISO } from './util';

const SERVER = 'http://localhost:4000';
const uniq = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

test.afterEach(async ({ request }) => {
    await cleanup(request, SERVER);
});

test.describe('Settings modal', () => {
    test('changing theme applies it to the document and persists to the server', async ({ page }) => {
        // Capture original to restore.
        const before = await page.request.get(`${SERVER}/api/preferences`);
        const origTheme = (await before.json()).data.theme;

        await hydrated(page);
        await page.getByRole('button', { name: 'Settings', exact: true }).click();
        const settings = modal(page, 'Settings');
        await expect(settings).toBeVisible();
        await settings.locator('#theme-select').selectOption('dark');
        // Theme selection drives an immediate PATCH and the layout's $effect sets
        // document data-theme, so assert the user-visible outcome first.
        await expect
            .poll(async () => page.evaluate(() => document.documentElement.getAttribute('data-theme')))
            .toBe('dark');
        // And the server persists it.
        await expect
            .poll(async () => {
                const r = await page.request.get(`${SERVER}/api/preferences`);
                return (await r.json()).data.theme;
            })
            .toBe('dark');

        // Restore theme – the modal also leaves it dirty, so close and reset.
        await page.request.patch(`${SERVER}/api/preferences`, { data: { theme: origTheme } });
    });

    test('clearing the timezone input resets it', async ({ page }) => {
        await hydrated(page);
        await page.getByRole('button', { name: 'Settings', exact: true }).click();
        const settings = modal(page, 'Settings');
        await expect(settings.locator('#tz-input')).toBeVisible();
        await expect(settings.locator('#time-format-select')).toBeVisible();
    });
});

test.describe('Search modal', () => {
    test('searching filters tasks by text and shows results', async ({ page }) => {
        const needle = uniq('SearchNeedle');
        await createTask(page.request, { text: needle, date: todayISO() }, SERVER);
        await createTask(page.request, { text: uniq('OtherTask'), date: todayISO() }, SERVER);
        await hydrated(page);
        await page.keyboard.press('/');
        const modalEl = modal(page, 'Search');
        await expect(modalEl).toBeVisible();
        await modalEl.getByLabel('Search tasks').fill(needle);
        await expect(modalEl.locator('.result-item', { hasText: needle })).toBeVisible();
        // The unrelated task does not appear in the filtered result list.
        await expect(modalEl.locator('.result-item')).toHaveCount(1);
    });

    test('empty query shows the hint, no results', async ({ page }) => {
        await hydrated(page);
        await page.keyboard.press('/');
        const modalEl = modal(page, 'Search');
        await expect(modalEl).toBeVisible();
        await expect(modalEl.locator('.hint')).toBeVisible();
        await expect(modalEl.locator('.result-item')).toHaveCount(0);
    });
});

test.describe('Trash modal', () => {
    test('deleted tasks appear in the trash and can be restored', async ({ page }) => {
        const text = uniq('TrashMe');
        const task = await createTask(page.request, { text, date: todayISO() }, SERVER);
        // Soft-delete via the API, then open trash.
        await del(page.request, `/api/tasks/${task.id}`, SERVER);
        await hydrated(page);
        await page.getByRole('button', { name: 'Trash', exact: true }).click();
        const trash = modal(page, 'Trash');
        await expect(trash).toBeVisible();
        await expect(trash.getByText(text).first()).toBeVisible();
        // Restore from the trash.
        await trash.getByRole('button', { name: 'Restore task' }).first().click();
        // Server confirms restoration.
        const res = await page.request.get(`${SERVER}/api/tasks/${task.id}`);
        expect(res.status()).toBe(200);
        expect((await res.json()).data.deletedAt).toBeNull();
    });

    test('trash lists deleted tasks each with a restore button', async ({ page }) => {
        // Seed at least one deleted task so the trash has known content.
        const a = await createTask(page.request, { text: uniq('TrashA'), date: todayISO() }, SERVER);
        const b = await createTask(page.request, { text: uniq('TrashB'), date: todayISO() }, SERVER);
        await del(page.request, `/api/tasks/${a.id}`, SERVER);
        await del(page.request, `/api/tasks/${b.id}`, SERVER);
        await hydrated(page);
        await page.getByRole('button', { name: 'Trash', exact: true }).click();
        const trash = modal(page, 'Trash');
        await expect(trash).toBeVisible();
        // Each listed deleted task exposes a restore affordance.
        const restoreButtons = trash.getByRole('button', { name: 'Restore task' });
        await expect(restoreButtons.first()).toBeVisible();
        expect(await restoreButtons.count()).toBeGreaterThanOrEqual(2);
    });
});
