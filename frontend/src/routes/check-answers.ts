import { Router } from 'express';

import { createCheckAnswersViewModel } from '../check-answers-view-model.js';
import { readCompleteJourney } from './journey-prerequisites.js';

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
