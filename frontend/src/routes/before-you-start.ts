import { Router } from 'express';

export const beforeYouStartRouter = Router();

beforeYouStartRouter.get('/', (_request, response) => {
  response.render('before-you-start.njk', {
    pageTitle: 'Before you start - BrightStart Training Service',
  });
});
