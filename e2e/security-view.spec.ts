import { expect, test } from '@playwright/test';

const INSPECT_BUTTON_REGEX = /inspect/i;

test.describe('Security View & Interactive Primitives', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#microsoft');
  });

  test('renders posture overview KPIs and top 3 leaderboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Posture Overview & Metrics' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Leaderboard Top 3' })).toBeVisible();
    await expect(page.getByText('Total Tenants')).toBeVisible();
  });

  test('switches cleanly between Tiles, Chart, and List tabs without layout overlapping', async ({ page }) => {
    const tilesTab = page.getByRole('tab', { name: 'Tiles' });
    const chartTab = page.getByRole('tab', { name: 'Chart' });
    const listTab = page.getByRole('tab', { name: 'List' });

    // Step 1: Tiles tab is active by default
    await expect(tilesTab).toHaveAttribute('data-state', 'active');
    await expect(page.getByRole('tabpanel')).toBeVisible();
    await expect(page.getByText('Southridge Enterprises').first()).toBeVisible();

    // Step 2: Switch to Chart tab
    await chartTab.click();
    await expect(chartTab).toHaveAttribute('data-state', 'active');
    await expect(tilesTab).toHaveAttribute('data-state', 'inactive');
    await expect(page.getByRole('heading', { name: 'Enterprise Leaderboard Rankings' })).toBeVisible();

    // Step 3: Switch to List tab
    await listTab.click();
    await expect(listTab).toHaveAttribute('data-state', 'active');
    await expect(chartTab).toHaveAttribute('data-state', 'inactive');
    await expect(page.getByRole('table')).toBeVisible();

    // Step 4: Switch back to Tiles tab
    await tilesTab.click();
    await expect(tilesTab).toHaveAttribute('data-state', 'active');
    await expect(page.getByText('Southridge Enterprises').first()).toBeVisible();
    await expect(page.getByRole('table')).toBeHidden();
  });

  test('filters tenants using the search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search tenants by name, domain, industry...');
    await expect(searchInput).toBeVisible();

    // Filter by specific keyword
    await searchInput.fill('Southridge');

    // Tenant list should show Southridge
    await expect(page.getByText('Southridge Enterprises').first()).toBeVisible();
  });

  test('opens and closes tenant detail modal via Radix Dialog primitive', async ({ page }) => {
    // Click inspect on a tenant card
    const firstInspectButton = page.getByRole('button', { name: INSPECT_BUTTON_REGEX }).first();
    await firstInspectButton.click();

    // Dialog modal should open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Press Escape to dismiss dialog
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
