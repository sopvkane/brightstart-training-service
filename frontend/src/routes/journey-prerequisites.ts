import type { Response } from 'express';

import type { CompleteJourneyState, JourneyState } from '../domain/journey.js';

export function readCompleteJourney(
  journey: JourneyState | undefined,
  response: Response,
): CompleteJourneyState | undefined {
  if (journey?.selectedAddress === undefined) {
    response.redirect('/select-address');
    return undefined;
  }

  if (journey.identityDocument === undefined) {
    response.redirect('/identity-document');
    return undefined;
  }

  if (journey.documentUpload === undefined) {
    response.redirect('/upload-document');
    return undefined;
  }

  return {
    ...journey,
    selectedAddress: journey.selectedAddress,
    identityDocument: journey.identityDocument,
    documentUpload: journey.documentUpload,
  };
}
