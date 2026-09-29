import type { CompleteJourneyState } from './domain/journey.js';
import type { SubmissionResult } from './domain/submission.js';
import type { SubmissionApiClient } from './submission-api-client.js';

export type SubmissionJourney = {
  submit(journey: CompleteJourneyState): Promise<SubmissionResult>;
};

export class SubmissionJourneyService implements SubmissionJourney {
  public constructor(private readonly submissionApiClient: SubmissionApiClient) {}

  public submit(journey: CompleteJourneyState): Promise<SubmissionResult> {
    return this.submissionApiClient.submit({
      address: journey.selectedAddress,
      identityDocument: journey.identityDocument,
      documentUploadId: journey.documentUpload.uploadId,
    });
  }
}
