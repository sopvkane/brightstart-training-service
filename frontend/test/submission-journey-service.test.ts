import { describe, expect, it, vi } from 'vitest';

import type { CompleteJourneyState } from '../src/domain/journey.js';
import type { SubmissionApiClient } from '../src/submission-api-client.js';
import { SubmissionJourneyService } from '../src/submission-journey-service.js';

describe('submission journey service', () => {
  it('builds the API submission only from canonical journey state', async () => {
    const submit = vi.fn<SubmissionApiClient['submit']>().mockResolvedValue({
      submissionId: 'BST-123',
      decision: 'ACCEPTED',
    });
    const service = new SubmissionJourneyService({ submit });
    const journey: CompleteJourneyState = {
      postcode: 'BT9 7EP',
      selectedAddress: {
        id: 'bt9-7ep-1',
        line1: '1 Apprentice Avenue',
        line2: 'Learning Quarter',
        town: 'Belfast',
        postcode: 'BT9 7EP',
      },
      identityDocument: 'passport',
      documentUpload: {
        uploadId: 'upload-123',
        fileName: 'display-only.jpg',
        contentType: 'image/jpeg',
        size: 4,
      },
    };

    await service.submit(journey);

    expect(submit).toHaveBeenCalledWith({
      address: journey.selectedAddress,
      identityDocument: 'passport',
      documentUploadId: 'upload-123',
    });
  });
});
