import { createApplication } from './app.js';

const defaultPort = 3000;
const configuredPort = process.env.PORT;
const port = configuredPort === undefined ? defaultPort : Number(configuredPort);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(`PORT must be a whole number between 1 and 65535. Received: ${configuredPort}`);
}

createApplication().listen(port, () => {
  console.log(`Frontend listening on http://localhost:${port}`);
});
