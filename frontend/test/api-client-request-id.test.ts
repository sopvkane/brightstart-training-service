import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAddressLookupClient } from '../src/address-api-client.js';
import { createDocumentImageClient } from '../src/document-image-client.js';
import { createDocumentUploadClient } from '../src/document-upload-client.js';
import { runWithRequestId } from '../src/request-context.js';
import { createSubmissionApiClient } from '../src/submission-api-client.js';

afterEach(() => vi.unstubAllGlobals());

describe('API client request IDs', () => {
  it('propagates the current request ID through every API client', async () => {
    const fetchStub = vi.fn<typeof fetch>((input) => {
      const url = input instanceof URL || typeof input === 'string' ? input.toString() : input.url;

      if (url.includes('/api/addresses')) {
        return Promise.resolve(Response.json({ addresses: [] }));
      }
      if (url.endsWith('/api/document-uploads')) {
        return Promise.resolve(
          Response.json(
            { uploadId: 'upload-1', fileName: 'image.png', contentType: 'image/png', size: 8 },
            { status: 201 },
          ),
        );
      }
      if (url.endsWith('/content')) {
        return Promise.resolve(
          new Response(new Uint8Array([1]), { headers: { 'content-type': 'image/png' } }),
        );
      }

      return Promise.resolve(
        Response.json({ submissionId: 'BST-123', decision: 'ACCEPTED' }, { status: 201 }),
      );
    });
    vi.stubGlobal('fetch', fetchStub);

    await runWithRequestId('shared-request-123', async () => {
      await createAddressLookupClient().findAddresses('BT9 7EP');
      await createDocumentUploadClient().uploadDocument('passport', {
        fileName: 'image.png',
        contentType: 'image/png',
        bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      });
      await createDocumentImageClient().getImage('upload-1');
      await createSubmissionApiClient().submit({
        address: {
          id: 'address-1',
          line1: '1 Apprentice Avenue',
          line2: '',
          town: 'Belfast',
          postcode: 'BT9 7EP',
        },
        identityDocument: 'passport',
        documentUploadId: 'upload-1',
      });
    });

    expect(fetchStub).toHaveBeenCalledTimes(4);
    for (const call of fetchStub.mock.calls) {
      expect(call[1]?.headers).toMatchObject({ 'X-Request-Id': 'shared-request-123' });
    }
  });
});
