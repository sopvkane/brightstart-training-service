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
    // Arrange
    const application = createApplication();
    // Act
    const response = await request(application).get('/');
    // Assert
    expect(response.text).toMatch(/<h1[^>]*>Start the BrightStart training journey<\/h1>/);
    expect(response.text).toContain(
      'Use this fictional service to practise a simple identity journey from start to submission.',
    );
    expect(response.text).toContain('This is a fictional training service');
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
  it('uses the teal BrightStart theme colour', async () => {
    // Arrange
    const application = createApplication();
    // Act
    const response = await request(application).get('/');
    // Assert
    expect(response.text).toMatch(/<meta name="theme-color" content="#006d77">/i);
  });
});
