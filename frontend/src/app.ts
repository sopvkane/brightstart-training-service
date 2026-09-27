import { createRequire } from 'node:module';
import path from 'node:path';

import express, { type Express } from 'express';
import nunjucks from 'nunjucks';

import { homeRouter } from './routes/home.js';

const require = createRequire(import.meta.url);

function resolveGovukFrontendTemplatesDirectory(): string {
  // npm may install this workspace dependency beside the frontend or hoist it to the repository
  // root. Node's resolver finds the installed package reliably in either layout.
  const packageJson = require.resolve('govuk-frontend/package.json');

  return path.join(path.dirname(packageJson), 'dist');
}

export function createApplication(): Express {
  const application = express();
  const frontendDirectory = path.resolve(import.meta.dirname, '..');
  const govukFrontendTemplatesDirectory = resolveGovukFrontendTemplatesDirectory();

  application.disable('x-powered-by');

  nunjucks.configure([path.join(frontendDirectory, 'views'), govukFrontendTemplatesDirectory], {
    autoescape: true,
    express: application,
    noCache: process.env.NODE_ENV !== 'production',
  });

  application.use(
    '/assets',
    express.static(path.join(frontendDirectory, 'public'), { dotfiles: 'deny', index: false }),
  );

  application.use('/', homeRouter);

  return application;
}
