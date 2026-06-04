import { expect, test } from '@playwright/test'

test('public home page opens and navigation leads to events', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Благодійна організація' })).toBeVisible()
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Заходи' })).toBeVisible()

  await page.getByRole('navigation').getByRole('link', { name: 'Заходи' }).click()

  await expect(page).toHaveURL(/\/events$/)
  await expect(page.getByRole('heading', { name: 'Волонтерські заходи' })).toBeVisible()
})
