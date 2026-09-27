import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApplication } from '../src/app.js';

describe('postcode journey', () => {
  it('displays the postcode form', async () => {
    const application = createApplication();

    const response = await request(application).get('/address');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/^text\/html/);
    expect(response.text).toContain('What is your postcode?');
    expect(response.text).toContain('action="/address"');
    expect(response.text).toContain('name="postcode"');
  });

  it('shows an accessible error when the postcode is empty', async () => {
    const application = createApplication();

    const response = await request(application)
      .post('/address')
      .type('form')
      .send({ postcode: '   ' });

    expect(response.status).toBe(400);
    expect(response.text).toContain('<title>Error: What is your postcode?');
    expect(response.text).toContain('There is a problem');
    expect(response.text).toContain('Enter your postcode');
    expect(response.text).toContain('href="#postcode"');
    expect(response.text).toMatch(
      /<input[^>]+id="postcode"[^>]+aria-describedby="[^"]*postcode-error/,
    );
  });

  it('normalises and stores the postcode before redirecting', async () => {
    const application = createApplication();
    const browser = request.agent(application);

    const submissionResponse = await browser
      .post('/address')
      .type('form')
      .send({ postcode: '  bt9 7ep  ' });

    expect(submissionResponse.status).toBe(303);
    expect(submissionResponse.headers.location).toBe('/address-confirmed');

    const confirmationResponse = await browser.get('/address-confirmed');

    expect(confirmationResponse.status).toBe(200);
    expect(confirmationResponse.text).toContain('Postcode captured');
    expect(confirmationResponse.text).toContain('<strong>BT9 7EP</strong>');
    expect(confirmationResponse.text).toMatch(/no\s+address has been found yet/);

    const refreshedResponse = await browser.get('/address-confirmed');

    expect(refreshedResponse.status).toBe(200);
    expect(refreshedResponse.text).toContain('<strong>BT9 7EP</strong>');
  });

  it('returns to postcode entry when no postcode has been stored', async () => {
    const application = createApplication();

    const response = await request(application).get('/address-confirmed');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/address');
  });
});
