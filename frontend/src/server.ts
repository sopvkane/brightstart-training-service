import { createApplication } from './app.js';
import { loadApplicationConfig } from './configuration.js';

const config = loadApplicationConfig();

createApplication({ config }).listen(config.port, () => {
  console.log(`Frontend listening on http://localhost:${config.port}`);
});
