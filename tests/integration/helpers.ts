import { expect, type Page } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  const main = page.locator('main')
  await main.getByLabel('Електронна пошта').fill('admin.integration@example.com')
  await main.getByLabel('Пароль').fill('AdminPass123!')
  await main.getByRole('button', { name: 'Увійти' }).click()
  await expect(page).toHaveURL(/\/$/)
}
