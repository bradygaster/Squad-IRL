import {
  defineAgent,
  defineDefaults,
  defineRouting,
  defineSquad,
  defineTeam,
} from '@bradygaster/squad-sdk';

const moodInterpreter = defineAgent({
  name: 'mood-interpreter',
  role: 'Mood Interpreter',
  description: 'Summarizes raw mood text into a clear 1-3 word phrase with adjacent options.',
  charter: `
You convert free-form mood check-ins into a concise, reusable mood signal.

Return strict JSON only:
{
  "moodPhrase": "1-3 word title-cased phrase",
  "adjacentMoods": ["string", "string"]
}

Rules:
- moodPhrase must be non-empty and 1-3 words
- adjacentMoods is an array with 0-4 strings
- no markdown, no extra keys
`,
  tools: [],
});

const songCurator = defineAgent({
  name: 'song-curator',
  role: 'Song Curator',
  description: 'Builds a mood-aligned list of songs with genre, artist, and title.',
  charter: `
You curate songs that match the interpreted mood.

Return strict JSON only:
{
  "songs": [
    { "genre": "string", "artist": "string", "song": "string" }
  ]
}

Rules:
- include 1-8 songs
- each item needs non-empty genre, artist, and song
- no markdown, no extra keys
`,
  tools: [],
});

const moodLogicGuardian = defineAgent({
  name: 'mood-logic-guardian',
  role: 'Mood Logic Guardian',
  description: 'Applies history-aware mood logic and fallback policy guardrails.',
  charter: `
You are the policy and reliability checkpoint for mood planning output.

Return strict JSON only:
{
  "moodPhrase": "1-3 word title-cased mood phrase",
  "adjacentMoods": ["string", "string"],
  "songs": [
    { "genre": "string", "artist": "string", "song": "string" }
  ]
}

Rules:
- preserve the interpreted mood intent
- keep adjacent moods history-aware when context suggests it
- songs must contain 1-8 valid items
- no markdown, no extra keys
`,
  tools: [],
});

const team = defineTeam({
  name: 'Mood Playlist Squad',
  description: 'A role-based mood pipeline that interprets mood, curates songs, and enforces mood logic.',
  projectContext: `
This squad powers the mood playlist pipeline in three explicit roles:
- Mood Interpreter: summarize the user's raw mood into a stable phrase with adjacent mood options
- Song Curator: produce the actual song list aligned to the interpreted mood
- Mood Logic Guardian: apply history-aware suggestion policy and enforce fallback-safe output contracts
`,
  members: ['@mood-interpreter', '@song-curator', '@mood-logic-guardian'],
});

const routing = defineRouting({
  rules: [
    {
      pattern: 'mood|feeling|summarize|phrase|adjacent',
      agents: ['@mood-interpreter'],
      tier: 'direct',
      description: 'Mood interpretation and summarization',
    },
    {
      pattern: 'songs|playlist|genre|artist|curate|music',
      agents: ['@song-curator'],
      tier: 'direct',
      description: 'Song matching and curation',
    },
    {
      pattern: 'history|fallback|policy|guardrail|logic',
      agents: ['@mood-logic-guardian'],
      tier: 'direct',
      description: 'History-aware mood logic and fallback policy',
    },
    {
      pattern: 'mood playlist|plan playlist|build playlist|full pipeline',
      agents: ['@mood-interpreter', '@song-curator', '@mood-logic-guardian'],
      tier: 'full',
      priority: 10,
      description: 'Full mood-to-playlist pipeline',
    },
  ],
});

const defaults = defineDefaults({
  model: {
    preferred: 'claude-sonnet-4.5',
    rationale: 'Strong structured-output quality for staged mood planning',
    fallback: 'claude-haiku-4.5',
  },
});

export const moodPipeline = [
  {
    id: 'interpret-mood',
    agent: '@mood-interpreter',
    objective: 'Summarize raw mood input into a stable mood phrase and adjacent moods.',
    outputSchema: '{ "moodPhrase": "string", "adjacentMoods": ["string"] }',
    dependsOn: [],
  },
  {
    id: 'curate-songs',
    agent: '@song-curator',
    objective: 'Curate 1-8 mood-matching songs with genre, artist, and song.',
    outputSchema: '{ "songs": [{ "genre": "string", "artist": "string", "song": "string" }] }',
    dependsOn: [],
  },
  {
    id: 'apply-mood-logic',
    agent: '@mood-logic-guardian',
    objective: 'Produce final playlist output with history-aware and fallback-safe policy.',
    outputSchema: '{ "moodPhrase": "string", "adjacentMoods": ["string"], "songs": [...] }',
    dependsOn: ['interpret-mood', 'curate-songs'],
  },
] as const;

export const REQUIRED_MOOD_AGENT_NAMES = moodPipeline.map((stage) => stage.agent.replace(/^@/, ''));

export default defineSquad({
  version: '0.8.0',
  team,
  agents: [moodInterpreter, songCurator, moodLogicGuardian],
  routing,
  defaults,
});
