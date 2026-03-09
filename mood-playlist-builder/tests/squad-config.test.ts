import test from 'node:test';
import assert from 'node:assert/strict';
import squadConfig from '../squad.config.js';
import { moodPipeline } from '../squad.config.js';
import {
  assertMoodOrchestrationConfig,
  buildMoodPipelineExecutionBatches,
  buildMoodPlannerSystemPrompt,
} from '../squad-orchestration.js';

test('mood-playlist orchestration requires all squad.config.ts responsibility agents', () => {
  assert.doesNotThrow(() => assertMoodOrchestrationConfig());

  const missingLogicConductor = {
    ...squadConfig,
    agents: squadConfig.agents.filter((agent) => agent.name !== 'mood-logic-guardian'),
  };

  assert.throws(
    () => assertMoodOrchestrationConfig(missingLogicConductor as typeof squadConfig),
    /missing required mood squad agent "mood-logic-guardian"/,
  );
});

test('system prompt is assembled from squad.config.ts roles and charters', () => {
  const prompt = buildMoodPlannerSystemPrompt();

  for (const [name, role] of [
    ['mood-interpreter', 'Mood Interpreter'],
    ['song-curator', 'Song Curator'],
    ['mood-logic-guardian', 'Mood Logic Guardian'],
  ] as const) {
    assert.equal(prompt.includes(name), true);
    assert.equal(prompt.includes(`### ${role}`), true);
  }

  const overridden = {
    ...squadConfig,
    agents: squadConfig.agents.map((agent) =>
      agent.name === 'song-curator'
        ? {
            ...agent,
            charter: 'OVERRIDE_CHARTER_TOKEN: curated tracks must be emotionally coherent.',
          }
        : agent,
    ),
  };

  const overriddenPrompt = buildMoodPlannerSystemPrompt(overridden as typeof squadConfig);
  assert.equal(overriddenPrompt.includes('OVERRIDE_CHARTER_TOKEN'), true);
});

test('pipeline dependency batching preserves config-driven orchestration and parallel stages', () => {
  const batches = buildMoodPipelineExecutionBatches(moodPipeline);
  const stageIdsByBatch = batches.map((batch) => batch.map((stage) => stage.id));

  assert.deepEqual(stageIdsByBatch, [
    ['interpret-mood', 'curate-songs'],
    ['apply-mood-logic'],
  ]);

  const invalidPipeline = [
    ...moodPipeline,
    {
      id: 'invalid-stage',
      agent: '@mood-interpreter',
      objective: 'invalid',
      outputSchema: '{}',
      dependsOn: ['missing-stage'],
    },
  ] as unknown as typeof moodPipeline;

  assert.throws(
    () => buildMoodPipelineExecutionBatches(invalidPipeline),
    /depends on unknown stage "missing-stage"/,
  );
});
