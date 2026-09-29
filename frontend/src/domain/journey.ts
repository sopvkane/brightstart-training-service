import type { Address } from './address.js';
import type { DocumentUploadReceipt } from './document-upload.js';
import type { IdentityDocumentType } from './identity-document.js';
import type { SubmissionResult } from './submission.js';

export type JourneyState = {
  postcode: string;
  selectedAddress?: Address;
  identityDocument?: IdentityDocumentType;
  documentUpload?: DocumentUploadReceipt;
  submission?: SubmissionResult;
};

export type CompleteJourneyState = JourneyState & {
  selectedAddress: Address;
  identityDocument: IdentityDocumentType;
  documentUpload: DocumentUploadReceipt;
};
