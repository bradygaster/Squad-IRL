import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export type SongSuggestion = {
  genre: string;
  artist: string;
  song: string;
};

export type MoodArchiveEntry = {
  dateTime: string;
  rawMood: string;
  moodPhrase: string;
};

export type ModelPlaylistProposal = {
  moodPhrase?: unknown;
  adjacentMoods?: unknown;
  songs?: unknown;
};

export type ResolvedPlaylist = {
  moodPhrase: string;
  adjacentMoods: string[];
  songs: SongSuggestion[];
  usedFallback: boolean;
  failureReason?: string;
};

export type LaunchSkipReason =
  | 'invalid-link'
  | 'non-youtube-link'
  | 'missing-video-id'
  | 'unresolved-search-query'
  | 'duplicate-video-id'
  | 'max-videos-reached';

export type LaunchSkippedEntry = {
  link: string;
  reason: LaunchSkipReason;
};

export type LaunchVideoResolution = {
  videoIds: string[];
  skipped: LaunchSkippedEntry[];
};

export type SavedPlaylistFile = {
  filename: string;
  fullPath: string;
  dateLabel: string;
};

export type SavedPlaylistEntry = {
  mood: string;
  genre: string;
  artist: string;
  song: string;
  youtubeLink: string | null;
  rowNumber: number;
  diagnostics?: string;
};

export type SavedPlaylistMoodSession = {
  mood: string;
  label: string;
  startRow: number;
  endRow: number;
  entries: SavedPlaylistEntry[];
  linkCount: number;
};

export const MAX_PLAYLIST_SONGS = 8;

const MOOD_KEYWORDS: Array<{ phrase: string; keywords: string[] }> = [
  { phrase: 'High Energy', keywords: ['hyped', 'pump', 'energized', 'workout', 'unstoppable', 'excited', 'fired up'] },
  { phrase: 'Calm Focus', keywords: ['focus', 'study', 'concentrate', 'productive', 'clear', 'steady', 'flow'] },
  { phrase: 'Rainy Reflection', keywords: ['melancholy', 'sad', 'down', 'lonely', 'heartbroken', 'reflective', 'blue'] },
  { phrase: 'Happy Vibes', keywords: ['happy', 'joy', 'great', 'celebrate', 'upbeat', 'good mood', 'smiling'] },
  { phrase: 'Late Night Chill', keywords: ['chill', 'night', 'relax', 'wind down', 'quiet', 'easygoing', 'laid back'] },
  { phrase: 'Bold Confidence', keywords: ['confident', 'powerful', 'brave', 'ready', 'determined', 'fearless'] },
];

const MOOD_LIBRARY: Record<string, SongSuggestion[]> = {
  'High Energy': [
    { genre: 'Pop', artist: 'Dua Lipa', song: 'Levitating' },
    { genre: 'Hip-Hop', artist: 'Eminem', song: 'Lose Yourself' },
    { genre: 'Rock', artist: 'Foo Fighters', song: 'The Pretender' },
    { genre: 'Electronic', artist: 'The Chemical Brothers', song: 'Go' },
    { genre: 'Pop', artist: 'Katy Perry', song: 'Roar' },
    { genre: 'Alternative', artist: 'Imagine Dragons', song: 'Believer' },
    { genre: 'Dance', artist: 'Calvin Harris', song: 'Summer' },
    { genre: 'Hip-Hop', artist: 'Kanye West', song: 'Stronger' },
    { genre: 'Rock', artist: 'The Killers', song: 'Mr. Brightside' },
    { genre: 'Pop', artist: 'Lady Gaga', song: 'Edge of Glory' },
    { genre: 'Electronic', artist: 'Daft Punk', song: 'One More Time' },
    { genre: 'R&B', artist: 'Beyoncé', song: 'Run the World (Girls)' },
    { genre: 'Pop', artist: 'The Weeknd', song: 'Blinding Lights' },
    { genre: 'Rock', artist: 'Queen', song: "Don't Stop Me Now" },
    { genre: 'Hip-Hop', artist: 'Macklemore & Ryan Lewis', song: "Can't Hold Us" },
  ],
  'Calm Focus': [
    { genre: 'Lo-fi', artist: 'Jinsang', song: 'Affection' },
    { genre: 'Neo-Classical', artist: 'Ludovico Einaudi', song: 'Nuvole Bianche' },
    { genre: 'Ambient', artist: 'Tycho', song: 'Awake' },
    { genre: 'Electronic', artist: 'ODESZA', song: 'A Moment Apart' },
    { genre: 'Jazz', artist: 'Miles Davis', song: 'Blue in Green' },
    { genre: 'Lo-fi', artist: 'Nujabes', song: 'Feather' },
    { genre: 'Classical', artist: 'Max Richter', song: 'On The Nature of Daylight' },
    { genre: 'Ambient', artist: 'Brian Eno', song: 'An Ending (Ascent)' },
    { genre: 'Indie', artist: 'Bon Iver', song: 'Holocene' },
    { genre: 'Instrumental', artist: 'Explosions in the Sky', song: 'Your Hand in Mine' },
    { genre: 'Jazz', artist: 'Bill Evans', song: 'Peace Piece' },
    { genre: 'Electronic', artist: 'Four Tet', song: 'Two Thousand and Seventeen' },
    { genre: 'Lo-fi', artist: 'idealism', song: 'both of us' },
    { genre: 'Ambient', artist: 'Ólafur Arnalds', song: 'Saman' },
    { genre: 'Indie', artist: 'Khruangbin', song: 'Friday Morning' },
  ],
  'Rainy Reflection': [
    { genre: 'Indie', artist: 'Phoebe Bridgers', song: 'Motion Sickness' },
    { genre: 'Alternative', artist: 'Radiohead', song: 'No Surprises' },
    { genre: 'Soul', artist: 'Amy Winehouse', song: 'Back to Black' },
    { genre: 'Folk', artist: 'Damien Rice', song: '9 Crimes' },
    { genre: 'Pop', artist: 'Adele', song: 'Someone Like You' },
    { genre: 'Alternative', artist: 'The National', song: 'About Today' },
    { genre: 'Indie', artist: 'Daughter', song: 'Youth' },
    { genre: 'R&B', artist: 'Frank Ocean', song: 'Ivy' },
    { genre: 'Soul', artist: 'Sam Smith', song: 'Stay With Me' },
    { genre: 'Pop', artist: 'Billie Eilish', song: 'when the party\'s over' },
    { genre: 'Alternative', artist: 'Coldplay', song: 'Fix You' },
    { genre: 'Folk', artist: 'Bon Iver', song: 'Skinny Love' },
    { genre: 'Rock', artist: 'The Beatles', song: 'Yesterday' },
    { genre: 'R&B', artist: 'SZA', song: 'Nobody Gets Me' },
    { genre: 'Alternative', artist: 'Keane', song: 'Somewhere Only We Know' },
  ],
  'Happy Vibes': [
    { genre: 'Pop', artist: 'Pharrell Williams', song: 'Happy' },
    { genre: 'Pop', artist: 'Justin Timberlake', song: "Can't Stop the Feeling!" },
    { genre: 'Soul', artist: 'Stevie Wonder', song: 'Signed, Sealed, Delivered (I\'m Yours)' },
    { genre: 'Pop', artist: 'Walk the Moon', song: 'Shut Up and Dance' },
    { genre: 'Funk', artist: 'Mark Ronson ft. Bruno Mars', song: 'Uptown Funk' },
    { genre: 'Reggae', artist: 'Bob Marley & The Wailers', song: 'Three Little Birds' },
    { genre: 'Pop', artist: 'Katrina and the Waves', song: 'Walking on Sunshine' },
    { genre: 'Rock', artist: 'Earth, Wind & Fire', song: 'September' },
    { genre: 'Indie', artist: 'Vampire Weekend', song: 'A-Punk' },
    { genre: 'Soul', artist: 'Aretha Franklin', song: 'Respect' },
    { genre: 'Pop', artist: 'OneRepublic', song: 'Good Life' },
    { genre: 'Alternative', artist: 'American Authors', song: 'Best Day of My Life' },
    { genre: 'Pop', artist: 'Harry Styles', song: 'Adore You' },
    { genre: 'R&B', artist: 'Lizzo', song: 'Good as Hell' },
    { genre: 'Disco', artist: 'Bee Gees', song: 'Stayin\' Alive' },
  ],
  'Late Night Chill': [
    { genre: 'R&B', artist: 'Sade', song: 'No Ordinary Love' },
    { genre: 'Alternative', artist: 'Cigarettes After Sex', song: 'Apocalypse' },
    { genre: 'Indie', artist: 'The xx', song: 'Intro' },
    { genre: 'Dream Pop', artist: 'Beach House', song: 'Space Song' },
    { genre: 'R&B', artist: 'The Weeknd', song: 'Call Out My Name' },
    { genre: 'Electronic', artist: 'James Blake', song: 'Retrograde' },
    { genre: 'Ambient', artist: 'Moby', song: 'Porcelain' },
    { genre: 'Soul', artist: 'Alina Baraz', song: 'Electric (feat. Khalid)' },
    { genre: 'Lo-fi', artist: 'Joji', song: 'SLOW DANCING IN THE DARK' },
    { genre: 'Alternative', artist: 'Lana Del Rey', song: 'Video Games' },
    { genre: 'R&B', artist: 'Daniel Caesar', song: 'Get You' },
    { genre: 'Electronic', artist: 'RÜFÜS DU SOL', song: 'Innerbloom' },
    { genre: 'Indie', artist: 'Men I Trust', song: 'Show Me How' },
    { genre: 'Pop', artist: 'The 1975', song: 'Somebody Else' },
    { genre: 'R&B', artist: 'Khalid', song: 'Better' },
  ],
  'Bold Confidence': [
    { genre: 'Rock', artist: 'Survivor', song: 'Eye of the Tiger' },
    { genre: 'Pop', artist: 'Katy Perry', song: 'Firework' },
    { genre: 'Hip-Hop', artist: 'Drake', song: 'Started From the Bottom' },
    { genre: 'R&B', artist: 'Beyoncé', song: 'Formation' },
    { genre: 'Rock', artist: 'AC/DC', song: 'Thunderstruck' },
    { genre: 'Pop', artist: 'Alicia Keys', song: 'Girl on Fire' },
    { genre: 'Hip-Hop', artist: 'Kendrick Lamar', song: 'HUMBLE.' },
    { genre: 'Rock', artist: 'Bon Jovi', song: "It's My Life" },
    { genre: 'Pop', artist: 'Sia', song: 'Unstoppable' },
    { genre: 'Hip-Hop', artist: 'Meek Mill', song: 'Dreams and Nightmares' },
    { genre: 'Rock', artist: 'Evanescence', song: 'Bring Me to Life' },
    { genre: 'Pop', artist: 'P!nk', song: 'Raise Your Glass' },
    { genre: 'Hip-Hop', artist: 'JAY-Z', song: 'Public Service Announcement' },
    { genre: 'Electronic', artist: 'Martin Garrix', song: 'Animals' },
    { genre: 'Rock', artist: 'The Score', song: 'Unstoppable' },
  ],
};

const ADJACENT_MOOD_MAP: Record<string, string[]> = {
  'High Energy': ['Bold Confidence', 'Happy Vibes', 'Calm Focus'],
  'Calm Focus': ['Late Night Chill', 'Rainy Reflection', 'High Energy'],
  'Rainy Reflection': ['Late Night Chill', 'Calm Focus', 'Happy Vibes'],
  'Happy Vibes': ['High Energy', 'Bold Confidence', 'Late Night Chill'],
  'Late Night Chill': ['Calm Focus', 'Rainy Reflection', 'Happy Vibes'],
  'Bold Confidence': ['High Energy', 'Happy Vibes', 'Calm Focus'],
};

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

export function summarizeMood(rawMood: string): string {
  const normalized = normalize(rawMood);
  if (!normalized) return 'Open Mood';

  for (const rule of MOOD_KEYWORDS) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.phrase;
    }
  }

  const compact = normalized.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!compact) return 'Open Mood';

  const words = compact.split(' ').slice(0, 3);
  return words.map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
}

export function suggestSongs(moodPhrase: string, limit = MAX_PLAYLIST_SONGS): SongSuggestion[] {
  const foundLibrary = MOOD_LIBRARY[moodPhrase] ?? MOOD_LIBRARY['Calm Focus'];
  return foundLibrary.slice(0, Math.max(1, Math.min(limit, MAX_PLAYLIST_SONGS)));
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function buildArchiveMoodSuggestions(rawMood: string, archive: MoodArchiveEntry[]): {
  recentMoodPhrases: string[];
  popularMoodPhrases: Array<{ phrase: string; count: number }>;
  adjacentMoodHints: string[];
} {
  const recentMoodPhrases = [...new Set(archive.slice(-8).reverse().map((entry) => entry.moodPhrase))].slice(0, 5);
  const phraseCounts = new Map<string, number>();
  for (const entry of archive) {
    phraseCounts.set(entry.moodPhrase, (phraseCounts.get(entry.moodPhrase) ?? 0) + 1);
  }

  const popularMoodPhrases = [...phraseCounts.entries()]
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([phrase, count]) => ({ phrase, count }));

  const rawTokens = new Set(tokenize(rawMood));
  const adjacentMoodHints = [...new Set(
    archive
      .slice()
      .reverse()
      .filter((entry) => {
        const entryTokens = [...tokenize(entry.rawMood), ...tokenize(entry.moodPhrase)];
        return entryTokens.some((token) => rawTokens.has(token));
      })
      .map((entry) => entry.moodPhrase),
  )]
    .slice(0, 5);

  return { recentMoodPhrases, popularMoodPhrases, adjacentMoodHints };
}

export function getDeterministicAdjacentMoods(
  moodPhrase: string,
  archive: MoodArchiveEntry[],
  rawMood: string,
): string[] {
  const archiveSuggestions = buildArchiveMoodSuggestions(rawMood, archive);
  const mapFallback = ADJACENT_MOOD_MAP[moodPhrase] ?? ['Calm Focus', 'Happy Vibes', 'Late Night Chill'];
  return [...new Set([
    ...archiveSuggestions.adjacentMoodHints,
    ...archiveSuggestions.recentMoodPhrases,
    ...archiveSuggestions.popularMoodPhrases.map((item) => item.phrase),
    ...mapFallback,
  ])]
    .filter((phrase) => phrase !== moodPhrase)
    .slice(0, 4);
}

export function normalizeMoodPhraseFromModel(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const compact = value.replace(/\s+/g, ' ').trim();
  if (!compact) return null;
  const words = compact.split(' ').slice(0, 3);
  return words.map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

export function normalizeSongsFromModel(value: unknown, moodPhrase: string): SongSuggestion[] {
  if (!Array.isArray(value)) return [];

  const normalized: SongSuggestion[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const candidate = item as Record<string, unknown>;

    const artist = typeof candidate.artist === 'string' ? candidate.artist.trim() : '';
    const song = typeof candidate.song === 'string' ? candidate.song.trim() : '';
    if (!artist || !song) continue;

    const genre = typeof candidate.genre === 'string' ? candidate.genre.trim() : '';
    if (!genre) continue;

    normalized.push({ genre, artist, song });
    if (normalized.length >= MAX_PLAYLIST_SONGS) break;
  }

  return normalized;
}

export function normalizeAdjacentMoodsFromModel(value: unknown, moodPhrase: string): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter((item) => item.length > 0 && item !== moodPhrase)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 4);
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJsonPayload(raw: string): unknown {
  const direct = tryParseJson(raw.trim());
  if (direct) return direct;

  const jsonFence = raw.match(/```json\s*([\s\S]*?)```/i) ?? raw.match(/```\s*([\s\S]*?)```/);
  if (jsonFence?.[1]) {
    const parsed = tryParseJson(jsonFence[1].trim());
    if (parsed) return parsed;
  }

  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return tryParseJson(raw.slice(firstBrace, lastBrace + 1).trim());
  }

  return null;
}

export function chooseArchiveInformedMoodPhrase(rawMood: string, archive: MoodArchiveEntry[]): string {
  const summarized = summarizeMood(rawMood);
  if (summarized !== 'Open Mood') return summarized;
  if (archive.length === 0) return summarized;

  const stats = new Map<string, { count: number; lastIndex: number }>();
  archive.forEach((entry, index) => {
    const phrase = entry.moodPhrase?.trim();
    if (!phrase) return;
    const existing = stats.get(phrase);
    if (existing) {
      existing.count += 1;
      existing.lastIndex = index;
      return;
    }
    stats.set(phrase, { count: 1, lastIndex: index });
  });

  const ranked = [...stats.entries()].sort((a, b) => {
    if (b[1].count !== a[1].count) return b[1].count - a[1].count;
    if (b[1].lastIndex !== a[1].lastIndex) return b[1].lastIndex - a[1].lastIndex;
    return a[0].localeCompare(b[0]);
  });

  return ranked[0]?.[0] ?? summarized;
}

export function resolvePlaylistFromModel(
  rawMood: string,
  modelOutput: unknown,
  archive: MoodArchiveEntry[] = [],
  limit = MAX_PLAYLIST_SONGS,
): ResolvedPlaylist {
  const boundedLimit = Math.max(1, Math.min(limit, MAX_PLAYLIST_SONGS));
  const fallbackMoodPhrase = chooseArchiveInformedMoodPhrase(rawMood, archive);
  const fallbackAdjacentMoods = getDeterministicAdjacentMoods(fallbackMoodPhrase, archive, rawMood);

  let proposal: ModelPlaylistProposal | null = null;
  if (typeof modelOutput === 'string') {
    const parsed = extractJsonPayload(modelOutput);
    proposal = parsed && typeof parsed === 'object' ? (parsed as ModelPlaylistProposal) : null;
  } else if (modelOutput && typeof modelOutput === 'object') {
    proposal = modelOutput as ModelPlaylistProposal;
  }

  if (!proposal) {
    return {
      moodPhrase: fallbackMoodPhrase,
      adjacentMoods: fallbackAdjacentMoods,
      songs: suggestSongs(fallbackMoodPhrase, boundedLimit),
      usedFallback: true,
      failureReason: 'Model response was not valid JSON.',
    };
  }

  if (!normalizeMoodPhraseFromModel(proposal.moodPhrase)) {
    return {
      moodPhrase: fallbackMoodPhrase,
      adjacentMoods: fallbackAdjacentMoods,
      songs: suggestSongs(fallbackMoodPhrase, boundedLimit),
      usedFallback: true,
      failureReason: 'Model response failed validation: moodPhrase must be a non-empty string.',
    };
  }

  if (!Array.isArray(proposal.adjacentMoods)) {
    return {
      moodPhrase: fallbackMoodPhrase,
      adjacentMoods: fallbackAdjacentMoods,
      songs: suggestSongs(fallbackMoodPhrase, boundedLimit),
      usedFallback: true,
      failureReason: 'Model response failed validation: adjacentMoods must be an array.',
    };
  }

  if (!Array.isArray(proposal.songs) || proposal.songs.length === 0 || proposal.songs.length > boundedLimit) {
    return {
      moodPhrase: fallbackMoodPhrase,
      adjacentMoods: fallbackAdjacentMoods,
      songs: suggestSongs(fallbackMoodPhrase, boundedLimit),
      usedFallback: true,
      failureReason: `Model response failed validation: songs must be an array with 1-${boundedLimit} items.`,
    };
  }

  for (const [index, song] of proposal.songs.entries()) {
    if (!song || typeof song !== 'object') {
      return {
        moodPhrase: fallbackMoodPhrase,
        adjacentMoods: fallbackAdjacentMoods,
        songs: suggestSongs(fallbackMoodPhrase, boundedLimit),
        usedFallback: true,
        failureReason: `Model response failed validation: songs[${index}] must be an object.`,
      };
    }
    const record = song as Record<string, unknown>;
    if (
      typeof record.genre !== 'string' || !record.genre.trim() ||
      typeof record.artist !== 'string' || !record.artist.trim() ||
      typeof record.song !== 'string' || !record.song.trim()
    ) {
      return {
        moodPhrase: fallbackMoodPhrase,
        adjacentMoods: fallbackAdjacentMoods,
        songs: suggestSongs(fallbackMoodPhrase, boundedLimit),
        usedFallback: true,
        failureReason: `Model response failed validation: songs[${index}] requires non-empty genre, artist, and song.`,
      };
    }
  }

  const moodPhrase = normalizeMoodPhraseFromModel(proposal?.moodPhrase) ?? fallbackMoodPhrase;
  const adjacentMoods = normalizeAdjacentMoodsFromModel(proposal?.adjacentMoods, moodPhrase);
  const songs = normalizeSongsFromModel(proposal?.songs, moodPhrase).slice(0, boundedLimit);

  if (songs.length === 0) {
    return {
      moodPhrase: fallbackMoodPhrase,
      adjacentMoods: fallbackAdjacentMoods,
      songs: suggestSongs(fallbackMoodPhrase, boundedLimit),
      usedFallback: true,
      failureReason: `Model response failed validation: songs require non-empty genre, artist, and song (max ${MAX_PLAYLIST_SONGS}).`,
    };
  }

  return {
    moodPhrase,
    adjacentMoods: adjacentMoods.length > 0 ? adjacentMoods : fallbackAdjacentMoods,
    songs,
    usedFallback: false,
  };
}

export function readMoodArchive(archivePath: string): MoodArchiveEntry[] {
  if (!existsSync(archivePath)) return [];
  const lines = readFileSync(archivePath, 'utf-8').split(/\r?\n/);
  const entries: MoodArchiveEntry[] = [];
  for (const line of lines) {
    const cells = parseMarkdownTableCells(line);
    if (!cells) continue;
    if (isMarkdownDividerRow(cells)) continue;
    if (cells[0] && cells[0].includes('DateTime')) continue;
    if (cells.length !== 3) continue;
    const [dateTime, rawMood, moodPhrase] = cells;
    entries.push({ dateTime, rawMood, moodPhrase });
  }
  return entries;
}

function parseMarkdownTableCells(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return null;

  const core = trimmed.slice(1, trimmed.endsWith('|') ? -1 : undefined);
  const cells: string[] = [];
  let current = '';
  let escaped = false;

  for (const char of core) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '|') {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (escaped) current += '\\';
  cells.push(current.trim());
  return cells;
}

function isMarkdownDividerRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, '')));
}

function normalizeTableHeader(value: string): string {
  return value.trim().toLowerCase();
}

function extractMarkdownLinkUrl(cell: string): string | null {
  const markdownLink = cell.match(/\[[^\]]*]\((https?:\/\/[^)\s]+)\)/i);
  if (markdownLink?.[1]) return markdownLink[1];

  const plainLink = cell.match(/https?:\/\/\S+/i);
  return plainLink?.[0] ?? null;
}

export function listSavedPlaylistFiles(playlistsDir: string): SavedPlaylistFile[] {
  if (!existsSync(playlistsDir)) return [];

  const files = readdirSync(playlistsDir)
    .filter((filename) => /^playlist-\d{4}-\d{2}-\d{2}\.md$/.test(filename))
    .sort((a, b) => b.localeCompare(a));

  return files.map((filename) => ({
    filename,
    fullPath: join(playlistsDir, filename),
    dateLabel: filename.replace(/^playlist-/, '').replace(/\.md$/, ''),
  }));
}

export function readSavedPlaylistEntries(filePath: string): SavedPlaylistEntry[] {
  if (!existsSync(filePath)) return [];
  const lines = readFileSync(filePath, 'utf-8').split(/\r?\n/);
  const entries: SavedPlaylistEntry[] = [];
  let inPlaylistTable = false;

  for (const [index, line] of lines.entries()) {
    const cells = parseMarkdownTableCells(line);
    if (!cells) continue;

    const normalizedCells = cells.map(normalizeTableHeader);
    if (
      normalizedCells.length >= 5 &&
      normalizedCells[0] === 'mood' &&
      normalizedCells[1] === 'genre' &&
      normalizedCells[2] === 'artist' &&
      normalizedCells[3] === 'song' &&
      normalizedCells[4] === 'youtube link'
    ) {
      inPlaylistTable = true;
      continue;
    }

    if (!inPlaylistTable || isMarkdownDividerRow(cells)) continue;
    if (cells.length < 5) {
      entries.push({
        mood: '',
        genre: '',
        artist: '',
        song: '',
        youtubeLink: null,
        rowNumber: index + 1,
        diagnostics: 'Malformed playlist row (expected 5 columns).',
      });
      continue;
    }

    const [mood, genre, artist, song, linkCell] = cells;
    const youtubeLink = extractMarkdownLinkUrl(linkCell);
    const isExplicitlyMissing = /^n\/?a$/i.test(linkCell.trim()) || linkCell.trim().length === 0;
    entries.push({
      mood,
      genre,
      artist,
      song,
      youtubeLink,
      rowNumber: index + 1,
      diagnostics: youtubeLink || isExplicitlyMissing ? undefined : `Unable to parse stored YouTube link from: "${linkCell}"`,
    });
  }

  return entries;
}

function normalizeSessionMood(mood: string): string {
  const trimmed = mood.trim();
  return trimmed.length > 0 ? trimmed : 'Unknown Mood';
}

function buildSavedPlaylistSession(entries: SavedPlaylistEntry[]): SavedPlaylistMoodSession {
  const startRow = entries[0]?.rowNumber ?? 0;
  const endRow = entries[entries.length - 1]?.rowNumber ?? startRow;
  const mood = normalizeSessionMood(entries[0]?.mood ?? '');
  const linkCount = entries.filter((entry) => entry.youtubeLink).length;
  const label = `${mood} — rows ${startRow}-${endRow} (${entries.length} songs, ${linkCount} links)`;
  return {
    mood,
    label,
    startRow,
    endRow,
    entries,
    linkCount,
  };
}

export function groupSavedPlaylistSessions(entries: SavedPlaylistEntry[]): SavedPlaylistMoodSession[] {
  if (entries.length === 0) return [];

  const sessions: SavedPlaylistMoodSession[] = [];
  let currentEntries: SavedPlaylistEntry[] = [];
  let currentSessionMood = normalizeSessionMood(entries[0]?.mood ?? '');

  for (const entry of entries) {
    const entrySessionMood = normalizeSessionMood(entry.mood);
    if (currentEntries.length === 0) {
      currentEntries = [entry];
      currentSessionMood = entrySessionMood;
      continue;
    }

    if (entrySessionMood !== currentSessionMood) {
      sessions.push(buildSavedPlaylistSession(currentEntries));
      currentEntries = [entry];
      currentSessionMood = entrySessionMood;
      continue;
    }

    currentEntries.push(entry);
  }

  if (currentEntries.length > 0) {
    sessions.push(buildSavedPlaylistSession(currentEntries));
  }

  return sessions;
}

export function appendMarkdownRow(filePath: string, headers: string[], row: string[]): void {
  mkdirSync(dirname(filePath), { recursive: true });

  const tableHeader = `| ${headers.join(' | ')} |`;
  const tableDivider = `| ${headers.map(() => '---').join(' | ')} |`;
  const newRow = `| ${row.join(' | ')} |`;

  if (!existsSync(filePath)) {
    writeFileSync(filePath, `${tableHeader}\n${tableDivider}\n${newRow}\n`, 'utf-8');
    return;
  }

  const existing = readFileSync(filePath, 'utf-8').trimEnd();
  const needsHeader = !existing.includes(tableHeader);
  const prefix = needsHeader ? `${existing}\n\n${tableHeader}\n${tableDivider}` : existing;
  writeFileSync(filePath, `${prefix}\n${newRow}\n`, 'utf-8');
}

export function recoverYouTubeLinksFromPlaylistMarkdown(markdown: string): string[] {
  const recovered: string[] = [];
  const lines = markdown.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    if (trimmed.includes('YouTube Link') || trimmed.includes('---')) continue;

    const cells = trimmed
      .split(/(?<!\\)\|/g)
      .map((cell) => cell.trim())
      .filter(Boolean);
    const youtubeLinkCell = cells[4];
    if (!youtubeLinkCell) continue;

    const markdownLink = youtubeLinkCell.match(/^\[[^\]]+]\((https?:\/\/[^)\s]+)\)$/)?.[1];
    const bareLink = youtubeLinkCell.match(/^(https?:\/\/\S+)$/)?.[1];
    const candidateLinks = [markdownLink, bareLink].filter((value): value is string => Boolean(value));

    for (const link of candidateLinks) {
      try {
        const parsed = new URL(link);
        const host = parsed.hostname.toLowerCase();
        const isYouTubeHost = host === 'youtu.be' || host.includes('youtube.com');
        if (isYouTubeHost) recovered.push(link);
      } catch {
        // Skip malformed URLs in malformed table rows.
      }
    }
  }
  return recovered;
}

export function recoverYouTubeLinksFromPlaylistMarkdownFiles(markdowns: string[]): string[] {
  return markdowns.flatMap((markdown) => recoverYouTubeLinksFromPlaylistMarkdown(markdown));
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    if (hostname === 'youtu.be') {
      const shortId = parsed.pathname.split('/').filter(Boolean)[0]?.trim() ?? '';
      return /^[a-zA-Z0-9_-]{11}$/.test(shortId) ? shortId : null;
    }

    if (hostname !== 'youtube.com' && !hostname.endsWith('.youtube.com')) return null;
    const id = parsed.searchParams.get('v');
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;

    const pathMatch = parsed.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})(?:\/|$)/);
    return pathMatch?.[1] ?? null;
  } catch {
    return null;
  }
}

export function buildYouTubePlaylistUrl(videoIds: string[]): string {
  const uniqueIds = [...new Set(videoIds.filter((id) => /^[a-zA-Z0-9_-]{11}$/.test(id)))].slice(0, MAX_PLAYLIST_SONGS);
  return `https://www.youtube.com/watch_videos?video_ids=${uniqueIds.join(',')}`;
}

export async function resolveLaunchVideoIdsFromLinks(
  links: string[],
  maxVideos = MAX_PLAYLIST_SONGS,
): Promise<LaunchVideoResolution> {
  const limit = Math.max(1, Math.min(maxVideos, MAX_PLAYLIST_SONGS));
  const videoIds: string[] = [];
  const skipped: LaunchSkippedEntry[] = [];
  const seen = new Set<string>();

  for (const rawLink of links) {
    const link = rawLink.trim();

    if (videoIds.length >= limit) {
      skipped.push({ link, reason: 'max-videos-reached' });
      continue;
    }

    const directId = extractYouTubeVideoId(link);
    if (directId) {
      if (seen.has(directId)) {
        skipped.push({ link, reason: 'duplicate-video-id' });
        continue;
      }
      seen.add(directId);
      videoIds.push(directId);
      continue;
    }

    let parsed: URL;
    try {
      parsed = new URL(link);
    } catch {
      skipped.push({ link, reason: 'invalid-link' });
      continue;
    }

    const host = parsed.hostname.toLowerCase();
    const isYouTubeHost =
      host === 'youtu.be' ||
      host === 'youtube.com' ||
      host.endsWith('.youtube.com');
    if (!isYouTubeHost) {
      skipped.push({ link, reason: 'non-youtube-link' });
      continue;
    }

    const isSearchQuery =
      (host === 'youtube.com' || host.endsWith('.youtube.com')) &&
      parsed.pathname === '/results' &&
      parsed.searchParams.has('search_query');
    if (!isSearchQuery) {
      skipped.push({ link, reason: 'missing-video-id' });
      continue;
    }

    const resolved = await resolveYouTubeSearchResultId(link);
    if (!resolved) {
      skipped.push({ link, reason: 'unresolved-search-query' });
      continue;
    }
    if (seen.has(resolved)) {
      skipped.push({ link, reason: 'duplicate-video-id' });
      continue;
    }

    seen.add(resolved);
    videoIds.push(resolved);
  }

  return { videoIds, skipped };
}

export async function resolveHistoricalLaunchFromPlaylistMarkdown(
  markdowns: string[],
  maxVideos = MAX_PLAYLIST_SONGS,
): Promise<LaunchVideoResolution> {
  const recoveredLinks = recoverYouTubeLinksFromPlaylistMarkdownFiles(markdowns);
  if (recoveredLinks.length === 0) {
    return { videoIds: [], skipped: [] };
  }
  return resolveLaunchVideoIdsFromLinks(recoveredLinks, maxVideos);
}

async function resolveYouTubeSearchResultId(searchUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const html = await response.text();
    return extractTopYouTubeSearchVideoId(html);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractTopYouTubeSearchVideoId(html: string): string | null {
  const initialDataId = extractVideoIdFromYtInitialData(html);
  if (initialDataId) return initialDataId;

  const rendererMatch = html.match(/(?:"|\\")videoRenderer(?:"|\\")\s*:\s*\{[^{}]*?(?:"|\\")videoId(?:"|\\")\s*:\s*(?:"|\\")([a-zA-Z0-9_-]{11})(?:"|\\")/);
  if (rendererMatch?.[1]) return rendererMatch[1];

  const watchMatch = html.match(/watch(?:\\u003F|\?)v(?:\\u003D|=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch?.[1]) return watchMatch[1];

  return null;
}

function extractVideoIdFromYtInitialData(html: string): string | null {
  const jsonCandidates = collectYtInitialDataJsonCandidates(html);
  for (const candidate of jsonCandidates) {
    const initialData = tryParseJson(candidate);
    if (!initialData) continue;
    const topResultVideoId = findTopSearchResultVideoId(initialData);
    if (topResultVideoId) return topResultVideoId;

    const firstVideoId = findFirstVideoRendererId(initialData);
    if (firstVideoId) return firstVideoId;
  }

  return null;
}

function collectYtInitialDataJsonCandidates(html: string): string[] {
  const candidates: string[] = [];
  const markers = ['var ytInitialData =', 'window["ytInitialData"] =', 'ytInitialData ='];
  for (const marker of markers) {
    const assignedObject = extractAssignedJsonObject(html, marker);
    if (assignedObject) {
      candidates.push(assignedObject);
    }
  }

  const parseCall = /ytInitialData\s*=\s*JSON\.parse\(\s*(['"])([\s\S]*?)\1\s*\)/g;
  let parseMatch = parseCall.exec(html);
  while (parseMatch) {
    const decoded = decodeJsStringLiteral(parseMatch[2] ?? '');
    if (decoded) candidates.push(decoded);
    parseMatch = parseCall.exec(html);
  }

  const quotedAssign = /ytInitialData\s*=\s*(['"])([\s\S]*?)\1\s*;/g;
  let quotedMatch = quotedAssign.exec(html);
  while (quotedMatch) {
    const decoded = decodeJsStringLiteral(quotedMatch[2] ?? '');
    if (decoded) candidates.push(decoded);
    quotedMatch = quotedAssign.exec(html);
  }

  return candidates;
}

function extractAssignedJsonObject(source: string, marker: string): string | null {
  let markerIndex = source.indexOf(marker);

  while (markerIndex !== -1) {
    const objectStart = source.indexOf('{', markerIndex + marker.length);
    if (objectStart === -1) return null;

    let depth = 0;
    let inString = false;
    let isEscaped = false;

    for (let i = objectStart; i < source.length; i += 1) {
      const char = source[i];

      if (inString) {
        if (isEscaped) {
          isEscaped = false;
          continue;
        }

        if (char === '\\') {
          isEscaped = true;
          continue;
        }

        if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === '{') {
        depth += 1;
        continue;
      }

      if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          return source.slice(objectStart, i + 1);
        }
      }
    }

    markerIndex = source.indexOf(marker, markerIndex + marker.length);
  }

  return null;
}

function decodeJsStringLiteral(value: string): string | null {
  let result = '';
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char !== '\\') {
      result += char;
      continue;
    }

    const next = value[i + 1];
    if (!next) return null;
    i += 1;

    switch (next) {
      case '\\':
      case '"':
      case '\'':
      case '/':
        result += next;
        break;
      case 'n':
        result += '\n';
        break;
      case 'r':
        result += '\r';
        break;
      case 't':
        result += '\t';
        break;
      case 'b':
        result += '\b';
        break;
      case 'f':
        result += '\f';
        break;
      case 'u': {
        const hex = value.slice(i + 1, i + 5);
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) return null;
        result += String.fromCharCode(parseInt(hex, 16));
        i += 4;
        break;
      }
      case 'x': {
        const hex = value.slice(i + 1, i + 3);
        if (!/^[0-9a-fA-F]{2}$/.test(hex)) return null;
        result += String.fromCharCode(parseInt(hex, 16));
        i += 2;
        break;
      }
      default:
        result += next;
        break;
    }
  }

  return result;
}

function findTopSearchResultVideoId(initialData: unknown): string | null {
  if (!initialData || typeof initialData !== 'object') return null;
  const root = initialData as Record<string, unknown>;
  const contents = root.contents;
  if (!contents || typeof contents !== 'object') return null;

  const twoColumn = (contents as Record<string, unknown>).twoColumnSearchResultsRenderer;
  if (!twoColumn || typeof twoColumn !== 'object') return null;

  const primaryContents = (twoColumn as Record<string, unknown>).primaryContents;
  if (!primaryContents || typeof primaryContents !== 'object') return null;

  const sectionList = (primaryContents as Record<string, unknown>).sectionListRenderer;
  if (!sectionList || typeof sectionList !== 'object') return null;

  const sections = (sectionList as Record<string, unknown>).contents;
  if (!Array.isArray(sections)) return null;

  for (const section of sections) {
    if (!section || typeof section !== 'object') continue;
    const sectionRecord = section as Record<string, unknown>;
    const itemSection = sectionRecord.itemSectionRenderer;
    if (!itemSection || typeof itemSection !== 'object') continue;
    const items = (itemSection as Record<string, unknown>).contents;
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      const id = extractVideoIdFromSearchResultItem(item);
      if (id) return id;
    }
  }

  return null;
}

function extractVideoIdFromSearchResultItem(item: unknown): string | null {
  if (!item || typeof item !== 'object') return null;
  const record = item as Record<string, unknown>;

  const direct = extractVideoIdFromRenderer(record.videoRenderer);
  if (direct) return direct;

  const richItem = record.richItemRenderer;
  if (!richItem || typeof richItem !== 'object') return null;

  const content = (richItem as Record<string, unknown>).content;
  if (!content || typeof content !== 'object') return null;

  return extractVideoIdFromRenderer((content as Record<string, unknown>).videoRenderer);
}

function extractVideoIdFromRenderer(renderer: unknown): string | null {
  if (!renderer || typeof renderer !== 'object') return null;
  const videoId = (renderer as Record<string, unknown>).videoId;
  if (typeof videoId !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return null;
  return videoId;
}

function findFirstVideoRendererId(node: unknown): string | null {
  if (!node || typeof node !== 'object') return null;

  if (Array.isArray(node)) {
    for (const value of node) {
      const match = findFirstVideoRendererId(value);
      if (match) return match;
    }
    return null;
  }

  const recordNode = node as Record<string, unknown>;
  const renderer = recordNode.videoRenderer;
  if (renderer && typeof renderer === 'object') {
    const videoId = (renderer as Record<string, unknown>).videoId;
    if (typeof videoId === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) return videoId;
  }

  for (const value of Object.values(recordNode)) {
    const match = findFirstVideoRendererId(value);
    if (match) return match;
  }

  return null;
}

export function getPlaylistFilename(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `playlist-${year}-${month}-${day}.md`;
}

export async function findYouTubeLink(song: SongSuggestion, moodPhrase: string): Promise<string> {
  const query = encodeURIComponent(`${song.artist} ${song.song} official audio ${moodPhrase}`);
  const searchUrl = `https://www.youtube.com/results?search_query=${query}`;

  try {
    const match = await resolveYouTubeSearchResultId(searchUrl);
    if (!match) return searchUrl;
    return `https://www.youtube.com/watch?v=${match}`;
  } catch {
    return searchUrl;
  }
}
