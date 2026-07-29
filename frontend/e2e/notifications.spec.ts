import { expect, test } from '@playwright/test'

test('creates, stacks, positions, and dismisses notifications', async ({ page }) => {
  await page.goto('/test/notifications')

  await page.getByRole('button', { name: 'Create success alert' }).click()
  await page.getByRole('button', { name: 'Create warning alert' }).click()
  await page.getByRole('button', { name: 'Create error alert' }).click()

  const alerts = page.locator('[data-alert-severity]')

  await expect(alerts).toHaveCount(3)
  await expect(alerts.nth(0)).toContainText('Error')
  await expect(alerts.nth(1)).toContainText('Warning')
  await expect(alerts.nth(2)).toContainText('Success')

  const desktopAlertBox = await alerts.nth(0).boundingBox()
  const desktopViewport = page.viewportSize()

  expect(desktopAlertBox).not.toBeNull()
  expect(desktopViewport).not.toBeNull()
  expect(
    desktopViewport!.width - (desktopAlertBox!.x + desktopAlertBox!.width),
  ).toBeLessThanOrEqual(64)

  await page.getByRole('button', { name: 'Dismiss warning notification' }).click()
  await expect(alerts).toHaveCount(2)
  await expect(page.getByText('Review the ride details before continuing.')).toBeHidden()

  await page.setViewportSize({ width: 390, height: 844 })

  const mobileAlertBox = await alerts.nth(0).boundingBox()

  expect(mobileAlertBox).not.toBeNull()
  expect(mobileAlertBox!.x).toBeLessThanOrEqual(20)
  expect(mobileAlertBox!.width).toBeGreaterThanOrEqual(350)
  expect(390 - (mobileAlertBox!.x + mobileAlertBox!.width)).toBeLessThanOrEqual(20)
})
