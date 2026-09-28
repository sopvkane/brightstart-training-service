import type { AddressLookupClient } from './address-api-client.js';
import type { Address } from './domain/address.js';

export type AddressSelection = {
  addresses: Address[];
  selectedAddress: Address | undefined;
};

export type AddressJourney = {
  findAddresses(postcode: string): Promise<Address[]>;
  selectAddress(postcode: string, submittedAddressId: string): Promise<AddressSelection>;
};

export class AddressJourneyService implements AddressJourney {
  public constructor(private readonly addressLookupClient: AddressLookupClient) {}

  public findAddresses(postcode: string): Promise<Address[]> {
    return this.addressLookupClient.findAddresses(postcode);
  }

  public async selectAddress(
    postcode: string,
    submittedAddressId: string,
  ): Promise<AddressSelection> {
    const addresses = await this.addressLookupClient.findAddresses(postcode);
    const selectedAddress = addresses.find((address) => address.id === submittedAddressId);

    return { addresses, selectedAddress };
  }
}
