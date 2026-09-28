export type Address = {
  id: string;
  line1: string;
  line2: string;
  town: string;
  postcode: string;
};

export type AddressLookupClient = {
  findAddresses(postcode: string): Promise<Address[]>;
};

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

export function createAddressLookupClient(apiBaseUrl: string): AddressLookupClient {
  return {
    async findAddresses(postcode: string): Promise<Address[]> {
      const lookupUrl = new URL('/api/addresses', apiBaseUrl);
      lookupUrl.searchParams.set('postcode', postcode);

      const response = await fetch(lookupUrl);

      if (!response.ok) {
        throw new Error(`Address API returned HTTP ${response.status}`);
      }

      const responseBody: unknown = await response.json();

      if (!isAddressLookupResponse(responseBody)) {
        throw new Error('Address API returned an unexpected response');
      }

      return responseBody.addresses;
    },
  };
}
