import {
  maximumDocumentUploadSizeBytes,
  type DocumentUploadReceipt,
} from './domain/document-upload.js';
import type { IdentityDocumentType } from './domain/identity-document.js';

const defaultApiBaseUrl = 'http://localhost:8080';
const defaultRequestTimeoutMilliseconds = 5_000;

export type DocumentImage = {
  fileName: string;
  contentType: string;
  bytes: Uint8Array;
};

export type DocumentUploadClient = {
  uploadDocument(
    documentType: IdentityDocumentType,
    documentImage: DocumentImage,
  ): Promise<DocumentUploadReceipt>;
};

export type DocumentUploadFailureReason = 'validation' | 'unavailable' | 'invalid-response';

export class DocumentUploadError extends Error {
  public constructor(
    public readonly reason: DocumentUploadFailureReason,
    message: string,
    public readonly status?: number,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'DocumentUploadError';
  }
}

function toDocumentUploadReceipt(value: unknown): DocumentUploadReceipt | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  if (
    'uploadId' in value &&
    typeof value.uploadId === 'string' &&
    value.uploadId.length > 0 &&
    'fileName' in value &&
    typeof value.fileName === 'string' &&
    value.fileName.length > 0 &&
    'contentType' in value &&
    (value.contentType === 'image/jpeg' || value.contentType === 'image/png') &&
    'size' in value &&
    typeof value.size === 'number' &&
    Number.isSafeInteger(value.size) &&
    value.size > 0 &&
    value.size <= maximumDocumentUploadSizeBytes
  ) {
    return {
      uploadId: value.uploadId,
      fileName: value.fileName,
      contentType: value.contentType,
      size: value.size,
    };
  }

  return undefined;
}

export function createDocumentUploadClient(
  apiBaseUrl = process.env.ADDRESS_API_BASE_URL ?? defaultApiBaseUrl,
  requestTimeoutMilliseconds = defaultRequestTimeoutMilliseconds,
): DocumentUploadClient {
  return {
    async uploadDocument(documentType, documentImage) {
      const uploadUrl = new URL('/api/document-uploads', apiBaseUrl);
      const formData = new FormData();
      const imageBytes = new ArrayBuffer(documentImage.bytes.byteLength);
      new Uint8Array(imageBytes).set(documentImage.bytes);
      const imageBlob = new Blob([imageBytes], { type: documentImage.contentType });

      formData.set('documentType', documentType);
      formData.set('document', imageBlob, documentImage.fileName);

      let response: Response;

      try {
        response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { accept: 'application/json' },
          body: formData,
          signal: AbortSignal.timeout(requestTimeoutMilliseconds),
        });
      } catch (error) {
        throw new DocumentUploadError(
          'unavailable',
          'The document upload API request could not be completed.',
          undefined,
          error,
        );
      }

      if (!response.ok) {
        if ([400, 413, 415].includes(response.status)) {
          throw new DocumentUploadError(
            'validation',
            `The document upload API rejected the image with HTTP ${response.status}.`,
            response.status,
          );
        }

        throw new DocumentUploadError(
          'unavailable',
          `The document upload API returned HTTP ${response.status}.`,
          response.status,
        );
      }

      let responseBody: unknown;

      try {
        responseBody = await response.json();
      } catch (error) {
        throw new DocumentUploadError(
          'invalid-response',
          'The document upload API returned a response that was not valid JSON.',
          undefined,
          error,
        );
      }

      const receipt = toDocumentUploadReceipt(responseBody);

      if (receipt === undefined) {
        throw new DocumentUploadError(
          'invalid-response',
          'The document upload API returned an unexpected response.',
        );
      }

      return receipt;
    },
  };
}
