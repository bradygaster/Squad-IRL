/**
 * rock-paper-scissors — Agent Arena
 *
 * Multiple LLM agents with different strategies compete in 1-on-1 RPS matches.
 * Scorekeeper agent provides live commentary. All backed by real Copilot sessions.
 *
 * GITHUB_TOKEN required.
 */

import { CastingEngine, StreamingPipeline } from '@bradygaster/squad-sdk';
import { SquadClientWithPool } from '@bradygaster/squad-sdk/client';
import { PLAYERS, SCOREKEEPER_PROMPT, type PlayerStrategy } from './prompts.js';

// ── Game State ───────────────────────────────────────────────────────

interface PlayerInfo extends PlayerStrategy {
  sessionId: string;
  wins: number;
  losses: number;
  draws: number;
  moveHistory: Array<'rock' | 'paper' | 'scissors'>;
}

interface MatchHistory {
  [key: string]: Array<'rock' | 'paper' | 'scissors'>;
}

type Move = 'rock' | 'paper' | 'scissors';

interface MoveResult {
  move: Move | null;
  reasoning?: string;
}

// ── Main Loop ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!process.env.GITHUB_TOKEN) {
    console.error('\n❌ Missing GITHUB_TOKEN environment variable.\n');
    console.error('Setup instructions:');
    console.error('  1. Generate a token at https://github.com/settings/tokens');
    console.error('  2. Set GITHUB_TOKEN in your environment:');
    console.error('     export GITHUB_TOKEN=ghp_...\n');
    process.exit(1);
  }

  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🎮 Rock Paper Scissors — Agent Arena   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // Connect to Copilot
  const client = new SquadClientWithPool({ githubToken: process.env.GITHUB_TOKEN });
  
  try {
    await client.connect();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Connection failed: ${msg}\n`);
    console.error('Verify your GITHUB_TOKEN is valid and has Copilot access.\n');
    process.exit(1);
  }

  // Cast agents for each player
  const casting = new CastingEngine();
  const cast = casting.castTeam({
    universe: 'usual-suspects',
    requiredRoles: ['developer', 'tester', 'designer', 'qa', 'security', 'ops', 'data'],
    teamSize: PLAYERS.length + 1, // players + scorekeeper
  });

  // Create sessions for all players
  const players: PlayerInfo[] = [];
  const pipeline = new StreamingPipeline();

  for (let i = 0; i < PLAYERS.length; i++) {
    const strategy = PLAYERS[i];
    const agent = cast[i];
    
    const session = await client.createSession({
      streaming: true,
      systemMessage: { mode: 'append', content: strategy.systemPrompt },
    });

    players.push({
      ...strategy,
      sessionId: session.sessionId,
      wins: 0,
      losses: 0,
      draws: 0,
      moveHistory: [],
    });
  }

  // Create scorekeeper session
  const scorekeeperAgent = cast[PLAYERS.length];
  const scorekeeperSession = await client.createSession({
    streaming: true,
    systemMessage: { mode: 'append', content: SCOREKEEPER_PROMPT },
  });
  const scorekeeper = {
    name: scorekeeperAgent.name,
    sessionId: scorekeeperSession.sessionId,
  };

  pipeline.onDelta((event) => {
    process.stdout.write(event.content);
  });

  // Print player roster
  console.log('Players:');
  for (const player of players) {
    console.log(`  ${player.emoji} ${player.name.padEnd(12)} — ${player.strategy}`);
  }
  console.log(`  📊 ${scorekeeper.name.padEnd(12)} — Tracks everything\n`);

  // Track match pairings
  const matchHistory: MatchHistory = {};
  const allPairings: Array<[number, number]> = [];
  
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      allPairings.push([i, j]);
    }
  }

  let matchCount = 0;
  let pairingIndex = 0;

  // Infinite match loop
  while (true) {
    // Pick next pairing
    if (pairingIndex >= allPairings.length) {
      pairingIndex = 0;
    }
    
    const [aIdx, bIdx] = allPairings[pairingIndex];
    pairingIndex++;
    matchCount++;

    await playMatch(
      client,
      pipeline,
      players[aIdx],
      players[bIdx],
      scorekeeper,
      matchHistory,
      matchCount,
    );

    // Leaderboard every 10 matches
    if (matchCount % 10 === 0) {
      await printLeaderboard(client, pipeline, scorekeeper, players);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }
}

// ── Play Single Match ────────────────────────────────────────────────

async function playMatch(
  client: SquadClientWithPool,
  pipeline: StreamingPipeline,
  playerA: PlayerInfo,
  playerB: PlayerInfo,
  scorekeeper: { name: string; sessionId: string },
  matchHistory: MatchHistory,
  matchNumber: number,
): Promise<void> {
  console.log(`Match #${matchNumber}: ⚔️  ${playerA.name} vs. ${playerB.name}`);

  // Get moves from both players simultaneously
  const [resultA, resultB] = await Promise.all([
    getPlayerMove(client, playerA, playerB, matchHistory),
    getPlayerMove(client, playerB, playerA, matchHistory),
  ]);

  const moveA = resultA.move;
  const moveB = resultB.move;

  // Display moves (with reasoning for Sherlock/Poker)
  if (moveA) {
    if (resultA.reasoning && (playerA.id === 'the-learner' || playerA.id === 'bluffer')) {
      console.log(`  ${playerA.emoji} ${playerA.name} reasons: "${resultA.reasoning}"`);
    }
    console.log(`  ${playerA.emoji} ${playerA.name} throws: ${moveA}`);
    playerA.moveHistory.push(moveA);
  } else {
    console.log(`  ${playerA.emoji} ${playerA.name} forfeits (invalid response)`);
  }

  if (moveB) {
    if (resultB.reasoning && (playerB.id === 'the-learner' || playerB.id === 'bluffer')) {
      console.log(`  ${playerB.emoji} ${playerB.name} reasons: "${resultB.reasoning}"`);
    }
    console.log(`  ${playerB.emoji} ${playerB.name} throws: ${moveB}`);
    playerB.moveHistory.push(moveB);
  } else {
    console.log(`  ${playerB.emoji} ${playerB.name} forfeits (invalid response)`);
  }

  // Determine winner
  const winner = determineWinner(moveA, moveB);
  
  if (winner === 'a') {
    playerA.wins++;
    playerB.losses++;
  } else if (winner === 'b') {
    playerB.wins++;
    playerA.losses++;
  } else if (winner === 'draw') {
    playerA.draws++;
    playerB.draws++;
  }

  // Update match history (key X-Y = moves X made against Y)
  const pairKeyAB = `${playerA.id}-${playerB.id}`;
  const pairKeyBA = `${playerB.id}-${playerA.id}`;
  if (!matchHistory[pairKeyAB]) matchHistory[pairKeyAB] = [];
  if (!matchHistory[pairKeyBA]) matchHistory[pairKeyBA] = [];
  if (moveA) matchHistory[pairKeyAB].push(moveA); // A's move stored under A-B
  if (moveB) matchHistory[pairKeyBA].push(moveB); // B's move stored under B-A

  // Get scorekeeper commentary
  await announceResult(
    client,
    pipeline,
    scorekeeper,
    playerA,
    moveA,
    playerB,
    moveB,
  );

  console.log();
}

// ── Get Player Move ──────────────────────────────────────────────────

async function getPlayerMove(
  client: SquadClientWithPool,
  player: PlayerInfo,
  opponent: PlayerInfo,
  matchHistory: MatchHistory,
): Promise<MoveResult> {
  const pairKey = `${opponent.id}-${player.id}`;
  const opponentHistory = matchHistory[pairKey] || [];

  let prompt: string;

  if (player.id === 'the-learner' && opponentHistory.length > 0) {
    // Sherlock gets full opponent history for pattern analysis
    const lastN = opponentHistory.slice(-10);
    prompt = `Your opponent is ${opponent.name} (${opponent.strategy}). Their last ${lastN.length} moves: ${lastN.join(', ')}. What do you throw?`;
  } else if ((player.id === 'copycat' || player.id === 'contrarian') && opponentHistory.length > 0) {
    // Echo and Rebel need opponent's last move
    const lastMove = opponentHistory[opponentHistory.length - 1];
    prompt = `Your opponent's last move was: ${lastMove}. What do you throw?`;
  } else if (player.id === 'cycler') {
    // Metronome needs to know the round number
    const roundNum = player.moveHistory.length + 1;
    prompt = `This is round ${roundNum}. What do you throw?`;
  } else {
    prompt = 'What do you throw?';
  }

  const session = await client.resumeSession(player.sessionId);
  let response = '';

  const handler = (event: { type: string; [key: string]: unknown }) => {
    if (event.type === 'message_delta') {
      const content =
        (event['deltaContent'] as string) ??
        (event['delta'] as string) ??
        (event['content'] as string) ??
        '';
      if (content) {
        response += content;
      }
    }
  };

  session.on('message_delta', handler);

  try {
    if (session.sendAndWait) {
      await session.sendAndWait({ prompt }, 30_000);
    } else {
      await session.sendMessage({ prompt });
    }
  } finally {
    session.off('message_delta', handler);
  }

  const move = parseMove(response);

  // Extract reasoning (everything before the final move word) for multi-line responders
  let reasoning: string | undefined;
  if (response.trim().includes('\n')) {
    const lines = response.trim().split('\n').filter((l) => l.trim());
    if (lines.length > 1) {
      reasoning = lines.slice(0, -1).join(' ').trim();
    }
  }

  return { move, reasoning };
}

// ── Parse Move from LLM Response ─────────────────────────────────────

function parseMove(response: string): Move | null {
  const lower = response.toLowerCase();

  // Find the LAST occurrence by position in the text
  const rockIdx = lower.lastIndexOf('rock');
  const paperIdx = lower.lastIndexOf('paper');
  const scissorsIdx = lower.lastIndexOf('scissors');

  const candidates: Array<{ move: Move; idx: number }> = [];
  if (rockIdx >= 0) candidates.push({ move: 'rock', idx: rockIdx });
  if (paperIdx >= 0) candidates.push({ move: 'paper', idx: paperIdx });
  if (scissorsIdx >= 0) candidates.push({ move: 'scissors', idx: scissorsIdx });

  if (candidates.length === 0) {
    console.warn(`  ⚠️  Could not parse move from response: "${response.slice(0, 50)}..."`);
    return null;
  }

  // Return the move that appears last in the text (the actual answer, not reasoning)
  candidates.sort((a, b) => b.idx - a.idx);
  return candidates[0].move;
}

// ── Determine Winner ─────────────────────────────────────────────────

function determineWinner(
  moveA: Move | null,
  moveB: Move | null,
): 'a' | 'b' | 'draw' | 'forfeit' {
  if (!moveA || !moveB) return 'forfeit';
  if (moveA === moveB) return 'draw';
  
  if (
    (moveA === 'rock' && moveB === 'scissors') ||
    (moveA === 'paper' && moveB === 'rock') ||
    (moveA === 'scissors' && moveB === 'paper')
  ) {
    return 'a';
  }
  
  return 'b';
}

// ── Announce Result via Scorekeeper ──────────────────────────────────

async function announceResult(
  client: SquadClientWithPool,
  pipeline: StreamingPipeline,
  scorekeeper: { name: string; sessionId: string },
  playerA: PlayerInfo,
  moveA: Move | null,
  playerB: PlayerInfo,
  moveB: Move | null,
): Promise<void> {
  const prompt = `${playerA.name} threw ${moveA || 'nothing (forfeit)'}, ${playerB.name} threw ${moveB || 'nothing (forfeit)'}. Who wins? Give me one sentence of commentary.`;

  const session = await client.resumeSession(scorekeeper.sessionId);

  pipeline.markMessageStart(scorekeeper.sessionId);

  const handler = (event: { type: string; [key: string]: unknown }) => {
    if (event.type === 'message_delta') {
      const content =
        (event['deltaContent'] as string) ??
        (event['delta'] as string) ??
        (event['content'] as string) ??
        '';
      if (content) {
        void pipeline.processEvent({
          type: 'message_delta',
          sessionId: scorekeeper.sessionId,
          agentName: scorekeeper.name,
          content,
          index: typeof event['index'] === 'number' ? event['index'] : 0,
          timestamp: new Date(),
        });
      }
    }
  };

  session.on('message_delta', handler);

  process.stdout.write(`  📊 ${scorekeeper.name}: `);

  try {
    if (session.sendAndWait) {
      await session.sendAndWait({ prompt }, 30_000);
    } else {
      await session.sendMessage({ prompt });
    }
  } finally {
    session.off('message_delta', handler);
  }

  console.log();
}

// ── Print Leaderboard ────────────────────────────────────────────────

async function printLeaderboard(
  client: SquadClientWithPool,
  pipeline: StreamingPipeline,
  scorekeeper: { name: string; sessionId: string },
  players: PlayerInfo[],
): Promise<void> {
  // Sort by wins (descending), then by win rate
  const sorted = [...players].sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    const totalA = a.wins + a.losses + a.draws;
    const totalB = b.wins + b.losses + b.draws;
    const rateA = totalA > 0 ? a.wins / totalA : 0;
    const rateB = totalB > 0 ? b.wins / totalB : 0;
    return rateB - rateA;
  });

  console.log('\n═══ LEADERBOARD ═══');
  
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    console.log(`  ${i + 1}. ${p.emoji} ${p.name.padEnd(15)} — ${p.wins}W ${p.losses}L ${p.draws}D`);
  }

  console.log();

  // Ask scorekeeper for commentary
  const statsText = sorted
    .slice(0, 3)
    .map((p) => `${p.name} (${p.wins}W ${p.losses}L ${p.draws}D)`)
    .join(', ');
  
  const prompt = `Current top 3: ${statsText}. Give me one sentence of leaderboard commentary.`;

  const session = await client.resumeSession(scorekeeper.sessionId);

  pipeline.markMessageStart(scorekeeper.sessionId);

  const handler = (event: { type: string; [key: string]: unknown }) => {
    if (event.type === 'message_delta') {
      const content =
        (event['deltaContent'] as string) ??
        (event['delta'] as string) ??
        (event['content'] as string) ??
        '';
      if (content) {
        void pipeline.processEvent({
          type: 'message_delta',
          sessionId: scorekeeper.sessionId,
          agentName: scorekeeper.name,
          content,
          index: typeof event['index'] === 'number' ? event['index'] : 0,
          timestamp: new Date(),
        });
      }
    }
  };

  session.on('message_delta', handler);

  process.stdout.write(`  📊 ${scorekeeper.name}: `);

  try {
    if (session.sendAndWait) {
      await session.sendAndWait({ prompt }, 30_000);
    } else {
      await session.sendMessage({ prompt });
    }
  } finally {
    session.off('message_delta', handler);
  }

  console.log('\n');
}

// ── Start ────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
