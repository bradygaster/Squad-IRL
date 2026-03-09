import squadConfig, { moodPipeline, REQUIRED_MOOD_AGENT_NAMES } from './squad.config.js';

type SquadLike = typeof squadConfig;
type PipelineStage = (typeof moodPipeline)[number];
type PipelineStageId = PipelineStage['id'];

function requireMoodAgent(config: SquadLike, name: string): { name: string; role: string; charter: string } {
  const found = (config.agents ?? []).find((agent) => agent.name === name);
  if (!found) {
    throw new Error(`squad.config.ts is missing required mood squad agent "${name}".`);
  }

  const role = typeof found.role === 'string' ? found.role.trim() : '';
  const charter = typeof found.charter === 'string' ? found.charter.trim() : '';
  if (!role || !charter) {
    throw new Error(`Agent "${name}" in squad.config.ts must define non-empty role and charter.`);
  }

  return { name, role, charter };
}

export function assertMoodOrchestrationConfig(config: SquadLike = squadConfig): void {
  for (const required of REQUIRED_MOOD_AGENT_NAMES) {
    requireMoodAgent(config, required);
  }
}

export function buildMoodPipelineExecutionBatches(pipeline: readonly PipelineStage[] = moodPipeline): PipelineStage[][] {
  const stageIds = new Set<PipelineStageId>(pipeline.map((stage) => stage.id));
  for (const stage of pipeline) {
    for (const dependency of stage.dependsOn ?? []) {
      if (!stageIds.has(dependency as PipelineStageId)) {
        throw new Error(`Stage "${stage.id}" depends on unknown stage "${dependency}".`);
      }
    }
  }

  const resolved = new Set<PipelineStageId>();
  const pending = new Set<PipelineStageId>(pipeline.map((stage) => stage.id));
  const batches: PipelineStage[][] = [];

  while (pending.size > 0) {
    const ready = pipeline.filter((stage) => {
      if (!pending.has(stage.id)) return false;
      const dependencies = stage.dependsOn ?? [];
      return dependencies.every((dependency) => resolved.has(dependency as PipelineStageId));
    });

    if (ready.length === 0) {
      const blocked = [...pending].join(', ');
      throw new Error(`Mood pipeline dependencies are cyclic or unsatisfied: ${blocked}.`);
    }

    batches.push(ready);
    for (const stage of ready) {
      pending.delete(stage.id);
      resolved.add(stage.id);
    }
  }

  return batches;
}

export function buildMoodPlannerSystemPrompt(config: SquadLike = squadConfig): string {
  assertMoodOrchestrationConfig(config);

  const teamName = config.team?.name ?? 'Mood Playlist Builder Squad';
  const teamDescription = config.team?.description ?? '';
  const projectContext = config.team?.projectContext ?? '';

  const responsibilitySections = REQUIRED_MOOD_AGENT_NAMES.map((name) => {
    const agent = requireMoodAgent(config, name);
    return `### ${agent.role}\n@${agent.name}\n${agent.charter}`;
  }).join('\n\n');

  const routingRules = (config.routing?.rules ?? [])
    .map((rule) => `- "${rule.pattern}" -> ${(rule.agents ?? []).join(', ')}`)
    .join('\n');

  const pipelineContract = moodPipeline
    .map((stage) => `- ${stage.id} via ${stage.agent}: ${stage.objective} -> ${stage.outputSchema}`)
    .join('\n');

  return [
    `You are the **${teamName}**.`,
    teamDescription,
    projectContext,
    '## Non-bypassable responsibilities',
    responsibilitySections,
    '## Routing',
    routingRules,
    '## Pipeline stages (from squad.config.ts)',
    pipelineContract,
    '## Output contract',
    'Return strict JSON for the active stage only.',
    'For final output, return one JSON object with keys: moodPhrase, adjacentMoods, songs.',
    'moodPhrase must be a 1-3 word title-cased string.',
    'adjacentMoods must be an array of 0-4 strings.',
    'songs must contain 1-8 items with non-empty genre, artist, and song.',
    'Do not output markdown, comments, or extra keys.',
  ].join('\n\n');
}

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === 'object') {
    if (Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  }
  if (typeof value !== 'string') return null;

  const text = value.trim();
  if (!text) return null;

  const parse = (payload: string): Record<string, unknown> | null => {
    try {
      const parsed = JSON.parse(payload);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  };

  const direct = parse(text);
  if (direct) return direct;

  const fenced = text.match(/```json\s*([\s\S]*?)```/i) ?? text.match(/```\s*([\s\S]*?)```/);
  if (fenced?.[1]) {
    const parsedFence = parse(fenced[1].trim());
    if (parsedFence) return parsedFence;
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return parse(text.slice(firstBrace, lastBrace + 1));
  }

  return null;
}

export function buildStagePrompt(
  stage: PipelineStage,
  contextPayload: Record<string, unknown>,
  stageOutputs: Record<string, unknown>,
  config: SquadLike = squadConfig,
): string {
  assertMoodOrchestrationConfig(config);
  const activeAgent = requireMoodAgent(config, stage.agent.replace(/^@/, ''));
  const interpreted = parseJsonObject(stageOutputs['interpret-mood']);
  const curated = parseJsonObject(stageOutputs['curate-songs']);

  const stageInput = stage.id === 'interpret-mood'
    ? {
      rawMood: contextPayload.rawMood,
      archive: contextPayload.archive,
      constraints: contextPayload.constraints,
    }
    : stage.id === 'curate-songs'
      ? {
        rawMood: contextPayload.rawMood,
        interpretedMood: interpreted,
        archive: contextPayload.archive,
        constraints: contextPayload.constraints,
      }
      : {
        rawMood: contextPayload.rawMood,
        interpretedMood: interpreted,
        curatedSongs: curated,
        archive: contextPayload.archive,
        constraints: contextPayload.constraints,
      };

  return [
    `Active stage: ${stage.id}`,
    `Route to: ${stage.agent}`,
    `Objective: ${stage.objective}`,
    `Role: ${activeAgent.role}`,
    `Charter: ${activeAgent.charter}`,
    `Required output schema: ${stage.outputSchema}`,
    'Return JSON only. No markdown. No extra keys.',
    '',
    JSON.stringify(stageInput, null, 2),
  ].join('\n');
}

export function mergeMoodPipelineOutputs(stageOutputs: Record<string, unknown>): unknown {
  const interpreted = parseJsonObject(stageOutputs['interpret-mood']);
  const curated = parseJsonObject(stageOutputs['curate-songs']);
  const logicValidated = parseJsonObject(stageOutputs['apply-mood-logic']);

  if (logicValidated) return logicValidated;
  return {
    moodPhrase: interpreted?.moodPhrase,
    adjacentMoods: interpreted?.adjacentMoods,
    songs: curated?.songs,
  };
}
