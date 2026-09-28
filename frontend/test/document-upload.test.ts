import request from 'supertest';
import { describe, expect, it } from 'vitest';

import type { AddressJourney } from '../src/address-journey-service.js';
import { DocumentUploadError, type DocumentUploadClient } from '../src/document-upload-client.js';
import { createApplication } from '../src/app.js';
import type { Address } from '../src/domain/address.js';
import {
  maximumDocumentUploadSizeBytes,
  type DocumentUploadReceipt,
} from '../src/domain/document-upload.js';

type Browser = ReturnType<typeof request.agent>;

const selectedAddress: Address = {
  id: 'bt9-7ep-1',
  line1: '1 Apprentice Avenue',
  line2: 'Learning Quarter',
  town: 'Belfast',
  postcode: 'BT9 7EP',
};

const receipt: DocumentUploadReceipt = {
  uploadId: 'training-upload-123',
  fileName: 'synthetic-passport.jpg',
  contentType: 'image/jpeg',
  size: 4,
};

const addressJourney: AddressJourney = {
  findAddresses: async () => Promise.resolve([selectedAddress]),
  selectAddress: async () => Promise.resolve({ addresses: [selectedAddress], selectedAddress }),
};

function clientReturning(returnedReceipt: DocumentUploadReceipt): DocumentUploadClient {
  return {
    uploadDocument: async () => Promise.resolve(returnedReceipt),
  };
}

function readCsrfToken(page: string): string {
  const token = page.match(/name="_csrf" value="([^"]+)"/)?.[1];

  if (token === undefined) {
    throw new Error('Expected the page to contain a CSRF token.');
  }

  return token;
}

async function submitUrlEncodedForm(
  browser: Browser,
  path: string,
  values: Record<string, string>,
) {
  const page = await browser.get(path);
  const csrfToken = readCsrfToken(page.text);

  return browser
    .post(path)
    .type('form')
    .send({ _csrf: csrfToken, ...values });
}

async function reachUploadPage(browser: Browser): Promise<void> {
  await submitUrlEncodedForm(browser, '/address', { postcode: 'BT9 7EP' });
  await submitUrlEncodedForm(browser, '/select-address', { addressId: selectedAddress.id });
  await submitUrlEncodedForm(browser, '/identity-document', { identityDocument: 'passport' });
}

async function uploadSyntheticJpeg(browser: Browser) {
  const page = await browser.get('/upload-document');
  const csrfToken = readCsrfToken(page.text);

  return browser
    .post('/upload-document')
    .field('_csrf', csrfToken)
    .attach('document', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), {
      filename: 'synthetic-passport.jpg',
      contentType: 'image/jpeg',
    });
}

describe('document upload journey', () => {
  it('renders the upload page when a document has been selected', async () => {
    const browser = request.agent(
      createApplication({ addressJourney, documentUploadClient: clientReturning(receipt) }),
    );
    await reachUploadPage(browser);

    const response = await browser.get('/upload-document');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Upload your passport');
    expect(response.text).toContain('enctype="multipart/form-data"');
    expect(response.text).toContain('type="file"');
    expect(response.text).toContain('name="document"');
    expect(response.text).toContain('JPEG or PNG');
    expect(response.text).toContain('5 MB');
  });

  it('redirects to document selection when the prerequisite is missing', async () => {
    const response = await request(createApplication()).get('/upload-document');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/identity-document');
  });

  it('shows accessible validation when no file is selected', async () => {
    const browser = request.agent(
      createApplication({ addressJourney, documentUploadClient: clientReturning(receipt) }),
    );
    await reachUploadPage(browser);
    const page = await browser.get('/upload-document');
    const csrfToken = readCsrfToken(page.text);

    const response = await browser.post('/upload-document').field('_csrf', csrfToken);

    expect(response.status).toBe(400);
    expect(response.text).toContain('<title>Error: Upload your passport');
    expect(response.text).toContain('There is a problem');
    expect(response.text).toContain('Select a JPEG or PNG image');
    expect(response.text).toContain('href="#document"');
    expect(response.text).toMatch(
      /<input[^>]+id="document"[^>]+aria-describedby="[^"]*document-error/,
    );
  });

  it('rejects a file larger than the frontend upload limit', async () => {
    const browser = request.agent(
      createApplication({ addressJourney, documentUploadClient: clientReturning(receipt) }),
    );
    await reachUploadPage(browser);
    const page = await browser.get('/upload-document');
    const csrfToken = readCsrfToken(page.text);

    const response = await browser
      .post('/upload-document')
      .field('_csrf', csrfToken)
      .attach('document', Buffer.alloc(maximumDocumentUploadSizeBytes + 1), {
        filename: 'too-large.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(413);
    expect(response.text).toContain('The selected file must be 5 MB or smaller');
    expect(response.text).toContain('href="#document"');
  });

  it('rejects more than one file', async () => {
    const browser = request.agent(
      createApplication({ addressJourney, documentUploadClient: clientReturning(receipt) }),
    );
    await reachUploadPage(browser);
    const page = await browser.get('/upload-document');
    const csrfToken = readCsrfToken(page.text);

    const response = await browser
      .post('/upload-document')
      .field('_csrf', csrfToken)
      .attach('document', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), 'first.jpg')
      .attach('document', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), 'second.jpg');

    expect(response.status).toBe(400);
    expect(response.text).toContain('Select one image file');
  });

  it('stores receipt metadata and redirects after a successful upload', async () => {
    const browser = request.agent(
      createApplication({ addressJourney, documentUploadClient: clientReturning(receipt) }),
    );
    await reachUploadPage(browser);

    const uploadResponse = await uploadSyntheticJpeg(browser);

    expect(uploadResponse.status).toBe(303);
    expect(uploadResponse.headers.location).toBe('/document-uploaded');

    const confirmationResponse = await browser.get('/document-uploaded');
    expect(confirmationResponse.status).toBe(200);
    expect(confirmationResponse.text).toContain('Document image accepted');
    expect(confirmationResponse.text).toContain('passport');
    expect(confirmationResponse.text).toContain('synthetic-passport.jpg');
    expect(confirmationResponse.text).toContain('has not been used to verify your identity');
  });

  it('handles an invalid successful API response safely', async () => {
    const invalidResponseClient: DocumentUploadClient = {
      uploadDocument: async () =>
        Promise.reject(new DocumentUploadError('invalid-response', 'unexpected upstream response')),
    };
    const browser = request.agent(
      createApplication({ addressJourney, documentUploadClient: invalidResponseClient }),
    );
    await reachUploadPage(browser);

    const response = await uploadSyntheticJpeg(browser);

    expect(response.status).toBe(503);
    expect(response.text).toContain('We could not upload your image');
    expect(response.text).not.toContain('unexpected upstream response');
  });

  it('handles an unavailable API safely', async () => {
    const unavailableClient: DocumentUploadClient = {
      uploadDocument: async () =>
        Promise.reject(new DocumentUploadError('unavailable', 'connection refused')),
    };
    const browser = request.agent(
      createApplication({ addressJourney, documentUploadClient: unavailableClient }),
    );
    await reachUploadPage(browser);

    const response = await uploadSyntheticJpeg(browser);

    expect(response.status).toBe(503);
    expect(response.text).toContain('The document upload service is unavailable');
    expect(response.text).not.toContain('connection refused');
  });

  it('shows an accessible error when the API rejects unsupported content', async () => {
    const rejectingClient: DocumentUploadClient = {
      uploadDocument: async () =>
        Promise.reject(new DocumentUploadError('validation', 'unsupported', 415)),
    };
    const browser = request.agent(
      createApplication({ addressJourney, documentUploadClient: rejectingClient }),
    );
    await reachUploadPage(browser);

    const response = await uploadSyntheticJpeg(browser);

    expect(response.status).toBe(415);
    expect(response.text).toContain('The selected file must be a JPEG or PNG image');
    expect(response.text).toContain('href="#document"');
  });

  it('invalidates the receipt when the identity document changes', async () => {
    const browser = request.agent(
      createApplication({ addressJourney, documentUploadClient: clientReturning(receipt) }),
    );
    await reachUploadPage(browser);
    await uploadSyntheticJpeg(browser);

    await submitUrlEncodedForm(browser, '/identity-document', {
      identityDocument: 'driving-licence',
    });
    const response = await browser.get('/document-uploaded');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/upload-document');
  });
});
