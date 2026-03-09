import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexSource = readFileSync(new URL('../index.ts', import.meta.url), 'utf-8');

test('dynamic squad pipeline prints visible stage progress for every mood stage', () => {
  assert.match(indexSource, /Stages: interpret mood → curate songs → apply mood logic/);
  assert.match(indexSource, /const executionBatches = buildMoodPipelineExecutionBatches\(moodPipeline\);/);
  assert.match(indexSource, /await Promise\.all\(batch\.map\(async \(stage\) => \(\{ stage, output: await runStage\(stage\) \}\)\)\);/);

  for (const [stageId, activity, completion] of [
    ['interpret-mood', 'Interpreting mood', 'Mood interpretation complete'],
    ['curate-songs', 'Curating songs', 'Song curation complete'],
    ['apply-mood-logic', 'Applying mood logic', 'Mood logic checks complete'],
  ] as const) {
    assert.match(indexSource, new RegExp(`case '${stageId}':[\\s\\S]*activity: '${activity}'`));
    assert.match(indexSource, new RegExp(`case '${stageId}':[\\s\\S]*completion: '${completion}'`));
  }

  const loopStart = indexSource.indexOf('for (const batch of executionBatches) {');
  const stageStartLog = indexSource.indexOf('console.log(`${C.cyan}  ${index + 1}/${moodPipeline.length} ${stageLabel.activity}...${C.reset}`);');
  const stageStartParallelLog = indexSource.indexOf('console.log(`${C.cyan}  ${stageNumber}/${moodPipeline.length} ${stageLabel.activity}...${C.reset}`);');
  const promiseAll = indexSource.indexOf('const batchResults = await Promise.all(batch.map(async (stage) => ({ stage, output: await runStage(stage) })));');
  const stageDoneLog = indexSource.indexOf('console.log(`${C.green}     ✓ ${stageLabel.completion}.${C.reset}`);');
  const pipelineCompleteLog = indexSource.indexOf('console.log(`${C.green}  ✓ Squad pipeline complete.${C.reset}`);');

  assert.equal(loopStart >= 0, true);
  assert.equal(stageStartLog < 0, true);
  assert.equal(stageStartParallelLog > loopStart, true);
  assert.equal(promiseAll > stageStartParallelLog, true);
  assert.equal(stageDoneLog > stageStartParallelLog, true);
  assert.equal(pipelineCompleteLog > stageDoneLog, true);
});

test('fallback path emits clear progress and warning messaging', () => {
  assert.match(indexSource, /Dynamic pipeline unavailable\. Falling back to deterministic mood logic\.\.\./);
  assert.match(indexSource, /✓ Fallback playlist generated\./);
  assert.match(indexSource, /warning: `Dynamic generation unavailable \(\$\{reason\}\)\. Using deterministic fallback\.`/);

  const warningPrintedInMain = indexSource.indexOf('if (dynamicPlan.warning) {');
  const warningConsoleLog = indexSource.indexOf('console.log(`${C.yellow}  ${dynamicPlan.warning}${C.reset}`);');
  assert.equal(warningPrintedInMain >= 0, true);
  assert.equal(warningConsoleLog > warningPrintedInMain, true);
});

test('startup config enables Node warning suppression before Squad subprocess kickoff', () => {
  assert.match(indexSource, /function configureSubprocessWarningSuppression\(\): \(\) => void \{/);
  assert.match(indexSource, /process\.env\.NODE_NO_WARNINGS = '1';/);
  assert.match(indexSource, /--no-warnings/);

  const suppressionConfigIndex = indexSource.indexOf(
    'const restoreSubprocessWarningEnv = configureSubprocessWarningSuppression();',
  );
  const clientConstructIndex = indexSource.indexOf('client = new SquadClient({');
  const clientConnectIndex = indexSource.indexOf('await client.connect();');
  assert.equal(suppressionConfigIndex >= 0, true);
  assert.equal(clientConstructIndex > suppressionConfigIndex, true);
  assert.equal(clientConnectIndex > suppressionConfigIndex, true);
});
