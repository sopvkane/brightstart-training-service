import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAddressLookupClient } from '../src/address-api-client.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('address API client', () => {
  it('requests JSON addresses for the URL-encoded postcode', async () => {
    const fetchStub = vi
      .fn<(input: string | URL | Request, options?: RequestInit) => Promise<Response>>()
      .mockResolvedValue(
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

    expect(fetchStub).toHaveBeenCalledOnce();
    const requestCall = fetchStub.mock.calls[0];
    expect(requestCall?.[0]).toEqual(
      new URL('http://localhost:8080/api/addresses?postcode=BT9+7EP'),
    );
    expect(requestCall?.[1]?.headers).toEqual({ accept: 'application/json' });
    expect(requestCall?.[1]?.signal).toBeInstanceOf(AbortSignal);
    expect(addresses[0]?.line1).toBe('1 Apprentice Avenue');
  });

  it('reports an unsuccessful HTTP response as unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    const client = createAddressLookupClient('http://localhost:8080');

    await expect(client.findAddresses('ZZ9 9ZZ')).rejects.toMatchObject({
      name: 'AddressLookupError',
      reason: 'unavailable',
    });
  });

  it('reports an unexpected successful response as invalid', async () => {
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

    await expect(client.findAddresses('BT9 7EP')).rejects.toMatchObject({
      name: 'AddressLookupError',
      reason: 'invalid-response',
    });
  });

  it('reports malformed JSON as an invalid response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('not JSON', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    const client = createAddressLookupClient('http://localhost:8080');

    await expect(client.findAddresses('BT9 7EP')).rejects.toMatchObject({
      name: 'AddressLookupError',
      reason: 'invalid-response',
    });
  });

  it('reports a network failure as unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('connection refused')));
    const client = createAddressLookupClient('http://localhost:8080');

    await expect(client.findAddresses('BT9 7EP')).rejects.toMatchObject({
      name: 'AddressLookupError',
      reason: 'unavailable',
    });
  });

  it('stops waiting when the request timeout is reached', async () => {
    const fetchStub = vi.fn((_url: URL, options: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => reject(new Error('request aborted')));
      });
    });
    vi.stubGlobal('fetch', fetchStub);
    const client = createAddressLookupClient('http://localhost:8080', 5);

    await expect(client.findAddresses('BT9 7EP')).rejects.toMatchObject({
      name: 'AddressLookupError',
      reason: 'unavailable',
    });
  });
});
