import { Router } from 'express';

export const homeRouter = Router();

homeRouter.get('/', (_request, response) => {
  response.render('home.njk', {
    pageTitle: 'BrightStart Training Service',
  });
});
