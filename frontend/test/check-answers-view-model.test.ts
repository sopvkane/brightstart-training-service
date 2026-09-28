import { describe, expect, it } from 'vitest';

import { createCheckAnswersViewModel } from '../src/check-answers-view-model.js';
import type { CompleteJourneyState } from '../src/domain/journey.js';

describe('check answers view model', () => {
  it('turns canonical journey values into display-ready answers', () => {
    const journey: CompleteJourneyState = {
      postcode: 'BT9 7EP',
      selectedAddress: {
        id: 'bt9-7ep-1',
        line1: '1 Apprentice Avenue',
        line2: '',
        town: 'Belfast',
        postcode: 'BT9 7EP',
      },
      identityDocument: 'driving-licence',
      documentUpload: {
        uploadId: 'training-upload-123',
        fileName: 'synthetic-licence.png',
        contentType: 'image/png',
        size: 8,
      },
    };

    expect(createCheckAnswersViewModel(journey)).toEqual({
      address: '1 Apprentice Avenue, Belfast, BT9 7EP',
      identityDocument: 'Driving licence',
      uploadedDocument: 'synthetic-licence.png (PNG)',
    });
  });
});
