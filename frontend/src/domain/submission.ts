import type { Address } from './address.js';
import type { IdentityDocumentType } from './identity-document.js';

export type Submission = {
  address: Address;
  identityDocument: IdentityDocumentType;
  documentUploadId: string;
};

export type SubmissionResult = {
  submissionId: string;
  decision: 'ACCEPTED';
};
