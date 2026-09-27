import { randomBytes, timingSafeEqual } from 'node:crypto';

import { type RequestHandler } from 'express';

const methodsWithoutSideEffects = new Set(['GET', 'HEAD', 'OPTIONS']);

function readCsrfTokenFromForm(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }

  const token = (body as Record<string, unknown>)._csrf;

  return typeof token === 'string' ? token : undefined;
}

function tokensMatch(storedToken: string, submittedToken: string): boolean {
  const storedTokenBytes = Buffer.from(storedToken);
  const submittedTokenBytes = Buffer.from(submittedToken);

  return (
    storedTokenBytes.length === submittedTokenBytes.length &&
    timingSafeEqual(storedTokenBytes, submittedTokenBytes)
  );
}

export const protectAgainstCsrf: RequestHandler = (request, response, next) => {
  if (methodsWithoutSideEffects.has(request.method)) {
    next();
    return;
  }

  const storedToken = request.session.csrfToken;
  const submittedToken = readCsrfTokenFromForm(request.body as unknown);

  if (
    storedToken !== undefined &&
    submittedToken !== undefined &&
    tokensMatch(storedToken, submittedToken)
  ) {
    next();
    return;
  }

  response.status(403).render('form-expired.njk', {
    pageTitle: 'Your form could not be submitted - BrightStart Training Service',
  });
};

export const addCsrfTokenToViews: RequestHandler = (request, response, next) => {
  request.session.csrfToken ??= randomBytes(32).toString('hex');
  response.locals.csrfToken = request.session.csrfToken;
  next();
};
