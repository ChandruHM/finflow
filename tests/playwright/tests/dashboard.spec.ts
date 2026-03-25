import { test, expect } from '@playwright/test';

test.describe('FinFlow Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/FinFlow/);
    await expect(page.locator('#dashboard-header')).toBeVisible();
  });

  test('should display system health indicators', async ({ page }) => {
    const healthSection = page.locator('#system-health');
    await expect(healthSection).toBeVisible();

    // Verify all three services are represented
    await expect(page.locator('[data-service="frontend"]')).toBeVisible();
    await expect(page.locator('[data-service="node"]')).toBeVisible();
    await expect(page.locator('[data-service="java"]')).toBeVisible();
  });

  test('should show agent status panel', async ({ page }) => {
    const agentPanel = page.locator('#agent-status-panel');
    await expect(agentPanel).toBeVisible();

    // Verify all three agents
    await expect(page.getByText('UX Guardian')).toBeVisible();
    await expect(page.getByText('Node-Flow Agent')).toBeVisible();
    await expect(page.getByText('Java-Core Agent')).toBeVisible();
  });
});
