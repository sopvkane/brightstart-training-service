import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createApplication } from '../src/app.js';
import { createRequestId, isValidRequestId } from '../src/request-context.js';

describe('request context', () => {
  it('preserves a valid incoming request ID', async () => {
    const response = await request(createApplication({ requestLogger: vi.fn() }))
      .get('/')
      .set('X-Request-Id', 'training-request-123');

    expect(response.headers['x-request-id']).toBe('training-request-123');
  });

  it('creates a request ID when the incoming value is absent or unsafe', async () => {
    const absent = await request(createApplication({ requestLogger: vi.fn() })).get('/');
    const unsafe = await request(createApplication({ requestLogger: vi.fn() }))
      .get('/')
      .set('X-Request-Id', 'not valid because it has spaces');

    expect(isValidRequestId(absent.headers['x-request-id'])).toBe(true);
    expect(isValidRequestId(unsafe.headers['x-request-id'])).toBe(true);
    expect(unsafe.headers['x-request-id']).not.toBe('not valid because it has spaces');
  });

  it('creates different IDs for separate requests', () => {
    expect(createRequestId()).not.toBe(createRequestId());
  });
});
