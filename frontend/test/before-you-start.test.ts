import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApplication } from '../src/app.js';

describe('GET /before-you-start', () => {
  it('returns a successful HTML response', async () => {
    const application = createApplication();

    const response = await request(application).get('/before-you-start');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/^text\/html/);
  });

  it('explains what information may be needed', async () => {
    const application = createApplication();

    const response = await request(application).get('/before-you-start');

    expect(response.text).toMatch(/<h1[^>]*>Before you start<\/h1>/);
    expect(response.text).toContain('your address');
    expect(response.text).toContain('which identity document you have');
    expect(response.text).toContain('an image of a document');
    expect(response.text).toContain('This is a fictional training service');
  });

  it('links back to the start page', async () => {
    const application = createApplication();

    const response = await request(application).get('/before-you-start');

    expect(response.text).toMatch(/<a[^>]+href="\/"[^>]*>\s*Back\s*<\/a>/);
  });
});
