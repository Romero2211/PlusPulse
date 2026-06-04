import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test('unauthenticated user is redirected from admin page to login', async ({ page }) => {
  await page.goto('/admin')

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Вхід' })).toBeVisible()
})

test('admin can sign in and open dashboard', async ({ page }) => {
  await loginAsAdmin(page)

  await page.goto('/admin')

  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Адмін-панель' })).toBeVisible()
  await expect(page.locator('main').getByRole('link', { name: 'Заходи' })).toBeVisible()
})

test('contact feedback is saved and visible to admin', async ({ page }) => {
  const unique = `integration-${Date.now()}`
  const message = `Інтеграційний тест перевіряє збереження зворотного зв'язку ${unique}`

  await page.goto('/contacts')
  await page.getByLabel("Ім’я (необов’язково)").fill('Тестовий користувач')
  await page.getByLabel('Електронна пошта (необов’язково)').fill('feedback.integration@example.com')
  await page.getByLabel('Повідомлення').fill(message)
  await page.getByRole('button', { name: 'Надіслати' }).click()

  await expect(page.getByRole('status')).toHaveText('Дякуємо! Ваше повідомлення збережено.')

  await loginAsAdmin(page)
  await page.goto('/admin/feedback')

  await expect(page.getByRole('heading', { name: 'Побажання та зворотний зв’язок' })).toBeVisible()
  await expect(page.getByText(message)).toBeVisible()
  await expect(page.getByText('feedback.integration@example.com')).toBeVisible()
})
