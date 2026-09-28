import { describe, expect, it } from 'vitest';

import type { AddressLookupClient } from '../src/address-api-client.js';
import { AddressJourneyService } from '../src/address-journey-service.js';
import type { Address } from '../src/domain/address.js';

const addresses: Address[] = [
  {
    id: 'bt9-7ep-1',
    line1: '1 Apprentice Avenue',
    line2: 'Learning Quarter',
    town: 'Belfast',
    postcode: 'BT9 7EP',
  },
  {
    id: 'bt9-7ep-2',
    line1: '2 Pair Programming Place',
    line2: 'Learning Quarter',
    town: 'Belfast',
    postcode: 'BT9 7EP',
  },
];

function clientReturning(returnedAddresses: Address[]): AddressLookupClient {
  return {
    findAddresses: async () => Promise.resolve(returnedAddresses),
  };
}

describe('address journey service', () => {
  it('returns the canonical address matching the submitted ID', async () => {
    const service = new AddressJourneyService(clientReturning(addresses));

    const selection = await service.selectAddress('BT9 7EP', 'bt9-7ep-2');

    expect(selection.selectedAddress).toEqual(addresses[1]);
    expect(selection.addresses).toEqual(addresses);
  });

  it('does not select an address ID that was not returned by the API', async () => {
    const service = new AddressJourneyService(clientReturning(addresses));

    const selection = await service.selectAddress('BT9 7EP', 'invented-address');

    expect(selection.selectedAddress).toBeUndefined();
    expect(selection.addresses).toEqual(addresses);
  });
});
