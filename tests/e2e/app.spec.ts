import { expect, test } from '@playwright/test';
import { cleanup, createTask, uniq } from '../api-tests/helpers';
import { hydrated, modal, todayISO } from './util';

const SERVER = 'http://localhost:4000';

test.afterEach(async ({ request }) => {
    await cleanup(request, SERVER);
});

test.describe('app shell & navigation', () => {
    test('loads with the Alle title and the app-shell landmark', async ({ page }) => {
        await hydrated(page);
        await expect(page).toHaveTitle(/Alle/);
        await expect(page.locator('.app-shell')).toBeVisible();
        await expect(page.locator('[role="application"]')).toBeVisible();
    });

    test('renders the icon rail with all 9 navigation items', async ({ page }) => {
        await hydrated(page);
        const labels = [
            'Summary',
            'Projects',
            'Habits',
            'Calendar',
            'Search',
            'Filter',
            'Trash',
            'Settings',
            'Help',
        ];
        for (const label of labels) {
            await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible();
        }
    });

    test('rendering the day list with today highlighted', async ({ page }) => {
        const text = uniq('ShellToday');
        await createTask(page.request, { text, date: todayISO() }, SERVER);
        await hydrated(page);
        await expect(page.locator('.day-section.today')).toBeVisible();
        await expect(
            page.locator('.day-section.today').getByRole('button', { name: text }),
        ).toBeVisible();
    });

    test('bottom bar shows task count and a live clock', async ({ page }) => {
        await hydrated(page);
        const bb = page.locator('.bottom-bar');
        await expect(bb).toBeVisible();
        // Clock label renders a time string with a middot separator.
        await expect(bb.locator('.date-btn')).toContainText(/·|&middot;/);
        // Task count copy: "<n> task[s] <m> done".
        await expect(bb.locator('.task-stats')).toContainText(/task/);
    });
});

test.describe('icon rail — modal open/close toggling', () => {
    test('clicking Help opens the Help modal, closing it hides the modal', async ({ page }) => {
        await hydrated(page);
        await page.getByRole('button', { name: 'Help', exact: true }).click();
        const help = modal(page, 'Keyboard Shortcuts');
        await expect(help).toBeVisible();
        // The modal backdrop (z-index 1000) covers the icon rail, so the rail
        // button can't be re-clicked to close; use the modal's Close button.
        await help.getByRole('button', { name: 'Close modal' }).click();
        await expect(help).toBeHidden();
    });

    test('opening one modal, closing, then opening another', async ({ page }) => {
        await hydrated(page);
        await page.getByRole('button', { name: 'Trash', exact: true }).click();
        const trash = modal(page, 'Trash');
        await expect(trash).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(trash).toBeHidden();
        await page.getByRole('button', { name: 'Settings', exact: true }).click();
        await expect(modal(page, 'Settings')).toBeVisible();
    });
});

test.describe('keyboard shortcuts', () => {
    test('"/" opens Search, Escape closes it', async ({ page }) => {
        await hydrated(page);
        await page.keyboard.press('/');
        await expect(modal(page, 'Search')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(modal(page, 'Search')).toBeHidden();
    });

    test('"?" opens Help', async ({ page }) => {
        await hydrated(page);
        await page.keyboard.press('?');
        await expect(modal(page, 'Keyboard Shortcuts')).toBeVisible();
        await page.keyboard.press('Escape');
    });

    test('typing "n" focuses today\'s add-task input', async ({ page }) => {
        await hydrated(page);
        // The 'n' shortcut focuses today's inline-add input. Retry briefly in
        // case the first keypress races with hydration tail/focus settling.
        let focused = false;
        for (let i = 0; i < 5 && !focused; i++) {
            await page.keyboard.press('n');
            focused = await page.evaluate(
                () => document.activeElement?.classList.contains('add-input') === true,
            );
            if (!focused) await page.waitForTimeout(150);
        }
        expect(focused).toBe(true);
    });
});