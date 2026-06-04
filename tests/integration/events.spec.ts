import { expect, test } from '@playwright/test'

test('events page filters by search and Kyiv district', async ({ page }) => {
  await page.goto('/events')

  await expect(page.getByRole('heading', { name: 'Волонтерські заходи' })).toBeVisible()
  await expect(page.getByText('Голосіївський суботник')).toBeVisible()
  await expect(page.getByText('Оболонська зустріч волонтерів')).toBeVisible()

  await page.getByRole('searchbox', { name: 'Пошук' }).fill('Оболонська')

  await expect(page.getByText('Оболонська зустріч волонтерів')).toBeVisible()
  await expect(page.getByText('Голосіївський суботник')).toHaveCount(0)

  await page.getByRole('button', { name: 'Скинути всі фільтри' }).click()
  await expect(page.getByText('Голосіївський суботник')).toBeVisible()

  await page.getByRole('combobox', { name: 'Район Києва' }).selectOption('holosiivskyi')

  await expect(page.getByText('Голосіївський суботник')).toBeVisible()
  await expect(page.getByText('Оболонська зустріч волонтерів')).toHaveCount(0)
  await expect(page.getByText(/Показано:\s*1 з 2/)).toBeVisible()
})
