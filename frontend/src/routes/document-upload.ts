import { Router, type Response } from 'express';

import { DocumentUploadError, type DocumentUploadClient } from '../document-upload-client.js';
import { maximumDocumentUploadSizeBytes } from '../domain/document-upload.js';
import { identityDocumentDetails } from '../domain/identity-document.js';

const noFileMessage = 'Select a JPEG or PNG image';
const unsupportedFileMessage = 'The selected file must be a JPEG or PNG image';
const tooLargeMessage = 'The selected file must be 5 MB or smaller';
const oneFileMessage = 'Select one image file';

function renderUploadForm(
  response: Response,
  documentName: string,
  uploadInstruction: string,
  status = 200,
  errorMessage?: string,
): void {
  response.status(status).render('upload-document.njk', {
    pageTitle: `${errorMessage === undefined ? '' : 'Error: '}Upload your ${documentName.toLowerCase()} - BrightStart Training Service`,
    documentName,
    uploadInstruction,
    maximumFileSizeMegabytes: maximumDocumentUploadSizeBytes / 1024 / 1024,
    uploadError: errorMessage,
    errors: errorMessage === undefined ? undefined : [{ text: errorMessage, href: '#document' }],
  });
}

function validationMessageForStatus(status: number | undefined): string {
  if (status === 413) {
    return tooLargeMessage;
  }

  if (status === 415) {
    return unsupportedFileMessage;
  }

  return noFileMessage;
}

export function createDocumentUploadRouter(documentUploadClient: DocumentUploadClient): Router {
  const documentUploadRouter = Router();

  documentUploadRouter.get('/upload-document', (request, response) => {
    const identityDocument = request.session.journey?.identityDocument;

    if (identityDocument === undefined) {
      response.redirect('/identity-document');
      return;
    }

    const document = identityDocumentDetails[identityDocument];
    renderUploadForm(response, document.label, document.guidance.introduction);
  });

  documentUploadRouter.post('/upload-document', async (request, response, next) => {
    const journey = request.session.journey;

    if (journey?.identityDocument === undefined) {
      response.redirect('/identity-document');
      return;
    }

    const document = identityDocumentDetails[journey.identityDocument];
    const parsingError = request.documentUploadParsingError;

    if (parsingError !== undefined) {
      const errorMessage =
        parsingError === 'file-too-large'
          ? tooLargeMessage
          : parsingError === 'too-many-files'
            ? oneFileMessage
            : noFileMessage;
      const status = parsingError === 'file-too-large' ? 413 : 400;

      renderUploadForm(
        response,
        document.label,
        document.guidance.introduction,
        status,
        errorMessage,
      );
      return;
    }

    const uploadedFile = request.file;

    if (uploadedFile === undefined) {
      renderUploadForm(
        response,
        document.label,
        document.guidance.introduction,
        400,
        noFileMessage,
      );
      return;
    }

    try {
      const receipt = await documentUploadClient.uploadDocument(journey.identityDocument, {
        fileName: uploadedFile.originalname,
        contentType: uploadedFile.mimetype,
        bytes: uploadedFile.buffer,
      });

      request.session.journey = {
        ...journey,
        documentUpload: receipt,
      };
    } catch (error) {
      if (error instanceof DocumentUploadError && error.reason === 'validation') {
        renderUploadForm(
          response,
          document.label,
          document.guidance.introduction,
          error.status ?? 400,
          validationMessageForStatus(error.status),
        );
        return;
      }

      response.status(503).render('document-upload-error.njk', {
        pageTitle: 'We could not upload your image - BrightStart Training Service',
      });
      return;
    }

    request.session.save((error) => {
      if (error) {
        next(error);
        return;
      }

      response.redirect(303, '/document-uploaded');
    });
  });

  documentUploadRouter.get('/document-uploaded', (request, response) => {
    const journey = request.session.journey;

    if (journey?.identityDocument === undefined) {
      response.redirect('/identity-document');
      return;
    }

    if (journey.documentUpload === undefined) {
      response.redirect('/upload-document');
      return;
    }

    response.render('document-uploaded.njk', {
      pageTitle: 'Document image accepted - BrightStart Training Service',
      documentName: identityDocumentDetails[journey.identityDocument].label,
      upload: journey.documentUpload,
    });
  });

  return documentUploadRouter;
}
