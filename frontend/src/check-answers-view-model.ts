import type { CompleteJourneyState } from './domain/journey.js';
import { identityDocumentDetails } from './domain/identity-document.js';

export type CheckAnswersViewModel = {
  address: string;
  identityDocument: string;
  uploadedDocument: string;
};

export function createCheckAnswersViewModel(journey: CompleteJourneyState): CheckAnswersViewModel {
  const address = [
    journey.selectedAddress.line1,
    journey.selectedAddress.line2,
    journey.selectedAddress.town,
    journey.selectedAddress.postcode,
  ]
    .filter((part) => part.length > 0)
    .join(', ');
  const fileType = journey.documentUpload.contentType === 'image/jpeg' ? 'JPEG' : 'PNG';

  return {
    address,
    identityDocument: identityDocumentDetails[journey.identityDocument].label,
    uploadedDocument: `${journey.documentUpload.fileName} (${fileType})`,
  };
}
