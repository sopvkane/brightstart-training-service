import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Submission } from '../src/domain/submission.js';
import { createSubmissionApiClient } from '../src/submission-api-client.js';

const submission: Submission = {
  address: {
    id: 'bt9-7ep-1',
    line1: '1 Apprentice Avenue',
    line2: 'Learning Quarter',
    town: 'Belfast',
    postcode: 'BT9 7EP',
  },
  identityDocument: 'passport',
  documentUploadId: 'upload-123',
};

afterEach(() => vi.unstubAllGlobals());

describe('submission API client', () => {
  it('posts JSON and returns a validated domain result', async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ submissionId: 'BST-123', decision: 'ACCEPTED', ignored: 'transport' }),
          { status: 201, headers: { 'content-type': 'application/json' } },
        ),
      );
    vi.stubGlobal('fetch', fetchStub);

    const result = await createSubmissionApiClient('http://localhost:8080').submit(submission);

    expect(result).toEqual({ submissionId: 'BST-123', decision: 'ACCEPTED' });
    expect(fetchStub).toHaveBeenCalledWith(
      new URL('http://localhost:8080/api/submissions'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(submission),
      }),
    );
  });

  it.each([
    new Response(null, { status: 400 }),
    new Response(JSON.stringify({ decision: 'ACCEPTED' }), { status: 201 }),
    new Response('not json', { status: 201 }),
  ])('rejects unsuccessful or malformed responses', async (response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    await expect(
      createSubmissionApiClient('http://localhost:8080').submit(submission),
    ).rejects.toHaveProperty('name', 'SubmissionApiError');
  });

  it('handles a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('unavailable')));

    await expect(
      createSubmissionApiClient('http://localhost:8080', 5).submit(submission),
    ).rejects.toHaveProperty('name', 'SubmissionApiError');
  });

  it('stops waiting after the configured timeout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: URL, options: RequestInit) => {
        return new Promise((_resolve, reject) => {
          options.signal?.addEventListener('abort', () => reject(new Error('timed out')));
        });
      }),
    );

    await expect(
      createSubmissionApiClient('http://localhost:8080', 1).submit(submission),
    ).rejects.toHaveProperty('name', 'SubmissionApiError');
  });
});
