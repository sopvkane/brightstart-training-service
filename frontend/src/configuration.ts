export type ApplicationConfig = {
  port: number;
  apiBaseUrl: string;
  sessionSecret: string;
  documentGuidanceV2: boolean;
  production: boolean;
};

const developmentSessionSecret = 'brightstart-training-service-local-development-only';

export function parseBooleanSetting(name: string, value: string | undefined): boolean {
  if (value === undefined || value === 'false') {
    return false;
  }

  if (value === 'true') {
    return true;
  }

  throw new Error(`${name} must be either true or false. Received: ${value}`);
}

function parsePort(value: string | undefined): number {
  const port = value === undefined ? 3000 : Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`PORT must be a whole number between 1 and 65535. Received: ${value}`);
  }

  return port;
}

export function loadApplicationConfig(
  environment: NodeJS.ProcessEnv = process.env,
): ApplicationConfig {
  const production = environment.NODE_ENV === 'production';
  const configuredSessionSecret = environment.SESSION_SECRET;

  if (production && !configuredSessionSecret) {
    throw new Error('SESSION_SECRET must be set when NODE_ENV is production.');
  }

  return {
    port: parsePort(environment.PORT),
    apiBaseUrl: environment.ADDRESS_API_BASE_URL ?? 'http://localhost:8080',
    sessionSecret: configuredSessionSecret || developmentSessionSecret,
    documentGuidanceV2: parseBooleanSetting(
      'DOCUMENT_GUIDANCE_V2',
      environment.DOCUMENT_GUIDANCE_V2,
    ),
    production,
  };
}
