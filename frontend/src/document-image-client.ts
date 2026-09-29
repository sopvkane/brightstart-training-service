const defaultApiBaseUrl = 'http://localhost:8080';
const defaultRequestTimeoutMilliseconds = 5_000;

export type DocumentImage = {
  contentType: 'image/jpeg' | 'image/png';
  bytes: Uint8Array;
};

export type DocumentImageClient = {
  getImage(uploadId: string): Promise<DocumentImage>;
};

export class DocumentImageError extends Error {
  public constructor(
    public readonly reason: 'not-found' | 'unavailable' | 'invalid-response',
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'DocumentImageError';
  }
}

export function createDocumentImageClient(
  apiBaseUrl = process.env.ADDRESS_API_BASE_URL ?? defaultApiBaseUrl,
  requestTimeoutMilliseconds = defaultRequestTimeoutMilliseconds,
): DocumentImageClient {
  return {
    async getImage(uploadId) {
      let response: Response;

      try {
        response = await fetch(
          new URL(`/api/document-uploads/${encodeURIComponent(uploadId)}/content`, apiBaseUrl),
          {
            headers: { accept: 'image/jpeg, image/png' },
            signal: AbortSignal.timeout(requestTimeoutMilliseconds),
          },
        );
      } catch (error) {
        throw new DocumentImageError('unavailable', 'The image request failed.', error);
      }

      if (response.status === 404) {
        throw new DocumentImageError('not-found', 'The image was not found.');
      }

      if (!response.ok) {
        throw new DocumentImageError('unavailable', `The image API returned ${response.status}.`);
      }

      const contentType = response.headers.get('content-type')?.split(';')[0];

      if (contentType !== 'image/jpeg' && contentType !== 'image/png') {
        throw new DocumentImageError('invalid-response', 'The image API returned an unsafe type.');
      }

      return {
        contentType,
        bytes: new Uint8Array(await response.arrayBuffer()),
      };
    },
  };
}
