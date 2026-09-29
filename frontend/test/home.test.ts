import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApplication } from '../src/app.js';

describe('GET /', () => {
  it('returns a successful HTML response', async () => {
    const application = createApplication();

    const response = await request(application).get('/');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/^text\/html/);
  });

  it('explains the service purpose', async () => {
    const application = createApplication();

    const response = await request(application).get('/');

    expect(response.text).toMatch(/<h1[^>]*>BrightStart Training Service Repo<\/h1>/);
    expect(response.text).toContain(
      'confirm your details and identity before accessing a fictional government',
    );
    expect(response.text).toContain('This is a fictional training service');
    expect(response.text).toContain('It is not a real government service');
    expect(response.text).toContain('confirm your address');
  });

  it('links to the Before you start page', async () => {
    const application = createApplication();

    const response = await request(application).get('/');

    expect(response.text).toMatch(
      /<a[^>]+href="\/before-you-start"[^>]*>[\s\S]*?Start now[\s\S]*?<\/a>/,
    );
  });

  it('provides the accessible page shell', async () => {
    const application = createApplication();

    const response = await request(application).get('/');

    expect(response.text).toMatch(/<html[^>]+lang="en"/);
    expect(response.text).toContain('<title>BrightStart Training Service</title>');
    expect(response.text).toContain('href="#main-content">Skip to main content</a>');
    expect(response.text).toMatch(/<main[^>]+id="main-content"/);
  });

  it('loads the GOV.UK Frontend JavaScript used by page components', async () => {
    const application = createApplication();

    const pageResponse = await request(application).get('/');
    const scriptResponse = await request(application).get('/assets/govuk/govuk-frontend.min.js');

    expect(pageResponse.text).toContain("from '/assets/govuk/govuk-frontend.min.js'");
    expect(scriptResponse.status).toBe(200);
    expect(scriptResponse.headers['content-type']).toMatch(/^text\/javascript/);
  });
});
