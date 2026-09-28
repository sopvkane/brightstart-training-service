import request from 'supertest';
import { describe, expect, it } from 'vitest';

import type { AddressJourney } from '../src/address-journey-service.js';
import type { DocumentUploadClient } from '../src/document-upload-client.js';
import { createApplication } from '../src/app.js';
import type { Address } from '../src/domain/address.js';
import type { DocumentUploadReceipt } from '../src/domain/document-upload.js';

type Browser = ReturnType<typeof request.agent>;

const firstAddress: Address = {
  id: 'bt9-7ep-1',
  line1: '1 Apprentice Avenue',
  line2: 'Learning Quarter',
  town: 'Belfast',
  postcode: 'BT9 7EP',
};

const secondAddress: Address = {
  id: 'bt9-7ep-2',
  line1: '2 Pair Programming Place',
  line2: '',
  town: 'Belfast',
  postcode: 'BT9 7EP',
};

const firstReceipt: DocumentUploadReceipt = {
  uploadId: 'training-upload-123',
  fileName: 'synthetic-passport.jpg',
  contentType: 'image/jpeg',
  size: 4,
};

const replacementReceipt: DocumentUploadReceipt = {
  uploadId: 'training-upload-456',
  fileName: 'replacement-passport.png',
  contentType: 'image/png',
  size: 8,
};

const addressJourney: AddressJourney = {
  findAddresses: async () => Promise.resolve([firstAddress, secondAddress]),
  selectAddress: async (_postcode, submittedAddressId) =>
    Promise.resolve({
      addresses: [firstAddress, secondAddress],
      selectedAddress: [firstAddress, secondAddress].find(
        (address) => address.id === submittedAddressId,
      ),
    }),
};

function clientReturningReceipts(...receipts: DocumentUploadReceipt[]): DocumentUploadClient {
  let uploadNumber = 0;

  return {
    uploadDocument: () => {
      const receipt = receipts[uploadNumber];
      uploadNumber += 1;

      if (receipt === undefined) {
        throw new Error('The test did not provide a receipt for this upload.');
      }

      return Promise.resolve(receipt);
    },
  };
}

function readCsrfToken(page: string): string {
  const token = page.match(/name="_csrf" value="([^"]+)"/)?.[1];

  if (token === undefined) {
    throw new Error('Expected the page to contain a CSRF token.');
  }

  return token;
}

async function submitForm(browser: Browser, path: string, values: Record<string, string>) {
  const page = await browser.get(path);
  const csrfToken = readCsrfToken(page.text);

  return browser
    .post(path)
    .type('form')
    .send({ _csrf: csrfToken, ...values });
}

async function selectAddress(browser: Browser, addressId = firstAddress.id): Promise<void> {
  await submitForm(browser, '/address', { postcode: 'BT9 7EP' });
  await submitForm(browser, '/select-address', { addressId });
}

async function selectIdentityDocument(browser: Browser): Promise<void> {
  await submitForm(browser, '/identity-document', { identityDocument: 'passport' });
}

async function uploadDocument(
  browser: Browser,
  fileName = 'synthetic-passport.jpg',
): Promise<void> {
  const page = await browser.get('/upload-document');
  const csrfToken = readCsrfToken(page.text);

  await browser
    .post('/upload-document')
    .field('_csrf', csrfToken)
    .attach('document', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), {
      filename: fileName,
      contentType: 'image/jpeg',
    });
}

async function completeJourney(browser: Browser): Promise<void> {
  await selectAddress(browser);
  await selectIdentityDocument(browser);
  await uploadDocument(browser);
}

describe('check your answers journey', () => {
  it('shows the complete journey using safe display values and accessible Change links', async () => {
    const browser = request.agent(
      createApplication({
        addressJourney,
        documentUploadClient: clientReturningReceipts(firstReceipt),
      }),
    );
    await completeJourney(browser);

    const response = await browser.get('/check-your-answers');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<h1 class="govuk-heading-xl">Check your answers</h1>');
    expect(response.text).toContain('1 Apprentice Avenue, Learning Quarter, Belfast, BT9 7EP');
    expect(response.text).toContain('Passport');
    expect(response.text).toContain('synthetic-passport.jpg (JPEG)');
    expect(response.text).not.toContain(firstReceipt.uploadId);
    expect(response.text).toContain('href="/address"');
    expect(response.text).toContain('href="/identity-document"');
    expect(response.text).toContain('href="/upload-document"');
    expect(response.text).toMatch(/Change\s*<span[^>]*> address<\/span>/);
    expect(response.text).toMatch(/Change\s*<span[^>]*> identity document<\/span>/);
    expect(response.text).toMatch(/Change\s*<span[^>]*> uploaded document<\/span>/);
  });

  it('redirects to address selection when no address has been selected', async () => {
    const response = await request(createApplication()).get('/check-your-answers');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/select-address');
  });

  it('redirects to identity document selection when that answer is missing', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await selectAddress(browser);

    const response = await browser.get('/check-your-answers');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/identity-document');
  });

  it('redirects to document upload when no upload has been accepted', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await selectAddress(browser);
    await selectIdentityDocument(browser);

    const response = await browser.get('/check-your-answers');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/upload-document');
  });

  it('preserves document state when the selected address changes', async () => {
    const browser = request.agent(
      createApplication({
        addressJourney,
        documentUploadClient: clientReturningReceipts(firstReceipt),
      }),
    );
    await completeJourney(browser);

    const addressPage = await browser.get('/address');
    expect(addressPage.text).toContain('value="BT9 7EP"');
    await submitForm(browser, '/address', { postcode: 'BT9 7EP' });
    const selectionPage = await browser.get('/select-address');
    expect(selectionPage.text).toMatch(/<input[^>]+value="bt9-7ep-1"[^>]+checked/);
    await submitForm(browser, '/select-address', { addressId: secondAddress.id });
    const response = await browser.get('/check-your-answers');

    expect(response.status).toBe(200);
    expect(response.text).toContain('2 Pair Programming Place, Belfast, BT9 7EP');
    expect(response.text).toContain('Passport');
    expect(response.text).toContain('synthetic-passport.jpg (JPEG)');
  });

  it('replaces only upload metadata when a new document is accepted', async () => {
    const browser = request.agent(
      createApplication({
        addressJourney,
        documentUploadClient: clientReturningReceipts(firstReceipt, replacementReceipt),
      }),
    );
    await completeJourney(browser);

    await uploadDocument(browser, 'replacement-passport.png');
    const response = await browser.get('/check-your-answers');

    expect(response.status).toBe(200);
    expect(response.text).toContain('1 Apprentice Avenue');
    expect(response.text).toContain('Passport');
    expect(response.text).toContain('replacement-passport.png (PNG)');
    expect(response.text).not.toContain('synthetic-passport.jpg');
  });

  it('continues to a page that clearly says nothing has been submitted', async () => {
    const browser = request.agent(
      createApplication({
        addressJourney,
        documentUploadClient: clientReturningReceipts(firstReceipt),
      }),
    );
    await completeJourney(browser);

    const checkAnswersResponse = await browser.get('/check-your-answers');
    expect(checkAnswersResponse.text).toContain('href="/ready-to-submit"');

    const readyResponse = await browser.get('/ready-to-submit');
    expect(readyResponse.status).toBe(200);
    expect(readyResponse.text).toContain('Ready to submit');
    expect(readyResponse.text).toContain('You have reviewed your answers');
    expect(readyResponse.text).toContain('Nothing has been submitted for a decision');
    expect(readyResponse.text).not.toContain('identity confirmed');
    expect(readyResponse.text).not.toContain('decision has been made');
  });
});
