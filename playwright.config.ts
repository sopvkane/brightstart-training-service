import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './browser-tests',
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
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
      command: './mvnw spring-boot:run',
      cwd: 'api',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: 'http://127.0.0.1:8080/api/health',
    },
    {
      command: 'npm run dev:frontend',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      url: 'http://127.0.0.1:3000',
    },
  ],
});
