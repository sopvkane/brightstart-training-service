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

    expect(response.text).toMatch(/<h1[^>]*>BrightStart Training Service<\/h1>/);
    expect(response.text).toContain(
      'A synthetic service for practising how to investigate, change and test a government-style',
    );
    expect(response.text).toContain('It is not a real government service');
  });

  it('provides the accessible page shell', async () => {
    const application = createApplication();

    const response = await request(application).get('/');

    expect(response.text).toMatch(/<html[^>]+lang="en"/);
    expect(response.text).toContain('<title>BrightStart Training Service</title>');
    expect(response.text).toContain('href="#main-content">Skip to main content</a>');
    expect(response.text).toMatch(/<main[^>]+id="main-content"/);
  });
});
