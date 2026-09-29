import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDocumentImageClient } from '../src/document-image-client.js';

afterEach(() => vi.unstubAllGlobals());

describe('document image client', () => {
  it.each(['image/jpeg', 'image/png'] as const)(
    'returns trusted %s binary content',
    async (contentType) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(new Uint8Array([1, 2, 3]), {
            status: 200,
            headers: { 'content-type': contentType },
          }),
        ),
      );

      const image = await createDocumentImageClient('http://localhost:8080').getImage('a/b');

      expect(image.contentType).toBe(contentType);
      expect(image.bytes).toEqual(new Uint8Array([1, 2, 3]));
      expect(fetch).toHaveBeenCalledWith(
        new URL('http://localhost:8080/api/document-uploads/a%2Fb/content'),
        expect.any(Object),
      );
    },
  );

  it.each([
    new Response(null, { status: 404 }),
    new Response(null, { status: 503 }),
    new Response(new Uint8Array([1]), {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    }),
  ])('rejects missing, unavailable or unsafe responses', async (response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    await expect(
      createDocumentImageClient('http://localhost:8080').getImage('upload-123'),
    ).rejects.toHaveProperty('name', 'DocumentImageError');
  });

  it('handles a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('unavailable')));

    await expect(
      createDocumentImageClient('http://localhost:8080').getImage('upload-123'),
    ).rejects.toMatchObject({ name: 'DocumentImageError', reason: 'unavailable' });
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
      createDocumentImageClient('http://localhost:8080', 1).getImage('upload-123'),
    ).rejects.toMatchObject({ name: 'DocumentImageError', reason: 'unavailable' });
  });
});
