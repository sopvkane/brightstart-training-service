import { expect, test } from '@playwright/test';

import { syntheticPng } from './fixtures/synthetic-document.js';

test('follows the journey from postcode to a synthetic result', async ({ page }) => {
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

  await expect(page).toHaveURL('/upload-document');
  await page.getByLabel('Choose an image').setInputFiles(syntheticPng);
  await page.getByRole('button', { name: 'Upload and continue' }).click();

  await expect(page).toHaveURL('/document-uploaded');
  await expect(page.getByRole('heading', { name: 'Document image accepted' })).toBeVisible();
  await expect(page.getByText('synthetic-training-document.png')).toBeVisible();
  const confirmationImage = page.getByRole('img', { name: 'Uploaded passport image' });
  await expect(confirmationImage).toBeVisible();
  await expect
    .poll(() =>
      confirmationImage.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await expect(page.getByText(/has not been used to verify your identity/)).toBeVisible();

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL('/check-your-answers');
  await expect(page.getByRole('heading', { name: 'Check your answers' })).toBeVisible();
  await expect(
    page.getByText(/2 Pair Programming Place, Learning Quarter, Belfast, BT9 7EP/),
  ).toBeVisible();
  await expect(page.getByText('Passport', { exact: true })).toBeVisible();
  await expect(page.getByText('synthetic-training-document.png (PNG)')).toBeVisible();

  await page.getByRole('button', { name: 'Accept and submit' }).click();

  await expect(page).toHaveURL('/result');
  await expect(page.getByRole('heading', { name: 'Training journey completed' })).toBeVisible();
  await expect(page.getByText('Synthetic result: Accepted')).toBeVisible();
  await expect(page.getByText(/Submission reference: BST-/)).toBeVisible();
  await expect(page.getByText(/Identity document: Passport/)).toBeVisible();
  await expect(page.getByText(/No real identity check or government decision/)).toBeVisible();

  const uploadedImage = page.getByRole('img', { name: 'Uploaded passport image' });
  await expect(uploadedImage).toBeVisible();
  await expect
    .poll(() =>
      uploadedImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
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
