import { expect, test } from '@playwright/test'

test('public home page opens and events page is reachable', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Разом — ми змінюємо життя' })).toBeVisible()

  await page.goto('/events')

  await expect(page).toHaveURL(/\/events$/)
  await expect(page.getByRole('heading', { name: 'Волонтерські заходи' })).toBeVisible()
})
