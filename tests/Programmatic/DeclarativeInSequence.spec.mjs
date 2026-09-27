import { test, expect } from '@playwright/test';
test('Programmatic>DeclarativeInSequence', async ({ page }) => {
    await page.goto('./tests/Programmatic/DeclarativeInSequence.html');
    await page.waitForTimeout(2000);
    const target = page.locator('#target');
    await expect(target).toHaveAttribute('mark', 'good');
});
