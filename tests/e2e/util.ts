/**
 * SvelteKit E2E helpers.
 *
 * The app is server-rendered, so elements are present immediately but Svelte
 * event handlers (onclick/onkeydown) are only active after hydration. The
 * layout sets `data-hydrated="true"` on `.app-shell` in onMount — that is the
 * signal that interactive components are ready. Always `await hydrated(page)`
 * before clicking or pressing keys.
 */
import type { Page } from '@playwright/test';

/** Wait for the app to hydrate so Svelte event handlers are active. */
export async function hydrated(page: Page): Promise<void> {
    await page.goto('/');
    await page.locator('.app-shell[data-hydrated="true"]').waitFor({ timeout: 15_000 });
}

/**
 * Locate a modal by its title via the accessible dialog role. With the modal
 * backdrop's aria-hidden removed, the dialog is in the accessibility tree
 * again, so getByRole is the robust, user-reflective way to find it.
 */
export function modal(page: Page, title: string) {
    return page.getByRole('dialog', { name: title, exact: true });
}

/** Today as YYYY-MM-DD in the browser's local zone (matches dateProvider.today()). */
export function todayISO(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}