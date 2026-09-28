import 'express-session';

import type { Address } from '../domain/address.js';
import type { DocumentUploadReceipt } from '../domain/document-upload.js';
import type { IdentityDocumentType } from '../domain/identity-document.js';

type JourneyState = {
  postcode: string;
  selectedAddress?: Address;
  identityDocument?: IdentityDocumentType;
  documentUpload?: DocumentUploadReceipt;
};

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
    journey?: JourneyState;
  }
}
