import { Router, type Response } from 'express';

import { createCheckAnswersViewModel } from '../check-answers-view-model.js';
import type { CompleteJourneyState, JourneyState } from '../domain/journey.js';

function readCompleteJourney(
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

export const checkAnswersRouter = Router();

checkAnswersRouter.get('/check-your-answers', (request, response) => {
  const journey = readCompleteJourney(request.session.journey, response);

  if (journey === undefined) {
    return;
  }

  response.render('check-your-answers.njk', {
    pageTitle: 'Check your answers - BrightStart Training Service',
    answers: createCheckAnswersViewModel(journey),
  });
});

checkAnswersRouter.get('/ready-to-submit', (request, response) => {
  const journey = readCompleteJourney(request.session.journey, response);

  if (journey === undefined) {
    return;
  }

  response.render('ready-to-submit.njk', {
    pageTitle: 'Ready to submit - BrightStart Training Service',
  });
});
