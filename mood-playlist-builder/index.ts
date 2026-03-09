import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { SquadClient } from '@bradygaster/squad-sdk/client';
import type { SquadSessionConfig } from '@bradygaster/squad-sdk/adapter';
import { moodPipeline } from './squad.config.js';
import {
  buildMoodPipelineExecutionBatches,
  buildMoodPlannerSystemPrompt,
  buildStagePrompt,
  mergeMoodPipelineOutputs,
} from './squad-orchestration.js';
import {
  appendMarkdownRow,
  buildArchiveMoodSuggestions,
  buildYouTubePlaylistUrl,
  findYouTubeLink,
  getPlaylistFilename,
  groupSavedPlaylistSessions,
  listSavedPlaylistFiles,
  MAX_PLAYLIST_SONGS,
  readMoodArchive,
  readSavedPlaylistEntries,
  resolveLaunchVideoIdsFromLinks,
  type SavedPlaylistEntry,
  resolvePlaylistFromModel,
  type SavedPlaylistFile,
  type SavedPlaylistMoodSession,
  type SongSuggestion,
} from './mood-logic.js';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

function showBanner(): void {
  console.log();
  console.log(`${C.magenta}${C.bold}  🎧 Mood Playlist Builder${C.reset}`);
  console.log(`${C.dim}  ─────────────────────────────────────────────${C.reset}`);
  console.log(`${C.dim}  Describe your mood, tune the songs, save your playlist, then launch YouTube.${C.reset}`);
  console.log();
}

function printArchiveHints(entries: ReturnType<typeof readMoodArchive>): void {
  if (entries.length === 0) {
    console.log(`${C.dim}  No archive yet. Your first mood check-in will create mood-archive.md.${C.reset}`);
    return;
  }

  const latest = entries.slice(-5).reverse();
  const popularPhrases = new Map<string, number>();
  for (const entry of entries) {
    popularPhrases.set(entry.moodPhrase, (popularPhrases.get(entry.moodPhrase) ?? 0) + 1);
  }

  const top = [...popularPhrases.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  console.log(`${C.cyan}  Recent moods from archive:${C.reset}`);
  for (const entry of latest) {
    console.log(`${C.dim}   • ${entry.dateTime} — "${entry.rawMood}" → ${entry.moodPhrase}${C.reset}`);
  }

  if (top.length > 0) {
    const phraseList = top.map(([phrase, count]) => `${phrase} (${count})`).join(', ');
    console.log(`${C.dim}  Popular mood phrases: ${phraseList}${C.reset}`);
  }
  console.log();
}

function extractContent(result: unknown): string | null {
  if (typeof result === 'string') return result;
  if (!result || typeof result !== 'object') return null;
  const obj = result as Record<string, unknown>;

  const data = obj.data as Record<string, unknown> | undefined;
  if (typeof data?.content === 'string') return data.content;
  if (typeof obj.content === 'string') return obj.content;
  if (typeof obj.message === 'string') return obj.message;
  return null;
}

function getStageProgressLabel(stageId: string): { activity: string; completion: string } {
  switch (stageId) {
    case 'interpret-mood':
      return {
        activity: 'Interpreting mood',
        completion: 'Mood interpretation complete',
      };
    case 'curate-songs':
      return {
        activity: 'Curating songs',
        completion: 'Song curation complete',
      };
    case 'apply-mood-logic':
      return {
        activity: 'Applying mood logic',
        completion: 'Mood logic checks complete',
      };
    default:
      return {
        activity: `Running ${stageId}`,
        completion: `${stageId} complete`,
      };
  }
}

function hasNoWarningsFlag(nodeOptions: string | undefined): boolean {
  return typeof nodeOptions === 'string' && /\b--no-warnings\b/.test(nodeOptions);
}

function configureSubprocessWarningSuppression(): () => void {
  const previousNodeNoWarnings = process.env.NODE_NO_WARNINGS;
  const previousNodeOptions = process.env.NODE_OPTIONS;

  process.env.NODE_NO_WARNINGS = '1';
  if (!hasNoWarningsFlag(previousNodeOptions)) {
    process.env.NODE_OPTIONS = previousNodeOptions ? `${previousNodeOptions} --no-warnings` : '--no-warnings';
  }

  return () => {
    if (previousNodeNoWarnings === undefined) {
      delete process.env.NODE_NO_WARNINGS;
    } else {
      process.env.NODE_NO_WARNINGS = previousNodeNoWarnings;
    }

    if (previousNodeOptions === undefined) {
      delete process.env.NODE_OPTIONS;
    } else {
      process.env.NODE_OPTIONS = previousNodeOptions;
    }
  };
}

export async function generateDynamicPlaylist(rawMood: string, archiveEntries: ReturnType<typeof readMoodArchive>): Promise<{
  moodPhrase: string;
  adjacentMoods: string[];
  songs: SongSuggestion[];
  usedFallback: boolean;
  warning?: string;
}> {
  const archiveInsights = buildArchiveMoodSuggestions(rawMood, archiveEntries);
  const contextPayload = {
    rawMood,
    archive: {
      recentMoodPhrases: archiveInsights.recentMoodPhrases,
      popularMoodPhrases: archiveInsights.popularMoodPhrases,
      adjacentMoodHints: archiveInsights.adjacentMoodHints,
      recentEntries: archiveEntries.slice(-5).map((entry) => ({
        dateTime: entry.dateTime,
        rawMood: entry.rawMood,
        moodPhrase: entry.moodPhrase,
      })),
    },
    constraints: {
      maxSongs: MAX_PLAYLIST_SONGS,
      noDuplicates: true,
      balanceKnownAndFresh: true,
    },
  };

  let client: SquadClient | null = null;
  const stageOutputs: Record<string, unknown> = {};

  const restoreSubprocessWarningEnv = configureSubprocessWarningSuppression();
  try {
    console.log();
    console.log(`${C.magenta}${C.bold}  Squad is building your playlist...${C.reset}`);
    console.log(`${C.dim}  Stages: interpret mood → curate songs → apply mood logic${C.reset}`);

    client = new SquadClient({
      cwd: process.cwd(),
      autoReconnect: true,
    });
    await client.connect();
    const connectedClient = client;

    const sessionConfig: SquadSessionConfig = {
      model: 'claude-sonnet-4.5',
      streaming: false,
      systemMessage: {
        mode: 'append',
        content: buildMoodPlannerSystemPrompt(),
      },
      onPermissionRequest: () => ({ kind: 'approved' as const }),
    };

    const executionBatches = buildMoodPipelineExecutionBatches(moodPipeline);
    let completedStages = 0;

    const runStage = async (stage: (typeof moodPipeline)[number]): Promise<unknown> => {
      const stagePrompt = buildStagePrompt(stage, contextPayload, stageOutputs);
      const stageSession = await connectedClient.createSession(sessionConfig);
      try {
        const result = stageSession.sendAndWait
          ? await stageSession.sendAndWait({ prompt: stagePrompt }, 600_000)
          : await connectedClient.sendMessage(stageSession, { prompt: stagePrompt });
        return extractContent(result) ?? result;
      } finally {
        try {
          await stageSession.close();
        } catch {}
      }
    };

    for (const batch of executionBatches) {
      for (const stage of batch) {
        const stageLabel = getStageProgressLabel(stage.id);
        const stageNumber = moodPipeline.findIndex((candidate) => candidate.id === stage.id) + 1;
        console.log(`${C.cyan}  ${stageNumber}/${moodPipeline.length} ${stageLabel.activity}...${C.reset}`);
      }

      const batchResults = await Promise.all(batch.map(async (stage) => ({ stage, output: await runStage(stage) })));
      for (const { stage, output } of batchResults) {
        stageOutputs[stage.id] = output;
        completedStages += 1;
        const stageLabel = getStageProgressLabel(stage.id);
        console.log(`${C.green}     ✓ ${stageLabel.completion}.${C.reset}`);
      }

      if (completedStages === moodPipeline.length) {
        console.log(`${C.green}  ✓ Squad pipeline complete.${C.reset}`);
      }
    }
  } catch (error: unknown) {
    const resolved = resolvePlaylistFromModel(rawMood, null, archiveEntries, MAX_PLAYLIST_SONGS);
    const reason = error instanceof Error ? error.message : String(error);
    console.log(`${C.yellow}  Dynamic pipeline unavailable. Falling back to deterministic mood logic...${C.reset}`);
    console.log(`${C.green}  ✓ Fallback playlist generated.${C.reset}`);
    return {
      ...resolved,
      warning: `Dynamic generation unavailable (${reason}). Using deterministic fallback.`,
    };
  } finally {
    try {
      await client?.disconnect();
    } catch {}
    restoreSubprocessWarningEnv();
  }

  const modelOutput = mergeMoodPipelineOutputs(stageOutputs);
  const resolved = resolvePlaylistFromModel(rawMood, modelOutput, archiveEntries, MAX_PLAYLIST_SONGS);
  if (resolved.usedFallback) {
    console.log(`${C.yellow}  Model output needed deterministic fallback adjustments.${C.reset}`);
  }
  return {
    ...resolved,
    warning: resolved.usedFallback ? (resolved.failureReason ?? 'Model output invalid. Using deterministic fallback.') : undefined,
  };
}

function printSongs(songs: SongSuggestion[]): void {
  console.log();
  console.log(`${C.cyan}${C.bold}  Suggested songs${C.reset}`);
  songs.forEach((song, index) => {
    console.log(`${C.dim}   ${String(index + 1).padStart(2, '0')}. [${song.genre}] ${song.artist} — ${song.song}${C.reset}`);
  });
  console.log();
}

function parseRemovalIndexes(input: string, max: number): number[] {
  const indexes = input
    .split(',')
    .map((n) => Number(n.trim()))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= max)
    .map((value) => value - 1);

  return [...new Set(indexes)].sort((a, b) => b - a);
}

async function customizeSongs(
  rl: ReturnType<typeof createInterface>,
  initialSongs: SongSuggestion[],
  moodPhrase: string,
): Promise<SongSuggestion[]> {
  const songs = [...initialSongs];

  while (true) {
    printSongs(songs);
    console.log(`${C.yellow}  Edit commands:${C.reset}`);
    console.log(`${C.dim}   done                      → accept list${C.reset}`);
    console.log(`${C.dim}   remove 2,5,8              → remove by number${C.reset}`);
    console.log(`${C.dim}   add Artist - Song          → add song (genre auto-set to mood phrase)${C.reset}`);
    console.log(`${C.dim}   reset                     → restore initial suggestions${C.reset}`);
    console.log();

    const answer = (await rl.question(`${C.cyan}  Command: ${C.reset}`)).trim();
    const lower = answer.toLowerCase();

    if (lower === 'done') {
      if (songs.length === 0) {
        console.log(`${C.red}  You need at least one song before continuing.${C.reset}`);
        continue;
      }
      return songs.slice(0, MAX_PLAYLIST_SONGS);
    }

    if (lower === 'reset') {
      songs.splice(0, songs.length, ...initialSongs.slice(0, MAX_PLAYLIST_SONGS));
      continue;
    }

    if (lower.startsWith('remove ')) {
      const indexes = parseRemovalIndexes(answer.slice('remove '.length), songs.length);
      if (indexes.length === 0) {
        console.log(`${C.red}  No valid song indexes were provided.${C.reset}`);
        continue;
      }
      for (const index of indexes) songs.splice(index, 1);
      continue;
    }

    if (lower.startsWith('add ')) {
      const payload = answer.slice('add '.length).trim();
      const [artist, song] = payload.split(/\s*-\s*/, 2);
      if (!artist || !song) {
        console.log(`${C.red}  Use this format: add Artist - Song${C.reset}`);
        continue;
      }
      if (songs.length >= MAX_PLAYLIST_SONGS) {
        console.log(`${C.red}  Max ${MAX_PLAYLIST_SONGS} songs allowed. Remove one first.${C.reset}`);
        continue;
      }
      songs.push({ genre: moodPhrase, artist: artist.trim(), song: song.trim() });
      continue;
    }

    console.log(`${C.red}  Unknown command. Try done, remove, add, or reset.${C.reset}`);
  }
}

function openInBrowser(url: string): void {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { stdio: 'ignore', detached: true });
    return;
  }
  if (process.platform === 'darwin') {
    spawn('open', [url], { stdio: 'ignore', detached: true });
    return;
  }
  spawn('xdg-open', [url], { stdio: 'ignore', detached: true });
}

function buildSkipDiagnostic(skipped: { link: string; reason: string }): string {
  if (skipped.reason !== 'unresolved-search-query') {
    return `Skipped launch link (${skipped.reason}): ${skipped.link}`;
  }

  try {
    const parsed = new URL(skipped.link);
    const rawQuery = parsed.searchParams.get('search_query');
    if (!rawQuery) return `Unable to resolve YouTube search query: ${skipped.link}`;
    const decodedQuery = decodeURIComponent(rawQuery.replace(/\+/g, '%20'));
    return `Unable to resolve YouTube search query: "${decodedQuery}" (${skipped.link})`;
  } catch {
    return `Unable to resolve YouTube search query: ${skipped.link}`;
  }
}

async function launchFromStoredLinks(links: string[]): Promise<void> {
  const launchable = await resolveLaunchVideoIdsFromLinks(links, MAX_PLAYLIST_SONGS);
  if (launchable.skipped.length > 0) {
    for (const skipped of launchable.skipped) {
      const diagnostic = buildSkipDiagnostic(skipped);
      const color = skipped.reason === 'unresolved-search-query' ? C.yellow : C.dim;
      console.log(`${color}  ${diagnostic}${C.reset}`);
    }
  }

  if (launchable.videoIds.length > 0) {
    const playlistUrl = buildYouTubePlaylistUrl(launchable.videoIds);
    openInBrowser(playlistUrl);
    console.log(`${C.green}  ✓ Opened YouTube playlist with ${launchable.videoIds.length} videos.${C.reset}`);
    return;
  }

  console.log(`${C.yellow}  No launchable YouTube video IDs found. Check saved links manually.${C.reset}`);
}

async function chooseLaunchMode(rl: ReturnType<typeof createInterface>): Promise<'new' | 'previous'> {
  console.log(`${C.yellow}  Choose an action:${C.reset}`);
  console.log(`${C.dim}   1) Create a new playlist${C.reset}`);
  console.log(`${C.dim}   2) Open a previous playlist${C.reset}`);
  console.log();

  while (true) {
    const answer = (await rl.question(`${C.cyan}  Selection [1-2]: ${C.reset}`)).trim();
    if (answer === '1') return 'new';
    if (answer === '2') return 'previous';
    console.log(`${C.red}  Invalid choice. Enter 1 or 2.${C.reset}`);
  }
}

async function chooseSavedPlaylist(
  rl: ReturnType<typeof createInterface>,
  files: SavedPlaylistFile[],
): Promise<SavedPlaylistFile | null> {
  if (files.length === 0) {
    console.log(`${C.yellow}  No saved playlists found in mood-playlists/.${C.reset}`);
    return null;
  }

  console.log();
  console.log(`${C.cyan}${C.bold}  Saved playlists${C.reset}`);
  files.forEach((file, index) => {
    console.log(`${C.dim}   ${index + 1}) ${file.filename}${C.reset}`);
  });
  console.log();

  while (true) {
    const answer = (await rl.question(`${C.cyan}  Choose playlist number [1-${files.length}]: ${C.reset}`)).trim();
    const selected = Number(answer);
    if (Number.isInteger(selected) && selected >= 1 && selected <= files.length) {
      return files[selected - 1];
    }
    console.log(`${C.red}  Invalid playlist number.${C.reset}`);
  }
}

async function chooseOpenSavedScope(
  rl: ReturnType<typeof createInterface>,
): Promise<'file' | 'session'> {
  console.log(`${C.yellow}  Open options:${C.reset}`);
  console.log(`${C.dim}   1) Open the whole playlist file${C.reset}`);
  console.log(`${C.dim}   2) Open one playlist session (contiguous rows with same mood)${C.reset}`);
  console.log();

  while (true) {
    const answer = (await rl.question(`${C.cyan}  Selection [1-2]: ${C.reset}`)).trim();
    if (answer === '1') return 'file';
    if (answer === '2') return 'session';
    console.log(`${C.red}  Invalid choice. Enter 1 or 2.${C.reset}`);
  }
}

async function choosePlaylistSession(
  rl: ReturnType<typeof createInterface>,
  sessions: SavedPlaylistMoodSession[],
): Promise<SavedPlaylistMoodSession> {
  console.log();
  console.log(`${C.cyan}${C.bold}  Playlist sessions${C.reset}`);
  sessions.forEach((session, index) => {
    console.log(`${C.dim}   ${index + 1}) ${session.label}${C.reset}`);
  });
  console.log();

  while (true) {
    const answer = (await rl.question(`${C.cyan}  Choose session number [1-${sessions.length}]: ${C.reset}`)).trim();
    const selected = Number(answer);
    if (Number.isInteger(selected) && selected >= 1 && selected <= sessions.length) {
      return sessions[selected - 1] as SavedPlaylistMoodSession;
    }
    console.log(`${C.red}  Invalid session number.${C.reset}`);
  }
}

async function main(): Promise<void> {
  const root = resolve(process.cwd());
  const archivePath = join(root, 'mood-archive.md');
  const playlistDir = join(root, 'mood-playlists');
  const playlistPath = join(root, 'mood-playlists', getPlaylistFilename(new Date()));
  const archiveEntries = readMoodArchive(archivePath);

  showBanner();
  printArchiveHints(archiveEntries);

  const rl = createInterface({ input: stdin, output: stdout });

  try {
    const mode = await chooseLaunchMode(rl);
    if (mode === 'previous') {
      const savedFiles = listSavedPlaylistFiles(playlistDir);
      const selected = await chooseSavedPlaylist(rl, savedFiles);
      if (!selected) return;

      const storedEntries = readSavedPlaylistEntries(selected.fullPath);
      if (storedEntries.length === 0) {
        console.log(`${C.yellow}  No playlist rows found in ${selected.filename}.${C.reset}`);
        return;
      }

      const openScope = await chooseOpenSavedScope(rl);
      let scopedEntries: SavedPlaylistEntry[] = storedEntries;
      let openingLabel = selected.filename;
      if (openScope === 'session') {
        const sessions = groupSavedPlaylistSessions(storedEntries);
        if (sessions.length === 0) {
          console.log(`${C.yellow}  No playlist sessions found in ${selected.filename}.${C.reset}`);
          return;
        }
        const chosenSession = await choosePlaylistSession(rl, sessions);
        scopedEntries = chosenSession.entries;
        openingLabel = `${selected.filename} (${chosenSession.label})`;
      }

      const linkEntries = scopedEntries.filter((entry) => entry.youtubeLink);
      const links = linkEntries.map((entry) => entry.youtubeLink as string);

      const unresolvedEntries = scopedEntries.filter((entry) => entry.diagnostics);
      for (const entry of unresolvedEntries) {
        console.log(`${C.yellow}  Row ${entry.rowNumber}: ${entry.diagnostics}${C.reset}`);
      }

      const noLinkCount = scopedEntries.filter((entry) => !entry.youtubeLink && !entry.diagnostics).length;
      if (noLinkCount > 0) {
        console.log(`${C.dim}  Ignored ${noLinkCount} rows with no stored YouTube link.${C.reset}`);
      }

      console.log();
      console.log(`${C.magenta}  Opening ${openingLabel} with up to ${MAX_PLAYLIST_SONGS} songs...${C.reset}`);
      await launchFromStoredLinks(links);
      return;
    }

    const rawMood = (await rl.question(`${C.cyan}  How are you feeling right now? ${C.reset}`)).trim();
    if (!rawMood) {
      console.log(`${C.red}  Mood input cannot be empty.${C.reset}`);
      return;
    }

    const dynamicPlan = await generateDynamicPlaylist(rawMood, archiveEntries);
    const moodPhrase = dynamicPlan.moodPhrase;
    console.log(`${C.green}  Mood phrase: ${C.bold}${moodPhrase}${C.reset}`);
    if (dynamicPlan.adjacentMoods.length > 0) {
      console.log(`${C.dim}  Adjacent alternatives: ${dynamicPlan.adjacentMoods.join(', ')}${C.reset}`);
    }
    if (dynamicPlan.warning) {
      console.log(`${C.yellow}  ${dynamicPlan.warning}${C.reset}`);
    }

    const initialSongs = dynamicPlan.songs.slice(0, MAX_PLAYLIST_SONGS);
    const selectedSongs = await customizeSongs(rl, initialSongs, moodPhrase);

    console.log();
    console.log(`${C.magenta}  Looking up YouTube matches...${C.reset}`);

    const playlistRows: Array<[string, string, string, string, string]> = [];
    const youtubeLinks: string[] = [];

    for (const [index, song] of selectedSongs.entries()) {
      const youtubeLink = await findYouTubeLink(song, moodPhrase);
      youtubeLinks.push(youtubeLink);

      console.log(`${C.dim}   ${index + 1}/${selectedSongs.length} ${song.artist} — ${song.song}${C.reset}`);

      playlistRows.push([
        moodPhrase,
        song.genre,
        song.artist.replace(/\|/g, '\\|'),
        song.song.replace(/\|/g, '\\|'),
        youtubeLink ? `[Watch](${youtubeLink})` : 'N/A',
      ]);
    }

    for (const row of playlistRows) {
      appendMarkdownRow(
        playlistPath,
        ['Mood', 'Genre', 'Artist', 'Song', 'YouTube Link'],
        row,
      );
    }

    appendMarkdownRow(
      archivePath,
      ['DateTime', 'Raw Mood', 'Mood Phrase'],
      [new Date().toISOString(), rawMood.replace(/\|/g, '\\|'), moodPhrase.replace(/\|/g, '\\|')],
    );

    console.log();
    console.log(`${C.green}  ✓ Saved playlist table: ${playlistPath}${C.reset}`);
    console.log(`${C.green}  ✓ Appended mood archive: ${archivePath}${C.reset}`);
    await launchFromStoredLinks(youtubeLinks);
  } finally {
    rl.close();
  }
}

const entrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (entrypoint && import.meta.url === entrypoint) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${C.red}  Fatal error: ${message}${C.reset}`);
    process.exit(1);
  });
}
