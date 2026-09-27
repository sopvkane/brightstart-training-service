import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAddressLookupClient } from '../src/address-api-client.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('address API client', () => {
  it('requests addresses for the supplied postcode', async () => {
    const fetchStub = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          addresses: [
            {
              id: 'bt9-7ep-1',
              line1: '1 Apprentice Avenue',
              line2: 'Learning Quarter',
              town: 'Belfast',
              postcode: 'BT9 7EP',
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchStub);
    const client = createAddressLookupClient('http://localhost:8080');

    const addresses = await client.findAddresses('BT9 7EP');

    expect(fetchStub).toHaveBeenCalledWith(
      new URL('http://localhost:8080/api/addresses?postcode=BT9+7EP'),
    );
    expect(addresses[0]?.line1).toBe('1 Apprentice Avenue');
  });

  it('rejects an unsuccessful API response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    const client = createAddressLookupClient('http://localhost:8080');

    await expect(client.findAddresses('ZZ9 9ZZ')).rejects.toThrow('Address API returned HTTP 503');
  });

  it('rejects an unexpected response shape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ results: [] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    const client = createAddressLookupClient('http://localhost:8080');

    await expect(client.findAddresses('BT9 7EP')).rejects.toThrow(
      'Address API returned an unexpected response',
    );
  });
});
