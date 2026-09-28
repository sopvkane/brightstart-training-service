import { Router, type Response } from 'express';

import {
  identityDocumentDetails,
  isIdentityDocumentType,
  type IdentityDocumentType,
} from '../domain/identity-document.js';

const documentRequiredMessage = 'Select an identity document';

function readFormValue(body: unknown, fieldName: string): string {
  if (typeof body === 'object' && body !== null) {
    const form = body as Record<string, unknown>;
    const value = form[fieldName];

    if (typeof value === 'string') {
      return value;
    }
  }

  return '';
}

function documentRadioItems(selectedDocument?: IdentityDocumentType) {
  return Object.entries(identityDocumentDetails).map(([value, details]) => ({
    value,
    text: details.label,
    checked: value === selectedDocument,
  }));
}

function renderDocumentSelection(
  response: Response,
  selectedDocument?: IdentityDocumentType,
  showError = false,
): void {
  response.status(showError ? 400 : 200).render('identity-document.njk', {
    pageTitle: `${showError ? 'Error: ' : ''}Which identity document do you have? - BrightStart Training Service`,
    documentItems: documentRadioItems(selectedDocument),
    documentError: showError ? documentRequiredMessage : undefined,
    errors: showError ? [{ text: documentRequiredMessage, href: '#identityDocument' }] : undefined,
  });
}

export const identityDocumentRouter = Router();

identityDocumentRouter.get('/identity-document', (request, response) => {
  const journey = request.session.journey;

  if (journey?.selectedAddress === undefined) {
    response.redirect('/select-address');
    return;
  }

  renderDocumentSelection(response, journey.identityDocument);
});

identityDocumentRouter.post('/identity-document', (request, response, next) => {
  const journey = request.session.journey;

  if (journey?.selectedAddress === undefined) {
    response.redirect('/select-address');
    return;
  }

  const submittedDocument = readFormValue(request.body as unknown, 'identityDocument');

  if (!isIdentityDocumentType(submittedDocument)) {
    renderDocumentSelection(response, journey.identityDocument, true);
    return;
  }

  request.session.journey = {
    ...journey,
    identityDocument: submittedDocument,
  };

  request.session.save((error) => {
    if (error) {
      next(error);
      return;
    }

    response.redirect(303, '/document-guidance');
  });
});

identityDocumentRouter.get('/document-guidance', (request, response) => {
  const journey = request.session.journey;

  if (journey?.identityDocument === undefined) {
    response.redirect('/identity-document');
    return;
  }

  const document = identityDocumentDetails[journey.identityDocument];

  response.render('document-guidance.njk', {
    pageTitle: `${document.guidance.heading} - BrightStart Training Service`,
    guidance: document.guidance,
  });
});

identityDocumentRouter.get('/document-ready', (request, response) => {
  if (request.session.journey?.identityDocument === undefined) {
    response.redirect('/identity-document');
    return;
  }

  response.render('document-ready.njk', {
    pageTitle: 'Ready for the next step - BrightStart Training Service',
  });
});
