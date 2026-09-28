import type { Address } from './address.js';
import type { DocumentUploadReceipt } from './document-upload.js';
import type { IdentityDocumentType } from './identity-document.js';

export type JourneyState = {
  postcode: string;
  selectedAddress?: Address;
  identityDocument?: IdentityDocumentType;
  documentUpload?: DocumentUploadReceipt;
};

export type CompleteJourneyState = JourneyState & {
  selectedAddress: Address;
  identityDocument: IdentityDocumentType;
  documentUpload: DocumentUploadReceipt;
};
