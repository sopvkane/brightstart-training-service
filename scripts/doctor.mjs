import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const setupGuide = 'docs/setup.md';

export function parseMajorVersion(output) {
  const match = output.match(/(?:^|\s|v|version[ "']+)(\d+)(?:\.|\s|$)/i);
  return match === null ? undefined : Number(match[1]);
}

export function assessMajorVersion(name, output, requiredMajor, setupSection) {
  const detectedMajor = parseMajorVersion(output);

  if (detectedMajor === requiredMajor) {
    return { passed: true, message: `${name} ${requiredMajor} detected` };
  }

  const detected =
    detectedMajor === undefined ? 'an unreadable version' : `version ${detectedMajor}`;
  return {
    passed: false,
    message: `${name} ${detected}`,
    detail: `Required: ${name} ${requiredMajor}\nSee: ${setupGuide}#${setupSection}`,
  };
}

function commandVersion(command, arguments_) {
  const result = spawnSync(command, arguments_, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  if (result.error !== undefined || result.status !== 0) {
    return undefined;
  }

  return `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim();
}

function commandCheck(name, command, arguments_, setupSection) {
  const version = commandVersion(command, arguments_);

  if (version === undefined) {
    return {
      passed: false,
      message: `${name} was not found`,
      detail: `See: ${setupGuide}#${setupSection}`,
    };
  }

  return { passed: true, message: `${name} installed` };
}

async function playwrightCheck() {
  if (!existsSync('node_modules')) {
    return {
      passed: false,
      message: 'Playwright Chromium could not be checked before dependencies are installed',
      detail: `Run: npm ci\nSee: ${setupGuide}#install-repository-dependencies`,
    };
  }

  try {
    const { chromium } = await import('@playwright/test');

    if (existsSync(chromium.executablePath())) {
      return { passed: true, message: 'Playwright Chromium available' };
    }
  } catch {
    // The actionable result below is the same whether the package or browser executable is absent.
  }

  return {
    passed: false,
    message: 'Playwright Chromium was not found',
    detail: `Run: npm run install:browser\nSee: ${setupGuide}#install-playwright-chromium`,
  };
}

export async function inspectEnvironment() {
  const nodeResult = assessMajorVersion('Node.js', process.version, 22, 'install-nodejs-and-npm');
  const npmVersion = commandVersion('npm', ['--version']);
  const javaVersion = commandVersion('java', ['-version']);

  return [
    commandCheck('Git', 'git', ['--version'], 'install-git'),
    nodeResult,
    npmVersion === undefined
      ? {
          passed: false,
          message: 'npm was not found',
          detail: `See: ${setupGuide}#install-nodejs-and-npm`,
        }
      : assessMajorVersion('npm', npmVersion, 10, 'install-nodejs-and-npm'),
    javaVersion === undefined
      ? {
          passed: false,
          message: 'Java was not found',
          detail: `Required: Java 17\nSee: ${setupGuide}#install-java`,
        }
      : assessMajorVersion('Java', javaVersion, 17, 'install-java'),
    existsSync('node_modules/.package-lock.json')
      ? { passed: true, message: 'Node dependencies installed' }
      : {
          passed: false,
          message: 'Node dependencies were not found',
          detail: `Run: npm ci\nSee: ${setupGuide}#install-repository-dependencies`,
        },
    await playwrightCheck(),
  ];
}

export function printReport(results) {
  console.log('BrightStart development environment\n');

  for (const result of results) {
    console.log(`${result.passed ? '✓' : '✗'} ${result.message}`);
    if (result.detail !== undefined) {
      console.log(`  ${result.detail.replaceAll('\n', '\n  ')}`);
    }
  }

  console.log(
    results.every((result) => result.passed)
      ? '\nYour environment is ready.'
      : '\nFix the items marked ✗, then run npm run doctor again.',
  );
}

async function main() {
  const results = await inspectEnvironment();
  printReport(results);

  if (results.some((result) => !result.passed)) {
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
