import { Router } from 'express';

import { DocumentImageError, type DocumentImageClient } from '../document-image-client.js';
import { identityDocumentDetails } from '../domain/identity-document.js';
import type { SubmissionJourney } from '../submission-journey-service.js';
import { readCompleteJourney } from './journey-prerequisites.js';

export function createSubmissionRouter(
  submissionJourney: SubmissionJourney,
  documentImageClient: DocumentImageClient,
): Router {
  const router = Router();

  router.post('/check-your-answers', async (request, response, next) => {
    const journey = readCompleteJourney(request.session.journey, response);

    if (journey === undefined) {
      return;
    }

    if (journey.submission !== undefined) {
      response.redirect(303, '/result');
      return;
    }

    try {
      const submission = await submissionJourney.submit(journey);
      request.session.journey = { ...journey, submission };
    } catch {
      response.status(503).render('submission-error.njk', {
        pageTitle: 'We could not submit the training journey - BrightStart Training Service',
      });
      return;
    }

    request.session.save((error) => {
      if (error) {
        next(error);
        return;
      }

      response.redirect(303, '/result');
    });
  });

  router.get('/result', (request, response) => {
    const journey = readCompleteJourney(request.session.journey, response);

    if (journey === undefined) {
      return;
    }

    if (journey.submission === undefined) {
      response.redirect('/check-your-answers');
      return;
    }

    response.render('result.njk', {
      pageTitle: 'Training journey completed - BrightStart Training Service',
      address: [
        journey.selectedAddress.line1,
        journey.selectedAddress.line2,
        journey.selectedAddress.town,
        journey.selectedAddress.postcode,
      ]
        .filter((part) => part.length > 0)
        .join(', '),
      documentName: identityDocumentDetails[journey.identityDocument].label,
      submission: journey.submission,
    });
  });

  router.get('/document-image', async (request, response) => {
    const upload = request.session.journey?.documentUpload;

    if (upload === undefined) {
      response.status(404).type('text').send('Document image not found.');
      return;
    }

    try {
      const image = await documentImageClient.getImage(upload.uploadId);
      response.set('Cache-Control', 'no-store');
      response.type(image.contentType).send(Buffer.from(image.bytes));
    } catch (error) {
      const status =
        error instanceof DocumentImageError && error.reason === 'not-found' ? 404 : 503;
      response.status(status).type('text').send('Document image unavailable.');
    }
  });

  return router;
}
