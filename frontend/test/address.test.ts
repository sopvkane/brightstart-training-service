import request from 'supertest';
import { describe, expect, it } from 'vitest';

import type { Address, AddressLookupClient } from '../src/address-api-client.js';
import { createApplication } from '../src/app.js';

type Browser = ReturnType<typeof request.agent>;

const multipleAddresses: Address[] = [
  {
    id: 'bt9-7ep-1',
    line1: '1 Apprentice Avenue',
    line2: 'Learning Quarter',
    town: 'Belfast',
    postcode: 'BT9 7EP',
  },
  {
    id: 'bt9-7ep-2',
    line1: '2 Pair Programming Place',
    line2: 'Learning Quarter',
    town: 'Belfast',
    postcode: 'BT9 7EP',
  },
];

function clientReturning(addresses: Address[]): AddressLookupClient {
  return {
    findAddresses: async () => Promise.resolve(addresses),
  };
}

function readCsrfToken(page: string): string {
  const match = page.match(/name="_csrf" value="([^"]+)"/);
  const token = match?.[1];

  if (token === undefined) {
    throw new Error('Expected the page to contain a CSRF token.');
  }

  return token;
}

async function getCsrfToken(browser: Browser, path: string): Promise<string> {
  const response = await browser.get(path);

  return readCsrfToken(response.text);
}

async function submitPostcode(browser: Browser, postcode: string) {
  const csrfToken = await getCsrfToken(browser, '/address');

  return browser.post('/address').type('form').send({ _csrf: csrfToken, postcode });
}

describe('postcode and address journey', () => {
  it('displays the postcode form', async () => {
    const application = createApplication();

    const response = await request(application).get('/address');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/^text\/html/);
    expect(response.text).toContain('What is your postcode?');
    expect(response.text).toContain('action="/address"');
    expect(response.text).toContain('name="_csrf"');
    expect(response.text).toContain('name="postcode"');
  });

  it('shows an accessible error when the postcode is empty', async () => {
    const browser = request.agent(createApplication());
    const response = await submitPostcode(browser, '   ');

    expect(response.status).toBe(400);
    expect(response.text).toContain('<title>Error: What is your postcode?');
    expect(response.text).toContain('There is a problem');
    expect(response.text).toContain('Enter your postcode');
    expect(response.text).toContain('href="#postcode"');
    expect(response.text).toMatch(
      /<input[^>]+id="postcode"[^>]+aria-describedby="[^"]*postcode-error/,
    );
  });

  it('uses the postcode stored in the session to look up multiple addresses', async () => {
    let requestedPostcode = '';
    const addressLookupClient: AddressLookupClient = {
      findAddresses: async (postcode) => {
        requestedPostcode = postcode;
        return Promise.resolve(multipleAddresses);
      },
    };
    const browser = request.agent(createApplication({ addressLookupClient }));

    const submissionResponse = await submitPostcode(browser, '  bt9 7ep  ');

    expect(submissionResponse.status).toBe(303);
    expect(submissionResponse.headers.location).toBe('/select-address');

    const selectionResponse = await browser.get('/select-address');

    expect(requestedPostcode).toBe('BT9 7EP');
    expect(selectionResponse.status).toBe(200);
    expect(selectionResponse.text).toContain('Select your address');
    expect(selectionResponse.text).toContain('1 Apprentice Avenue');
    expect(selectionResponse.text).toContain('2 Pair Programming Place');
  });

  it('renders a single returned address', async () => {
    const oneAddress: Address[] = [
      {
        id: 'zz1-1zz-1',
        line1: '1 Learning Lane',
        line2: '',
        town: 'Exampleton',
        postcode: 'ZZ1 1ZZ',
      },
    ];
    const browser = request.agent(
      createApplication({ addressLookupClient: clientReturning(oneAddress) }),
    );
    await submitPostcode(browser, 'ZZ1 1ZZ');

    const response = await browser.get('/select-address');

    expect(response.status).toBe(200);
    expect(response.text).toContain('1 Learning Lane');
    expect(response.text).toContain('Exampleton');
    expect(response.text).toContain('name="addressId"');
  });

  it('explains when no addresses are returned', async () => {
    const browser = request.agent(createApplication({ addressLookupClient: clientReturning([]) }));
    await submitPostcode(browser, 'AA1 1AA');

    const response = await browser.get('/select-address');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<title>No addresses found - BrightStart Training Service');
    expect(response.text).toContain('No addresses found');
    expect(response.text).toContain('We could not find any addresses for AA1 1AA');
    expect(response.text).toContain('Check the postcode and try again');
  });

  it('shows a clear error when the address API is unavailable', async () => {
    const failingClient: AddressLookupClient = {
      findAddresses: async () => Promise.reject(new Error('API unavailable')),
    };
    const browser = request.agent(createApplication({ addressLookupClient: failingClient }));
    await submitPostcode(browser, 'ZZ9 9ZZ');

    const response = await browser.get('/select-address');

    expect(response.status).toBe(503);
    expect(response.text).toContain('We cannot find addresses right now');
    expect(response.text).toContain('Try the address lookup again');
    expect(response.text).not.toContain('API unavailable');
  });

  it('shows an accessible error when no address is selected', async () => {
    const browser = request.agent(
      createApplication({ addressLookupClient: clientReturning(multipleAddresses) }),
    );
    await submitPostcode(browser, 'BT9 7EP');
    const csrfToken = await getCsrfToken(browser, '/select-address');

    const response = await browser.post('/select-address').type('form').send({ _csrf: csrfToken });

    expect(response.status).toBe(400);
    expect(response.text).toContain('<title>Error: Select your address');
    expect(response.text).toContain('There is a problem');
    expect(response.text).toContain('Select an address');
    expect(response.text).toContain('href="#addressId"');
    expect(response.text).toMatch(/<fieldset[^>]+aria-describedby="[^"]*addressId-error/);
  });

  it('stores and displays the selected address after a 303 redirect', async () => {
    const browser = request.agent(
      createApplication({ addressLookupClient: clientReturning(multipleAddresses) }),
    );
    await submitPostcode(browser, 'BT9 7EP');
    const csrfToken = await getCsrfToken(browser, '/select-address');

    const selectionResponse = await browser
      .post('/select-address')
      .type('form')
      .send({ _csrf: csrfToken, addressId: 'bt9-7ep-2' });

    expect(selectionResponse.status).toBe(303);
    expect(selectionResponse.headers.location).toBe('/address-confirmed');

    const confirmationResponse = await browser.get('/address-confirmed');

    expect(confirmationResponse.status).toBe(200);
    expect(confirmationResponse.text).toContain('Address selected');
    expect(confirmationResponse.text).toContain('2 Pair Programming Place');
    expect(confirmationResponse.text).toContain('BT9 7EP');

    const refreshedResponse = await browser.get('/address-confirmed');
    expect(refreshedResponse.text).toContain('2 Pair Programming Place');
  });

  it('does not accept an address ID that the API did not return', async () => {
    const browser = request.agent(
      createApplication({ addressLookupClient: clientReturning(multipleAddresses) }),
    );
    await submitPostcode(browser, 'BT9 7EP');
    const csrfToken = await getCsrfToken(browser, '/select-address');

    const response = await browser
      .post('/select-address')
      .type('form')
      .send({ _csrf: csrfToken, addressId: 'invented-address' });

    expect(response.status).toBe(400);
    expect(response.text).toContain('Select an address');
  });

  it('returns to postcode entry when no postcode has been stored', async () => {
    const application = createApplication();

    const response = await request(application).get('/select-address');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/address');
  });

  it('returns to address selection when no selected address has been stored', async () => {
    const browser = request.agent(createApplication());
    await submitPostcode(browser, 'BT9 7EP');

    const response = await browser.get('/address-confirmed');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/select-address');
  });

  it('rejects a form submission without the CSRF token', async () => {
    const browser = request.agent(createApplication());
    await browser.get('/address');

    const response = await browser.post('/address').type('form').send({ postcode: 'BT9 7EP' });

    expect(response.status).toBe(403);
    expect(response.text).toContain('Your form could not be submitted');
    expect(response.text).toContain('Return to postcode entry');
  });

  it('rejects a form submission with the wrong CSRF token', async () => {
    const browser = request.agent(createApplication());
    await browser.get('/address');

    const response = await browser
      .post('/address')
      .type('form')
      .send({ _csrf: 'not-the-session-token', postcode: 'BT9 7EP' });

    expect(response.status).toBe(403);
    expect(response.text).toContain('Your form could not be submitted');
  });
});
