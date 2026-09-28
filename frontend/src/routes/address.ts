import { Router, type Response } from 'express';

import type { AddressJourney, AddressSelection } from '../address-journey-service.js';
import type { Address } from '../domain/address.js';

const postcodeRequiredMessage = 'Enter your postcode';
const addressRequiredMessage = 'Select an address';

function readFormValue(body: unknown, fieldName: string): string {
  if (typeof body === 'object' && body !== null) {
    const form = body as Record<string, unknown>;
    const value = form[fieldName];

    if (typeof value === 'string') {
      return value;
    }
  }

  return '';
}

function addressRadioItems(addresses: Address[], selectedAddressId = '') {
  return addresses.map((address) => ({
    value: address.id,
    text: [address.line1, address.line2, address.town, address.postcode]
      .filter((part) => part.length > 0)
      .join(', '),
    checked: address.id === selectedAddressId,
  }));
}

function renderLookupFailure(response: Response): void {
  response.status(503).render('address-lookup-error.njk', {
    pageTitle: 'We cannot find addresses right now - BrightStart Training Service',
  });
}

export function createAddressRouter(addressJourney: AddressJourney): Router {
  const addressRouter = Router();

  addressRouter.get('/address', (_request, response) => {
    response.render('address.njk', {
      pageTitle: 'What is your postcode? - BrightStart Training Service',
      postcode: '',
    });
  });

  addressRouter.post('/address', (request, response, next) => {
    const submittedPostcode = readFormValue(request.body as unknown, 'postcode');
    const normalisedPostcode = submittedPostcode.trim().toUpperCase();

    if (normalisedPostcode.length === 0) {
      response.status(400).render('address.njk', {
        pageTitle: `Error: What is your postcode? - BrightStart Training Service`,
        postcode: submittedPostcode,
        postcodeError: postcodeRequiredMessage,
        errors: [{ text: postcodeRequiredMessage, href: '#postcode' }],
      });
      return;
    }

    request.session.journey = { postcode: normalisedPostcode };

    request.session.save((error) => {
      if (error) {
        next(error);
        return;
      }

      response.redirect(303, '/select-address');
    });
  });

  addressRouter.get('/select-address', async (request, response) => {
    const postcode = request.session.journey?.postcode;

    if (postcode === undefined) {
      response.redirect('/address');
      return;
    }

    let addresses: Address[];

    try {
      addresses = await addressJourney.findAddresses(postcode);
    } catch {
      renderLookupFailure(response);
      return;
    }

    response.render('select-address.njk', {
      pageTitle:
        addresses.length > 0
          ? 'Select your address - BrightStart Training Service'
          : 'No addresses found - BrightStart Training Service',
      postcode,
      addresses,
      addressItems: addressRadioItems(addresses),
    });
  });

  addressRouter.post('/select-address', async (request, response, next) => {
    const postcode = request.session.journey?.postcode;

    if (postcode === undefined) {
      response.redirect('/address');
      return;
    }

    const selectedAddressId = readFormValue(request.body as unknown, 'addressId');

    let selection: AddressSelection;

    try {
      selection = await addressJourney.selectAddress(postcode, selectedAddressId);
    } catch {
      renderLookupFailure(response);
      return;
    }

    if (selection.selectedAddress === undefined) {
      response.status(400).render('select-address.njk', {
        pageTitle: 'Error: Select your address - BrightStart Training Service',
        postcode,
        addresses: selection.addresses,
        addressItems: addressRadioItems(selection.addresses, selectedAddressId),
        addressError: addressRequiredMessage,
        errors: [{ text: addressRequiredMessage, href: '#addressId' }],
      });
      return;
    }

    request.session.journey = {
      postcode,
      selectedAddress: selection.selectedAddress,
    };

    request.session.save((error) => {
      if (error) {
        next(error);
        return;
      }

      response.redirect(303, '/address-confirmed');
    });
  });

  addressRouter.get('/address-confirmed', (request, response) => {
    const selectedAddress = request.session.journey?.selectedAddress;

    if (selectedAddress === undefined) {
      response.redirect('/select-address');
      return;
    }

    response.render('address-confirmed.njk', {
      pageTitle: 'Address selected - BrightStart Training Service',
      address: selectedAddress,
    });
  });

  return addressRouter;
}
