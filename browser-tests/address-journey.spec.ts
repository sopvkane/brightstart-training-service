import { expect, test } from '@playwright/test';

test('follows the journey from postcode to document guidance', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Start now' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('What is your postcode?').fill('BT9 7EP');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: /^2 Pair Programming Place/ }).check();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL('/address-confirmed');
  await expect(page.getByRole('heading', { name: 'Address selected' })).toBeVisible();
  await expect(page.getByText(/2 Pair Programming Place/)).toBeVisible();
  await expect(page.getByText(/BT9 7EP/)).toBeVisible();

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: 'Passport' }).check();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL('/document-guidance');
  await expect(page.getByRole('heading', { name: 'Get your passport ready' })).toBeVisible();
  await expect(page.getByText('The full page is visible')).toBeVisible();

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL('/document-ready');
  await expect(page.getByRole('heading', { name: 'Ready for the next step' })).toBeVisible();
  await expect(page.getByText('No document has been uploaded or verified.')).toBeVisible();
});

test('shows an error when the postcode is empty', async ({ page }) => {
  await page.goto('/address');

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveTitle(/Error: What is your postcode/);
  await expect(page.getByRole('heading', { name: 'There is a problem' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Enter your postcode' })).toBeVisible();
  await expect(page.getByLabel('What is your postcode?')).toHaveAccessibleDescription(
    /Enter your postcode/,
  );
});

test('shows an error when no address is selected', async ({ page }) => {
  await page.goto('/address');
  await page.getByLabel('What is your postcode?').fill('BT9 7EP');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveTitle(/Error: Select your address/);
  await expect(page.getByRole('heading', { name: 'There is a problem' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Select an address' })).toBeVisible();
});

test('explains when no addresses are found', async ({ page }) => {
  await page.goto('/address');
  await page.getByLabel('What is your postcode?').fill('AA1 1AA');

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'No addresses found' })).toBeVisible();
  await expect(page.getByText('We could not find any addresses for AA1 1AA.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Check the postcode and try again' })).toBeVisible();
});

test('shows a safe message when address lookup fails', async ({ page }) => {
  await page.goto('/address');
  await page.getByLabel('What is your postcode?').fill('ZZ9 9ZZ');

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(
    page.getByRole('heading', { name: 'We cannot find addresses right now' }),
  ).toBeVisible();
  await expect(
    page.getByText('The address service is unavailable. Try again later.'),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try the address lookup again' })).toBeVisible();
});
