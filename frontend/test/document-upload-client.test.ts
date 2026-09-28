import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDocumentUploadClient, type DocumentImage } from '../src/document-upload-client.js';

const documentImage: DocumentImage = {
  fileName: 'synthetic-passport.jpg',
  contentType: 'image/jpeg',
  bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
};

const receipt = {
  uploadId: 'training-upload-123',
  fileName: 'synthetic-passport.jpg',
  contentType: 'image/jpeg',
  size: 4,
} as const;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('document upload API client', () => {
  it('sends the document type and image as multipart form data', async () => {
    const fetchStub = vi
      .fn<(input: string | URL | Request, options?: RequestInit) => Promise<Response>>()
      .mockResolvedValue(
        new Response(JSON.stringify(receipt), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchStub);
    const client = createDocumentUploadClient('http://localhost:8080');

    const returnedReceipt = await client.uploadDocument('passport', documentImage);

    expect(fetchStub).toHaveBeenCalledOnce();
    const requestCall = fetchStub.mock.calls[0];
    expect(requestCall?.[0]).toEqual(new URL('http://localhost:8080/api/document-uploads'));
    expect(requestCall?.[1]?.method).toBe('POST');
    expect(requestCall?.[1]?.headers).toEqual({ accept: 'application/json' });
    expect(requestCall?.[1]?.signal).toBeInstanceOf(AbortSignal);

    const body = requestCall?.[1]?.body;
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('documentType')).toBe('passport');
    expect((body as FormData).get('document')).not.toBeNull();
    expect(returnedReceipt).toEqual(receipt);
  });

  it.each([400, 413, 415])('reports HTTP %s as controlled validation', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })));
    const client = createDocumentUploadClient('http://localhost:8080');

    await expect(client.uploadDocument('passport', documentImage)).rejects.toMatchObject({
      name: 'DocumentUploadError',
      reason: 'validation',
      status,
    });
  });

  it('reports an unexpected successful response as invalid', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ uploadId: 'missing-fields' }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    const client = createDocumentUploadClient('http://localhost:8080');

    await expect(client.uploadDocument('passport', documentImage)).rejects.toMatchObject({
      reason: 'invalid-response',
    });
  });

  it('rejects receipt metadata that exceeds the supported upload limit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ...receipt, size: 5 * 1024 * 1024 + 1 }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    const client = createDocumentUploadClient('http://localhost:8080');

    await expect(client.uploadDocument('passport', documentImage)).rejects.toMatchObject({
      reason: 'invalid-response',
    });
  });

  it('maps only validated receipt metadata into the frontend domain', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ...receipt, unexpectedBytes: 'not journey state' }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    const client = createDocumentUploadClient('http://localhost:8080');

    const returnedReceipt = await client.uploadDocument('passport', documentImage);

    expect(returnedReceipt).toEqual(receipt);
    expect(returnedReceipt).not.toHaveProperty('unexpectedBytes');
  });

  it('reports malformed JSON as an invalid response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('not JSON', {
          status: 201,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    const client = createDocumentUploadClient('http://localhost:8080');

    await expect(client.uploadDocument('passport', documentImage)).rejects.toMatchObject({
      reason: 'invalid-response',
    });
  });

  it('reports a network failure as unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('connection refused')));
    const client = createDocumentUploadClient('http://localhost:8080');

    await expect(client.uploadDocument('passport', documentImage)).rejects.toMatchObject({
      reason: 'unavailable',
    });
  });

  it('stops waiting when the request timeout is reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: URL, options: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          options.signal?.addEventListener('abort', () => reject(new Error('request aborted')));
        });
      }),
    );
    const client = createDocumentUploadClient('http://localhost:8080', 5);

    await expect(client.uploadDocument('passport', documentImage)).rejects.toMatchObject({
      reason: 'unavailable',
    });
  });
});
