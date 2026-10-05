import { expect, test } from '@playwright/test';

const APP_TITLE_REGEX = /ReactWeb|Boilerplate App/i;
const HASH_MICROSOFT_REGEX = /#microsoft/;
const HASH_SETTINGS_REGEX = /#settings/;
const HASH_DEBUG_REGEX = /#debug/;

test.describe('Application Navigation & Core Layout', () => {
  test('loads homepage by default and displays sidebar navigation', async ({ page }) => {
    await page.goto('/');

    // Check application title
    await expect(page).toHaveTitle(APP_TITLE_REGEX);

    // Verify default view is loaded
    await expect(page.getByRole('heading').first()).toBeVisible();

    // Verify main navigation links exist in the sidebar
    const sidebar = page.locator('aside');
    const navHomepage = sidebar.getByRole('button', { name: 'Homepage' });
    const navSecurity = sidebar.getByRole('button', { name: 'Microsoft Security' });
    const navSettings = sidebar.getByRole('button', { name: 'Settings' });
    const navDebug = sidebar.getByRole('button', { name: 'Debug' });

    await expect(navHomepage).toBeVisible();
    await expect(navSecurity).toBeVisible();
    await expect(navSettings).toBeVisible();
    await expect(navDebug).toBeVisible();
  });

  test('navigates between views via hash routing', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('aside');

    // Navigate to Microsoft Security view
    await sidebar.getByRole('button', { name: 'Microsoft Security' }).click();
    await expect(page).toHaveURL(HASH_MICROSOFT_REGEX);
    await expect(page.getByRole('heading', { name: 'Posture Overview & Metrics' })).toBeVisible();

    // Navigate to Settings view
    await sidebar.getByRole('button', { name: 'Settings' }).click();
    await expect(page).toHaveURL(HASH_SETTINGS_REGEX);
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Navigate to Debug view
    await sidebar.getByRole('button', { name: 'Debug' }).click();
    await expect(page).toHaveURL(HASH_DEBUG_REGEX);
    await expect(page.getByRole('heading', { name: 'Debug & Runtime Diagnostics' })).toBeVisible();
  });

  test('toggles dark mode via sidebar theme switch', async ({ page }) => {
    await page.goto('/');

    const themeSwitch = page.getByRole('switch');
    await expect(themeSwitch).toBeVisible();

    const isInitiallyDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));

    await themeSwitch.click();

    const isAfterClickDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isAfterClickDark).toBe(!isInitiallyDark);
  });
});
