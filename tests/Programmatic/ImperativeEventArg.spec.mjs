import { test, expect } from '@playwright/test';
test('Programmatic>ImperativeEventArg', async ({ page }) => {
    await page.goto('./tests/Programmatic/ImperativeEventArg.html');
    await page.waitForTimeout(2000);
    const target = page.locator('#target');
    await expect(target).toHaveAttribute('mark', 'good');
});
