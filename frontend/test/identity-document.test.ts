import request from 'supertest';
import { describe, expect, it } from 'vitest';

import type { AddressJourney } from '../src/address-journey-service.js';
import { createApplication } from '../src/app.js';
import type { Address } from '../src/domain/address.js';
import type { IdentityDocumentType } from '../src/domain/identity-document.js';

type Browser = ReturnType<typeof request.agent>;

const selectedAddress: Address = {
  id: 'bt9-7ep-1',
  line1: '1 Apprentice Avenue',
  line2: 'Learning Quarter',
  town: 'Belfast',
  postcode: 'BT9 7EP',
};

const addressJourney: AddressJourney = {
  findAddresses: async () => Promise.resolve([selectedAddress]),
  selectAddress: async (_postcode, submittedAddressId) =>
    Promise.resolve({
      addresses: [selectedAddress],
      selectedAddress: submittedAddressId === selectedAddress.id ? selectedAddress : undefined,
    }),
};

function readCsrfToken(page: string): string {
  const token = page.match(/name="_csrf" value="([^"]+)"/)?.[1];

  if (token === undefined) {
    throw new Error('Expected the page to contain a CSRF token.');
  }

  return token;
}

async function submitForm(browser: Browser, path: string, values: Record<string, string> = {}) {
  const formResponse = await browser.get(path);
  const csrfToken = readCsrfToken(formResponse.text);

  return browser
    .post(path)
    .type('form')
    .send({ _csrf: csrfToken, ...values });
}

async function reachAddressConfirmation(browser: Browser): Promise<void> {
  await submitForm(browser, '/address', { postcode: 'BT9 7EP' });
  await submitForm(browser, '/select-address', { addressId: selectedAddress.id });
}

async function selectDocument(browser: Browser, identityDocument: IdentityDocumentType) {
  return submitForm(browser, '/identity-document', { identityDocument });
}

describe('identity document and guidance journey', () => {
  it('continues from address confirmation to identity document selection', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await reachAddressConfirmation(browser);

    const response = await browser.get('/address-confirmed');

    expect(response.status).toBe(200);
    expect(response.text).toContain('href="/identity-document"');
    expect(response.text).toContain('Continue');
  });

  it('displays all supported identity document options', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await reachAddressConfirmation(browser);

    const response = await browser.get('/identity-document');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Which identity document do you have?');
    expect(response.text).toContain('value="passport"');
    expect(response.text).toContain('Passport');
    expect(response.text).toContain('value="driving-licence"');
    expect(response.text).toContain('Driving licence');
    expect(response.text).toContain('value="national-identity-card"');
    expect(response.text).toContain('National identity card');
    expect(response.text.match(/name="identityDocument"/g)).toHaveLength(3);
  });

  it('shows an accessible error when no identity document is selected', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await reachAddressConfirmation(browser);

    const response = await submitForm(browser, '/identity-document');

    expect(response.status).toBe(400);
    expect(response.text).toContain('<title>Error: Which identity document do you have?');
    expect(response.text).toContain('There is a problem');
    expect(response.text).toContain('Select an identity document');
    expect(response.text).toContain('href="#identityDocument"');
    expect(response.text).toMatch(/<fieldset[^>]+aria-describedby="[^"]*identityDocument-error/);
  });

  it('rejects a manipulated identity document value', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await reachAddressConfirmation(browser);

    const response = await submitForm(browser, '/identity-document', {
      identityDocument: 'library-card',
    });

    expect(response.status).toBe(400);
    expect(response.text).toContain('Select an identity document');

    const guidanceResponse = await browser.get('/document-guidance');
    expect(guidanceResponse.status).toBe(302);
    expect(guidanceResponse.headers.location).toBe('/identity-document');
  });

  it('stores a valid selection and displays driving licence guidance after a 303 redirect', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await reachAddressConfirmation(browser);

    const selectionResponse = await selectDocument(browser, 'driving-licence');

    expect(selectionResponse.status).toBe(303);
    expect(selectionResponse.headers.location).toBe('/document-guidance');

    const guidanceResponse = await browser.get('/document-guidance');
    expect(guidanceResponse.status).toBe(200);
    expect(guidanceResponse.text).toContain('Get your driving licence ready');
    expect(guidanceResponse.text).toContain('front of your driving licence');
    expect(guidanceResponse.text).toContain('The image and text are clear');
  });

  it('preselects the stored option when the form is revisited', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await reachAddressConfirmation(browser);
    await selectDocument(browser, 'national-identity-card');

    const response = await browser.get('/identity-document');

    expect(response.status).toBe(200);
    expect(response.text).toMatch(/<input[^>]+value="national-identity-card"[^>]+checked/);
  });

  it('displays passport guidance and continues to document upload', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await reachAddressConfirmation(browser);
    await selectDocument(browser, 'passport');

    const guidanceResponse = await browser.get('/document-guidance');

    expect(guidanceResponse.status).toBe(200);
    expect(guidanceResponse.text).toContain('Get your passport ready');
    expect(guidanceResponse.text).toContain('photo and details page of your passport');
    expect(guidanceResponse.text).toContain('The full page is visible');
    expect(guidanceResponse.text).toContain('href="/upload-document"');
  });

  it('displays national identity card guidance', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await reachAddressConfirmation(browser);
    await selectDocument(browser, 'national-identity-card');

    const response = await browser.get('/document-guidance');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Get your national identity card ready');
    expect(response.text).toContain('front of your identity card');
    expect(response.text).toContain('The details can be read');
  });

  it('uses the stored selection rather than a browser query parameter', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await reachAddressConfirmation(browser);
    await selectDocument(browser, 'passport');

    const response = await browser.get('/document-guidance?identityDocument=driving-licence');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Get your passport ready');
    expect(response.text).not.toContain('front of your driving licence');
  });

  it('changes only the selected identity document', async () => {
    const browser = request.agent(createApplication({ addressJourney }));
    await reachAddressConfirmation(browser);
    await selectDocument(browser, 'passport');

    await selectDocument(browser, 'driving-licence');

    const addressResponse = await browser.get('/address-confirmed');
    expect(addressResponse.status).toBe(200);
    expect(addressResponse.text).toContain('1 Apprentice Avenue');

    const guidanceResponse = await browser.get('/document-guidance');
    expect(guidanceResponse.text).toContain('Get your driving licence ready');
    expect(guidanceResponse.text).not.toContain('Get your passport ready');
  });

  it('redirects direct access when the required journey state is missing', async () => {
    const browser = request.agent(createApplication());

    const selectionResponse = await browser.get('/identity-document');
    const guidanceResponse = await browser.get('/document-guidance');

    expect(selectionResponse.status).toBe(302);
    expect(selectionResponse.headers.location).toBe('/select-address');
    expect(guidanceResponse.status).toBe(302);
    expect(guidanceResponse.headers.location).toBe('/identity-document');
  });
});
