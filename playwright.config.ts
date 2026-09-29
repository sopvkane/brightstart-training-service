import { defineConfig, devices } from '@playwright/test';

const frontendPort = process.env.PLAYWRIGHT_FRONTEND_PORT ?? '3000';
const apiPort = process.env.PLAYWRIGHT_API_PORT ?? '8080';
const frontendBaseUrl = `http://127.0.0.1:${frontendPort}`;
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;

export default defineConfig({
  testDir: './browser-tests',
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: frontendBaseUrl,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=${apiPort}`,
      cwd: 'api',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: `${apiBaseUrl}/api/health`,
    },
    {
      command: 'npm run dev:frontend',
      env: {
        ...process.env,
        ADDRESS_API_BASE_URL: apiBaseUrl,
        PORT: frontendPort,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      url: frontendBaseUrl,
    },
  ],
});
