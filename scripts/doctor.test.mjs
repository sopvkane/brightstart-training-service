import assert from 'node:assert/strict';
import test from 'node:test';

import { assessMajorVersion, parseMajorVersion } from './doctor.mjs';

test('reads the major version from supported tool output', () => {
  assert.equal(parseMajorVersion('v22.23.3'), 22);
  assert.equal(parseMajorVersion('10.9.9'), 10);
  assert.equal(parseMajorVersion('openjdk version "17.0.12" 2024-07-16'), 17);
});

test('accepts any patch release in the required major version', () => {
  assert.deepEqual(assessMajorVersion('Node.js', 'v22.99.1', 22, 'install-nodejs-and-npm'), {
    passed: true,
    message: 'Node.js 22 detected',
  });
});

test('returns actionable guidance for an incompatible major version', () => {
  assert.deepEqual(assessMajorVersion('Java', 'openjdk version "21.0.2"', 17, 'install-java'), {
    passed: false,
    message: 'Java version 21',
    detail: 'Required: Java 17\nSee: docs/setup.md#install-java',
  });
});
