import { describe, expect, it } from 'vitest';

import { loadApplicationConfig, parseBooleanSetting } from '../src/configuration.js';

describe('application configuration', () => {
  it('uses known-good local defaults', () => {
    const config = loadApplicationConfig({});

    expect(config).toMatchObject({
      port: 3000,
      apiBaseUrl: 'http://localhost:8080',
      documentGuidanceV2: false,
      production: false,
    });
  });

  it('enables alternate document guidance only for true', () => {
    expect(parseBooleanSetting('DOCUMENT_GUIDANCE_V2', 'true')).toBe(true);
    expect(parseBooleanSetting('DOCUMENT_GUIDANCE_V2', 'false')).toBe(false);
    expect(parseBooleanSetting('DOCUMENT_GUIDANCE_V2', undefined)).toBe(false);
  });

  it('rejects an invalid feature-flag value', () => {
    expect(() => parseBooleanSetting('DOCUMENT_GUIDANCE_V2', 'yes')).toThrow(
      'DOCUMENT_GUIDANCE_V2 must be either true or false',
    );
  });
});
