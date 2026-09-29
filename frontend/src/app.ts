import { createRequire } from 'node:module';
import path from 'node:path';

import express, { type Express } from 'express';
import session from 'express-session';
import nunjucks from 'nunjucks';

import { createAddressLookupClient } from './address-api-client.js';
import { type AddressJourney, AddressJourneyService } from './address-journey-service.js';
import { type ApplicationConfig, loadApplicationConfig } from './configuration.js';
import { addCsrfTokenToViews, protectAgainstCsrf } from './csrf-protection.js';
import { createDocumentUploadClient, type DocumentUploadClient } from './document-upload-client.js';
import { parseDocumentUpload } from './document-upload-parser.js';
import { createDocumentImageClient, type DocumentImageClient } from './document-image-client.js';
import { createAddressRouter } from './routes/address.js';
import { beforeYouStartRouter } from './routes/before-you-start.js';
import { createDocumentUploadRouter } from './routes/document-upload.js';
import { checkAnswersRouter } from './routes/check-answers.js';
import { homeRouter } from './routes/home.js';
import { createIdentityDocumentRouter } from './routes/identity-document.js';
import { createSubmissionRouter } from './routes/submission.js';
import { createRequestContextMiddleware } from './request-context.js';
import { createSubmissionApiClient } from './submission-api-client.js';
import { type SubmissionJourney, SubmissionJourneyService } from './submission-journey-service.js';

const require = createRequire(import.meta.url);

function resolveGovukFrontendDistributionDirectory(): string {
  // npm may install this workspace dependency beside the frontend or hoist it to the repository
  // root. Node's resolver finds the installed package reliably in either layout.
  const packageJson = require.resolve('govuk-frontend/package.json');

  return path.join(path.dirname(packageJson), 'dist');
}

type ApplicationOptions = {
  config?: ApplicationConfig;
  addressJourney?: AddressJourney;
  documentUploadClient?: DocumentUploadClient;
  documentImageClient?: DocumentImageClient;
  submissionJourney?: SubmissionJourney;
  requestLogger?: (message: string) => void;
};

export function createApplication(options: ApplicationOptions = {}): Express {
  const application = express();
  const config = options.config ?? loadApplicationConfig();
  const frontendDirectory = path.resolve(import.meta.dirname, '..');
  const govukFrontendDistributionDirectory = resolveGovukFrontendDistributionDirectory();
  const addressJourney =
    options.addressJourney ??
    new AddressJourneyService(createAddressLookupClient(config.apiBaseUrl));
  const documentUploadClient =
    options.documentUploadClient ?? createDocumentUploadClient(config.apiBaseUrl);
  const documentImageClient =
    options.documentImageClient ?? createDocumentImageClient(config.apiBaseUrl);
  const submissionJourney =
    options.submissionJourney ??
    new SubmissionJourneyService(createSubmissionApiClient(config.apiBaseUrl));

  application.disable('x-powered-by');
  application.use(createRequestContextMiddleware(options.requestLogger));

  application.use(express.urlencoded({ extended: false }));
  application.use(
    session({
      secret: config.sessionSecret,
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
    noCache: !config.production,
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

  // Multipart fields must be parsed before the existing CSRF middleware can read the hidden token.
  // This parser runs only for the upload POST and keeps the file in memory rather than on disk.
  application.post('/upload-document', parseDocumentUpload);
  application.use(protectAgainstCsrf);
  application.use(addCsrfTokenToViews);

  application.use('/', homeRouter);
  application.use('/before-you-start', beforeYouStartRouter);
  application.use('/', createAddressRouter(addressJourney));
  application.use('/', createIdentityDocumentRouter(config.documentGuidanceV2));
  application.use('/', createDocumentUploadRouter(documentUploadClient));
  application.use('/', checkAnswersRouter);
  application.use('/', createSubmissionRouter(submissionJourney, documentImageClient));

  return application;
}
