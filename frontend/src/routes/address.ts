import { Router } from 'express';

export const addressRouter = Router();

const postcodeRequiredMessage = 'Enter your postcode';

function readSubmittedPostcode(body: unknown): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'postcode' in body &&
    typeof body.postcode === 'string'
  ) {
    return body.postcode;
  }

  return '';
}

addressRouter.get('/address', (_request, response) => {
  response.render('address.njk', {
    pageTitle: 'What is your postcode? - BrightStart Training Service',
    postcode: '',
  });
});

addressRouter.post('/address', (request, response, next) => {
  const submittedPostcode = readSubmittedPostcode(request.body as unknown);
  const normalisedPostcode = submittedPostcode.trim().toUpperCase();

  if (normalisedPostcode.length === 0) {
    response.status(400).render('address.njk', {
      pageTitle: `Error: What is your postcode? - BrightStart Training Service`,
      postcode: submittedPostcode,
      postcodeError: postcodeRequiredMessage,
      errors: [{ text: postcodeRequiredMessage, href: '#postcode' }],
    });
    return;
  }

  request.session.postcode = normalisedPostcode;

  request.session.save((error) => {
    if (error) {
      next(error);
      return;
    }

    response.redirect(303, '/address-confirmed');
  });
});

addressRouter.get('/address-confirmed', (request, response) => {
  const postcode = request.session.postcode;

  if (postcode === undefined) {
    response.redirect('/address');
    return;
  }

  response.render('address-confirmed.njk', {
    pageTitle: 'Postcode captured - BrightStart Training Service',
    postcode,
  });
});
