import test from 'node:test';
import assert from 'node:assert/strict';
import { SquadClient } from '@bradygaster/squad-sdk/client';
import { generateDynamicPlaylist } from '../index.js';
import { MAX_PLAYLIST_SONGS, suggestSongs } from '../mood-logic.js';

function stripAnsi(value: string): string {
  return value.replace(/\x1b\[[0-9;]*m/g, '');
}

function extractStageId(prompt: string): string {
  const match = prompt.match(/Active stage: ([^\n]+)/);
  assert.ok(match);
  return match[1] as string;
}

test('parallel batches start independent stages before dependent stage and keep progress ordering coherent', async () => {
  const originalConsoleLog = console.log;
  const originalConnect = SquadClient.prototype.connect;
  const originalDisconnect = SquadClient.prototype.disconnect;
  const originalCreateSession = SquadClient.prototype.createSession;

  const logs: string[] = [];
  const started: string[] = [];
  const resolvers = new Map<string, (value: unknown) => void>();

  console.log = (...args: unknown[]) => {
    logs.push(args.map((part) => String(part)).join(' '));
  };

  SquadClient.prototype.connect = async () => {};
  SquadClient.prototype.disconnect = async () => [];
  SquadClient.prototype.createSession = async () => ({
    sendAndWait: async ({ prompt }: { prompt: string }) => {
      const stageId = extractStageId(prompt);
      started.push(stageId);
      return await new Promise((resolve) => {
        resolvers.set(stageId, resolve);
      });
    },
    close: async () => {},
  }) as Awaited<ReturnType<SquadClient['createSession']>>;

  try {
    const playlistPromise = generateDynamicPlaylist('I need focus', []);

    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(started, ['interpret-mood', 'curate-songs']);
    assert.equal(started.includes('apply-mood-logic'), false);

    resolvers.get('curate-songs')?.(JSON.stringify({
      songs: [{ genre: 'Lo-fi', artist: 'Nujabes', song: 'Feather' }],
    }));
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(started.includes('apply-mood-logic'), false);

    resolvers.get('interpret-mood')?.(JSON.stringify({
      moodPhrase: 'Calm Focus',
      adjacentMoods: ['Quiet Drive'],
    }));
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(started, ['interpret-mood', 'curate-songs', 'apply-mood-logic']);

    resolvers.get('apply-mood-logic')?.(JSON.stringify({
      moodPhrase: 'Calm Focus',
      adjacentMoods: ['Quiet Drive'],
      songs: [{ genre: 'Lo-fi', artist: 'Nujabes', song: 'Feather' }],
    }));
    const result = await playlistPromise;

    assert.equal(result.usedFallback, false);
    assert.equal(result.moodPhrase, 'Calm Focus');
    assert.deepEqual(result.songs, [{ genre: 'Lo-fi', artist: 'Nujabes', song: 'Feather' }]);

    const cleanedLogs = logs.map(stripAnsi);
    const firstStageStartIndex = cleanedLogs.findIndex((line) => line.includes('1/3 Interpreting mood...'));
    const secondStageStartIndex = cleanedLogs.findIndex((line) => line.includes('2/3 Curating songs...'));
    const firstCompletionIndex = cleanedLogs.findIndex((line) => line.includes('✓ Mood interpretation complete.'));
    const pipelineCompleteIndex = cleanedLogs.findIndex((line) => line.includes('✓ Squad pipeline complete.'));
    assert.equal(firstStageStartIndex >= 0, true);
    assert.equal(secondStageStartIndex > firstStageStartIndex, true);
    assert.equal(firstCompletionIndex > secondStageStartIndex, true);
    assert.equal(pipelineCompleteIndex > firstCompletionIndex, true);
  } finally {
    console.log = originalConsoleLog;
    SquadClient.prototype.connect = originalConnect;
    SquadClient.prototype.disconnect = originalDisconnect;
    SquadClient.prototype.createSession = originalCreateSession;
  }
});

test('merged output remains behaviorally equivalent when final stage output is malformed', async () => {
  const originalConnect = SquadClient.prototype.connect;
  const originalDisconnect = SquadClient.prototype.disconnect;
  const originalCreateSession = SquadClient.prototype.createSession;

  const stagePayloadById = new Map<string, unknown>([
    ['interpret-mood', JSON.stringify({ moodPhrase: 'Calm Focus', adjacentMoods: ['Rainy Reflection'] })],
    ['curate-songs', JSON.stringify({ songs: [{ genre: 'Lo-fi', artist: 'Bonobo', song: 'Cirrus' }] })],
    ['apply-mood-logic', 'not valid json'],
  ]);

  SquadClient.prototype.connect = async () => {};
  SquadClient.prototype.disconnect = async () => [];
  SquadClient.prototype.createSession = async () => ({
    sendAndWait: async ({ prompt }: { prompt: string }) => stagePayloadById.get(extractStageId(prompt)),
    close: async () => {},
  }) as Awaited<ReturnType<SquadClient['createSession']>>;

  try {
    const result = await generateDynamicPlaylist('need to focus', []);
    assert.equal(result.usedFallback, false);
    assert.equal(result.warning, undefined);
    assert.equal(result.moodPhrase, 'Calm Focus');
    assert.deepEqual(result.adjacentMoods, ['Rainy Reflection']);
    assert.deepEqual(result.songs, [{ genre: 'Lo-fi', artist: 'Bonobo', song: 'Cirrus' }]);
  } finally {
    SquadClient.prototype.connect = originalConnect;
    SquadClient.prototype.disconnect = originalDisconnect;
    SquadClient.prototype.createSession = originalCreateSession;
  }
});

test('hard pipeline failure still returns deterministic fallback and coherent fallback messaging', async () => {
  const originalConsoleLog = console.log;
  const originalConnect = SquadClient.prototype.connect;
  const originalDisconnect = SquadClient.prototype.disconnect;
  const originalCreateSession = SquadClient.prototype.createSession;

  const logs: string[] = [];
  console.log = (...args: unknown[]) => {
    logs.push(args.map((part) => String(part)).join(' '));
  };

  SquadClient.prototype.connect = async () => {};
  SquadClient.prototype.disconnect = async () => [];
  SquadClient.prototype.createSession = async () => {
    throw new Error('mocked-stage-session-failure');
  };

  try {
    const result = await generateDynamicPlaylist('need to focus', []);
    assert.equal(result.usedFallback, true);
    assert.equal(result.moodPhrase, 'Calm Focus');
    assert.deepEqual(result.songs, suggestSongs('Calm Focus', MAX_PLAYLIST_SONGS));
    assert.match(result.warning ?? '', /mocked-stage-session-failure/);

    const cleanedLogs = logs.map(stripAnsi).join('\n');
    assert.match(cleanedLogs, /Dynamic pipeline unavailable\. Falling back to deterministic mood logic\.\.\./);
    assert.match(cleanedLogs, /✓ Fallback playlist generated\./);
  } finally {
    console.log = originalConsoleLog;
    SquadClient.prototype.connect = originalConnect;
    SquadClient.prototype.disconnect = originalDisconnect;
    SquadClient.prototype.createSession = originalCreateSession;
  }
});
