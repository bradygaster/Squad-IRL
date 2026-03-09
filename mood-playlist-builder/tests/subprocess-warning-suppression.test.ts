import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexSource = readFileSync(new URL('../index.ts', import.meta.url), 'utf-8');

test('squad subprocess warning suppression sets and restores node warning env', () => {
  assert.match(indexSource, /function configureSubprocessWarningSuppression\(\): \(\) => void/);
  assert.match(indexSource, /process\.env\.NODE_NO_WARNINGS = '1';/);
  assert.match(indexSource, /process\.env\.NODE_OPTIONS = previousNodeOptions \? `\$\{previousNodeOptions\} --no-warnings` : '--no-warnings';/);
  assert.match(indexSource, /delete process\.env\.NODE_NO_WARNINGS;/);
  assert.match(indexSource, /delete process\.env\.NODE_OPTIONS;/);
});

test('playlist generation applies suppression before SquadClient and restores in finally', () => {
  const configureIndex = indexSource.indexOf('const restoreSubprocessWarningEnv = configureSubprocessWarningSuppression();');
  const clientInitIndex = indexSource.indexOf('client = new SquadClient({');
  const disconnectIndex = indexSource.indexOf('await client?.disconnect();');
  const restoreIndex = indexSource.indexOf('restoreSubprocessWarningEnv();');

  assert.equal(configureIndex >= 0, true);
  assert.equal(clientInitIndex > configureIndex, true);
  assert.equal(disconnectIndex > clientInitIndex, true);
  assert.equal(restoreIndex > disconnectIndex, true);
});
