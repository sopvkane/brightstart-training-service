import type { Address } from './domain/address.js';
import { requestIdHeaders } from './request-context.js';

const defaultAddressApiBaseUrl = 'http://localhost:8080';
const defaultRequestTimeoutMilliseconds = 3_000;

export type AddressLookupClient = {
  findAddresses(postcode: string): Promise<Address[]>;
};

export type AddressLookupFailureReason = 'unavailable' | 'invalid-response';

export class AddressLookupError extends Error {
  public constructor(
    public readonly reason: AddressLookupFailureReason,
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'AddressLookupError';
  }
}

type AddressLookupResponse = {
  addresses: Address[];
};

function isAddress(value: unknown): value is Address {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'id' in value &&
    typeof value.id === 'string' &&
    'line1' in value &&
    typeof value.line1 === 'string' &&
    'line2' in value &&
    typeof value.line2 === 'string' &&
    'town' in value &&
    typeof value.town === 'string' &&
    'postcode' in value &&
    typeof value.postcode === 'string'
  );
}

function isAddressLookupResponse(value: unknown): value is AddressLookupResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'addresses' in value &&
    Array.isArray(value.addresses) &&
    value.addresses.every(isAddress)
  );
}

export function createAddressLookupClient(
  apiBaseUrl = defaultAddressApiBaseUrl,
  requestTimeoutMilliseconds = defaultRequestTimeoutMilliseconds,
): AddressLookupClient {
  return {
    async findAddresses(postcode: string): Promise<Address[]> {
      const lookupUrl = new URL('/api/addresses', apiBaseUrl);
      lookupUrl.searchParams.set('postcode', postcode);

      let response: Response;

      try {
        response = await fetch(lookupUrl, {
          headers: { accept: 'application/json', ...requestIdHeaders() },
          signal: AbortSignal.timeout(requestTimeoutMilliseconds),
        });
      } catch (error) {
        throw new AddressLookupError(
          'unavailable',
          'The address API request could not be completed.',
          error,
        );
      }

      if (!response.ok) {
        throw new AddressLookupError(
          'unavailable',
          `The address API returned HTTP ${response.status}.`,
        );
      }

      let responseBody: unknown;

      try {
        responseBody = await response.json();
      } catch (error) {
        throw new AddressLookupError(
          'invalid-response',
          'The address API returned a response that was not valid JSON.',
          error,
        );
      }

      if (!isAddressLookupResponse(responseBody)) {
        throw new AddressLookupError(
          'invalid-response',
          'The address API returned an unexpected response.',
        );
      }

      return responseBody.addresses;
    },
  };
}
