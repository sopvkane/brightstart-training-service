import { createRequire } from 'node:module';
import path from 'node:path';

import express, { type Express } from 'express';
import session from 'express-session';
import nunjucks from 'nunjucks';

import { createAddressLookupClient } from './address-api-client.js';
import { type AddressJourney, AddressJourneyService } from './address-journey-service.js';
import { addCsrfTokenToViews, protectAgainstCsrf } from './csrf-protection.js';
import { createAddressRouter } from './routes/address.js';
import { beforeYouStartRouter } from './routes/before-you-start.js';
import { homeRouter } from './routes/home.js';

const require = createRequire(import.meta.url);

function resolveGovukFrontendDistributionDirectory(): string {
  // npm may install this workspace dependency beside the frontend or hoist it to the repository
  // root. Node's resolver finds the installed package reliably in either layout.
  const packageJson = require.resolve('govuk-frontend/package.json');

  return path.join(path.dirname(packageJson), 'dist');
}

function getSessionSecret(): string {
  const configuredSecret = process.env.SESSION_SECRET;

  if (configuredSecret !== undefined && configuredSecret.length > 0) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set when NODE_ENV is production.');
  }

  return 'brightstart-training-service-local-development-only';
}

type ApplicationOptions = {
  addressJourney?: AddressJourney;
};

export function createApplication(options: ApplicationOptions = {}): Express {
  const application = express();
  const frontendDirectory = path.resolve(import.meta.dirname, '..');
  const govukFrontendDistributionDirectory = resolveGovukFrontendDistributionDirectory();
  const addressJourney =
    options.addressJourney ?? new AddressJourneyService(createAddressLookupClient());

  application.disable('x-powered-by');

  application.use(express.urlencoded({ extended: false }));
  application.use(
    session({
      secret: getSessionSecret(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );

  nunjucks.configure([path.join(frontendDirectory, 'views'), govukFrontendDistributionDirectory], {
    autoescape: true,
    express: application,
    noCache: process.env.NODE_ENV !== 'production',
  });

  application.use(
    '/assets',
    express.static(path.join(frontendDirectory, 'public'), { dotfiles: 'deny', index: false }),
  );

  application.get('/assets/govuk/govuk-frontend.min.js', (_request, response) => {
    response.sendFile(
      path.join(govukFrontendDistributionDirectory, 'govuk', 'govuk-frontend.min.js'),
    );
  });

  application.get('/assets/govuk/govuk-frontend.min.js.map', (_request, response) => {
    response.sendFile(
      path.join(govukFrontendDistributionDirectory, 'govuk', 'govuk-frontend.min.js.map'),
    );
  });

  application.use(protectAgainstCsrf);
  application.use(addCsrfTokenToViews);

  application.use('/', homeRouter);
  application.use('/before-you-start', beforeYouStartRouter);
  application.use('/', createAddressRouter(addressJourney));

  return application;
}
