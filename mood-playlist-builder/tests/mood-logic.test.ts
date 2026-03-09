import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  appendMarkdownRow,
  buildArchiveMoodSuggestions,
  buildYouTubePlaylistUrl,
  chooseArchiveInformedMoodPhrase,
  extractYouTubeVideoId,
  findYouTubeLink,
  getPlaylistFilename,
  groupSavedPlaylistSessions,
  listSavedPlaylistFiles,
  MAX_PLAYLIST_SONGS,
  normalizeMoodPhraseFromModel,
  normalizeSongsFromModel,
  readMoodArchive,
  readSavedPlaylistEntries,
  recoverYouTubeLinksFromPlaylistMarkdown,
  recoverYouTubeLinksFromPlaylistMarkdownFiles,
  resolveLaunchVideoIdsFromLinks,
  resolveHistoricalLaunchFromPlaylistMarkdown,
  resolvePlaylistFromModel,
  suggestSongs,
  summarizeMood,
} from '../mood-logic.js';

test('summarizeMood maps known keywords to stable 1-3 word mood phrase', () => {
  assert.equal(summarizeMood('I feel hyped and ready for a workout'), 'High Energy');
  assert.equal(summarizeMood('Need to focus and stay productive today'), 'Calm Focus');
  assert.equal(summarizeMood(''), 'Open Mood');
});

test('normalizeMoodPhraseFromModel trims and bounds phrase to 3 words', () => {
  assert.equal(normalizeMoodPhraseFromModel('   DEEP   night   focus   mode   '), 'Deep Night Focus');
  assert.equal(normalizeMoodPhraseFromModel('   '), null);
  assert.equal(normalizeMoodPhraseFromModel(12), null);
});

test('normalizeSongsFromModel keeps only valid songs with required fields and max 8', () => {
  const longList = Array.from({ length: 20 }, (_, index) => ({
    genre: index % 2 === 0 ? 'Alt' : 'Indie',
    artist: `Artist ${index + 1}`,
    song: `Song ${index + 1}`,
  }));
  const normalized = normalizeSongsFromModel([
    ...longList,
    { artist: '', song: 'Missing Artist' },
    { artist: 'Missing Song', song: '' },
    { bad: 'shape' },
  ], 'Calm Focus');

  assert.equal(normalized.length, MAX_PLAYLIST_SONGS);
  assert.deepEqual(normalized[0], { genre: 'Alt', artist: 'Artist 1', song: 'Song 1' });
  assert.deepEqual(normalized[1], { genre: 'Indie', artist: 'Artist 2', song: 'Song 2' });
});

test('resolvePlaylistFromModel falls back to deterministic suggestions on malformed or empty model output', () => {
  const fallbackFromMalformed = resolvePlaylistFromModel('need to focus', '{"songs":[{"artist":"A"}]}');
  assert.equal(fallbackFromMalformed.usedFallback, true);
  assert.equal(fallbackFromMalformed.moodPhrase, 'Calm Focus');
  assert.deepEqual(fallbackFromMalformed.songs, suggestSongs('Calm Focus', MAX_PLAYLIST_SONGS));

  const fallbackFromEmpty = resolvePlaylistFromModel('hyped workout', { moodPhrase: 'High Energy', songs: [] });
  assert.equal(fallbackFromEmpty.usedFallback, true);
  assert.equal(fallbackFromEmpty.moodPhrase, 'High Energy');
  assert.deepEqual(fallbackFromEmpty.songs, suggestSongs('High Energy', MAX_PLAYLIST_SONGS));
});

test('resolvePlaylistFromModel accepts valid model proposal and normalizes phrase/songs', () => {
  const resolved = resolvePlaylistFromModel('ignored', {
    moodPhrase: '  late   NIGHT chill  deluxe  ',
    adjacentMoods: ['Calm Focus', 'Rainy Reflection'],
    songs: [
      { genre: 'Dream Pop', artist: ' Beach House ', song: ' Space Song ' },
      { genre: 'Lo-fi', artist: 'Joji', song: 'SLOW DANCING IN THE DARK' },
    ],
  }, [], 5);

  assert.equal(resolved.usedFallback, false);
  assert.equal(resolved.moodPhrase, 'Late Night Chill');
  assert.deepEqual(resolved.songs, [
    { genre: 'Dream Pop', artist: 'Beach House', song: 'Space Song' },
    { genre: 'Lo-fi', artist: 'Joji', song: 'SLOW DANCING IN THE DARK' },
  ]);
});

test('appendMarkdownRow creates header once and appends rows', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'mood-playlist-test-'));
  const markdownPath = join(tempRoot, 'playlist.md');

  appendMarkdownRow(markdownPath, ['Mood', 'Genre', 'Artist', 'Song', 'YouTube Link'], [
    'Calm Focus',
    'Lo-fi',
    'Nujabes',
    'Feather',
    '[Watch](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
  ]);

  appendMarkdownRow(markdownPath, ['Mood', 'Genre', 'Artist', 'Song', 'YouTube Link'], [
    'Calm Focus',
    'Jazz',
    'Miles Davis',
    'Blue in Green',
    '[Watch](https://www.youtube.com/watch?v=ylXk1LBvIqU)',
  ]);

  const content = readFileSync(markdownPath, 'utf-8');
  const headerCount = (content.match(/\| Mood \| Genre \| Artist \| Song \| YouTube Link \|/g) ?? []).length;
  const rowCount = (content.match(/\| Calm Focus \|/g) ?? []).length;

  assert.equal(headerCount, 1);
  assert.equal(rowCount, 2);
});

test('playlist filename and archive append semantics remain append-only and parseable', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'mood-playlist-archive-'));
  const playlistPath = join(tempRoot, 'mood-playlists', getPlaylistFilename(new Date('2026-03-09T08:30:00Z')));
  const archivePath = join(tempRoot, 'mood-archive.md');

  assert.equal(getPlaylistFilename(new Date('2026-03-09T08:30:00Z')), 'playlist-2026-03-09.md');

  appendMarkdownRow(playlistPath, ['Mood', 'Genre', 'Artist', 'Song', 'YouTube Link'], [
    'Calm Focus',
    'Lo-fi',
    'Nujabes',
    'Feather',
    '[Watch](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
  ]);
  appendMarkdownRow(playlistPath, ['Mood', 'Genre', 'Artist', 'Song', 'YouTube Link'], [
    'Calm Focus',
    'Jazz',
    'Miles Davis',
    'Blue in Green',
    '[Watch](https://www.youtube.com/watch?v=ylXk1LBvIqU)',
  ]);

  appendMarkdownRow(archivePath, ['DateTime', 'Raw Mood', 'Mood Phrase'], [
    '2026-03-09T08:30:00.000Z',
    'need deep focus',
    'Calm Focus',
  ]);
  appendMarkdownRow(archivePath, ['DateTime', 'Raw Mood', 'Mood Phrase'], [
    '2026-03-09T09:00:00.000Z',
    'still focused',
    'Calm Focus',
  ]);

  const playlist = readFileSync(playlistPath, 'utf-8');
  const archive = readFileSync(archivePath, 'utf-8');
  const archiveEntries = readMoodArchive(archivePath);

  assert.equal((playlist.match(/\| Mood \| Genre \| Artist \| Song \| YouTube Link \|/g) ?? []).length, 1);
  assert.equal((archive.match(/\| DateTime \| Raw Mood \| Mood Phrase \|/g) ?? []).length, 1);
  assert.equal((archive.match(/\| 2026-03-09T/g) ?? []).length, 2);
  assert.deepEqual(archiveEntries.map((entry) => entry.moodPhrase), ['Calm Focus', 'Calm Focus']);
});

test('extractYouTubeVideoId and buildYouTubePlaylistUrl use v query video IDs', () => {
  const first = extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const second = extractYouTubeVideoId('https://youtu.be/3JZ_D3ELwOQ');
  const withExtraParams = extractYouTubeVideoId('https://www.youtube.com/watch?v=QH2-TGUlwu4&t=42s');
  const shorts = extractYouTubeVideoId('https://m.youtube.com/shorts/aqz-KE-bpKQ?feature=share');
  const invalidLength = extractYouTubeVideoId('https://youtu.be/abc');
  const invalid = extractYouTubeVideoId('https://example.com/watch?v=dQw4w9WgXcQ');

  assert.equal(first, 'dQw4w9WgXcQ');
  assert.equal(second, '3JZ_D3ELwOQ');
  assert.equal(withExtraParams, 'QH2-TGUlwu4');
  assert.equal(shorts, 'aqz-KE-bpKQ');
  assert.equal(invalidLength, null);
  assert.equal(invalid, null);

  const playlistUrl = buildYouTubePlaylistUrl(['dQw4w9WgXcQ', '3JZ_D3ELwOQ', 'dQw4w9WgXcQ', 'not-a-video-id']);
  assert.equal(playlistUrl, 'https://www.youtube.com/watch_videos?video_ids=dQw4w9WgXcQ,3JZ_D3ELwOQ');
});

test('buildYouTubePlaylistUrl keeps deduped IDs and caps launch list at 8 entries', () => {
  const ids = Array.from({ length: 12 }, (_, i) => `${String(i).padStart(2, '0')}bcdefghijk`).map((id) => id.slice(0, 11));
  const playlistUrl = buildYouTubePlaylistUrl([...ids, ids[2], ids[4]]);
  const videoIdsSegment = playlistUrl.split('video_ids=')[1] ?? '';
  const launchIds = videoIdsSegment.split(',').filter(Boolean);

  assert.equal(launchIds.length, MAX_PLAYLIST_SONGS);
  assert.deepEqual(launchIds, ids.slice(0, MAX_PLAYLIST_SONGS));
});

test('resolveLaunchVideoIdsFromLinks resolves mixed watch/search links into launchable IDs', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: URL | RequestInfo) => {
    const value = String(input);
    if (value.includes('artistA')) {
      return new Response('<html>..."videoRenderer":{"videoId":"QH2-TGUlwu4"}...</html>', { status: 200 });
    }
    if (value.includes('artistB')) {
      return new Response('<html>...watch?v=ylXk1LBvIqU...</html>', { status: 200 });
    }
    return new Response('<html>no watch ids</html>', { status: 200 });
  }) as typeof fetch;

  try {
    const resolution = await resolveLaunchVideoIdsFromLinks([
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/results?search_query=artistA+songA',
      'https://www.youtube.com/results?search_query=artistB+songB',
    ]);

    assert.deepEqual(resolution.videoIds, ['dQw4w9WgXcQ', 'QH2-TGUlwu4', 'ylXk1LBvIqU']);
    assert.deepEqual(resolution.skipped, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('resolveLaunchVideoIdsFromLinks prefers top result from ytInitialData when watch links appear earlier in HTML', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(
    `<html>
      <a href="/watch?v=AAAAAAAAAAA">noise</a>
      <script>
        var ytInitialData = {"contents":{"twoColumnSearchResultsRenderer":{"primaryContents":{"sectionListRenderer":{"contents":[{"itemSectionRenderer":{"contents":[{"videoRenderer":{"videoId":"QH2-TGUlwu4"}},{"videoRenderer":{"videoId":"ylXk1LBvIqU"}}]}}]}}}};
      </script>
    </html>`,
    { status: 200 },
  )) as typeof fetch;

  try {
    const resolution = await resolveLaunchVideoIdsFromLinks([
      'https://www.youtube.com/results?search_query=top-result-check',
    ]);

    assert.deepEqual(resolution.videoIds, ['QH2-TGUlwu4']);
    assert.deepEqual(resolution.skipped, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("resolveLaunchVideoIdsFromLinks resolves apostrophe search queries and includes them in watch_videos payload", async () => {
  const originalFetch = globalThis.fetch;
  const directIds = Array.from({ length: 6 }, (_, i) => `${String(i).padStart(2, '0')}bcdefghijk`).map((id) =>
    id.slice(0, 11),
  );
  const whoId = 'QH2-TGUlwu4';
  const ridinId = 'ylXk1LBvIqU';

  globalThis.fetch = (async (input: URL | RequestInfo) => {
    const requestUrl = new URL(String(input));
    const query = requestUrl.searchParams.get('search_query') ?? '';

    if (query === "Who's Making Love") {
      return new Response(`<html>..."videoRenderer":{"videoId":"${whoId}"}...</html>`, { status: 200 });
    }
    if (query === "Ridin'") {
      return new Response(`<html>...watch?v=${ridinId}...</html>`, { status: 200 });
    }
    return new Response('<html>no resolvable video id</html>', { status: 200 });
  }) as typeof fetch;

  try {
    const resolution = await resolveLaunchVideoIdsFromLinks([
      'https://www.youtube.com/results?search_query=Who%27s+Making+Love',
      'https://www.youtube.com/results?search_query=Unresolved%20Example',
      ...directIds.map((id) => `https://www.youtube.com/watch?v=${id}`),
      'https://www.youtube.com/results?search_query=Ridin%27',
    ]);

    assert.equal(resolution.videoIds.length, MAX_PLAYLIST_SONGS);
    assert.deepEqual(resolution.videoIds, [whoId, ...directIds, ridinId]);
    assert.deepEqual(resolution.skipped.map((entry) => entry.reason), ['unresolved-search-query']);

    const launchPayload = buildYouTubePlaylistUrl(resolution.videoIds);
    assert.equal(launchPayload, `https://www.youtube.com/watch_videos?video_ids=${[whoId, ...directIds, ridinId].join(',')}`);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('resolveLaunchVideoIdsFromLinks resolves escaped ytInitialData JSON.parse payloads for apostrophe queries', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: URL | RequestInfo) => {
    const value = String(input);
    assert.equal(value.includes('Who%27s+Making+Love'), true);
    return new Response(
      `<html>
        <script>
          ytInitialData = JSON.parse('{\\\"contents\\\":{\\\"twoColumnSearchResultsRenderer\\\":{\\\"primaryContents\\\":{\\\"sectionListRenderer\\\":{\\\"contents\\\":[{\\\"itemSectionRenderer\\\":{\\\"contents\\\":[{\\\"videoRenderer\\\":{\\\"videoId\\\":\\\"ylXk1LBvIqU\\\",\\\"title\\\":{\\\"runs\\\":[{\\\"text\\\":\\\"Who\\\\u0027s Making Love\\\"}]}}}]}}]}}}}}');
        </script>
      </html>`,
      { status: 200 },
    );
  }) as typeof fetch;

  try {
    const resolution = await resolveLaunchVideoIdsFromLinks([
      'https://www.youtube.com/results?search_query=Who%27s+Making+Love',
    ]);

    assert.deepEqual(resolution.videoIds, ['ylXk1LBvIqU']);
    assert.deepEqual(resolution.skipped, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('resolveLaunchVideoIdsFromLinks dedupes to 8 IDs and records deterministic skip reasons', async () => {
  const originalFetch = globalThis.fetch;
  const unique = Array.from({ length: 9 }, (_, i) => `${String(i).padStart(2, '0')}bcdefghijk`).map((id) => id.slice(0, 11));
  globalThis.fetch = (async (input: URL | RequestInfo) => {
    const value = String(input);
    if (value.includes('needsResolution')) {
      return new Response(`<html>watch?v=${unique[5]}</html>`, { status: 200 });
    }
    if (value.includes('unresolved')) {
      return new Response('<html>no results</html>', { status: 200 });
    }
    return new Response('<html>watch?v=unusedvideo1</html>', { status: 200 });
  }) as typeof fetch;

  try {
    const links = [
      ...unique.map((id) => `https://www.youtube.com/watch?v=${id}`),
      'https://www.youtube.com/results?search_query=needsResolution',
      'https://www.youtube.com/results?search_query=unresolved',
      'notaurl',
      'https://example.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/channel/UC1234567890',
    ];

    const resolution = await resolveLaunchVideoIdsFromLinks(links, MAX_PLAYLIST_SONGS);

    assert.equal(resolution.videoIds.length, MAX_PLAYLIST_SONGS);
    assert.deepEqual(resolution.videoIds, unique.slice(0, MAX_PLAYLIST_SONGS));
    assert.deepEqual(
      resolution.skipped.map((entry) => entry.reason),
      [
        'max-videos-reached',
        'max-videos-reached',
        'max-videos-reached',
        'max-videos-reached',
        'max-videos-reached',
        'max-videos-reached',
      ],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('resolveLaunchVideoIdsFromLinks skips unresolved and non-launchable links with stable reasons', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response('<html>still no watch id</html>', { status: 200 })) as typeof fetch;

  try {
    const resolution = await resolveLaunchVideoIdsFromLinks([
      'https://www.youtube.com/results?search_query=missing',
      'https://www.youtube.com/watch?list=PL123',
      'notaurl',
      'https://example.com/somewhere',
    ]);

    assert.deepEqual(resolution.videoIds, []);
    assert.deepEqual(
      resolution.skipped.map((entry) => entry.reason),
      ['unresolved-search-query', 'missing-video-id', 'invalid-link', 'non-youtube-link'],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('findYouTubeLink resolves results search to canonical watch URL using top extracted result', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      '<html>..."videoRenderer":{"videoId":"QH2-TGUlwu4"}..."videoRenderer":{"videoId":"ylXk1LBvIqU"}...</html>',
      { status: 200 },
    )) as typeof fetch;

  try {
    const link = await findYouTubeLink(
      { genre: 'Synthwave', artist: 'The Midnight', song: 'Days of Thunder' },
      'Night Drive',
    );
    assert.equal(link, 'https://www.youtube.com/watch?v=QH2-TGUlwu4');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('findYouTubeLink handles apostrophes and escaped renderer payloads from YouTube HTML', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: URL | RequestInfo) => {
    const value = String(input);
    assert.equal(value.includes("Ridin'") || value.includes('Ridin%27'), true);
    return new Response(
      '<html>...{\\"videoRenderer\\":{\\"videoId\\":\\"QH2-TGUlwu4\\"}}...watch\\u003Fv\\u003DylXk1LBvIqU...</html>',
      { status: 200 },
    );
  }) as typeof fetch;

  try {
    const link = await findYouTubeLink(
      { genre: 'Hip-Hop', artist: 'Chamillionaire', song: "Ridin'" },
      'Bold Confidence',
    );
    assert.equal(link, 'https://www.youtube.com/watch?v=QH2-TGUlwu4');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('launch payload uses resolved top-result IDs, dedupes, and stays capped at 8', async () => {
  const originalFetch = globalThis.fetch;
  const directIds = Array.from({ length: 7 }, (_, i) => `${String(i).padStart(2, '0')}bcdefghijk`).map((id) =>
    id.slice(0, 11),
  );
  const resolvedUnique = 'ylXk1LBvIqU';
  const duplicateResolved = directIds[3];
  const overflowResolved = 'QH2-TGUlwu4';

  globalThis.fetch = (async (input: URL | RequestInfo) => {
    const value = String(input);
    if (value.includes('addUnique')) {
      return new Response(`<html>..."videoRenderer":{"videoId":"${resolvedUnique}"}...</html>`, { status: 200 });
    }
    if (value.includes('duplicate')) {
      return new Response(`<html>watch?v=${duplicateResolved}</html>`, { status: 200 });
    }
    if (value.includes('overflow')) {
      return new Response(`<html>watch?v=${overflowResolved}</html>`, { status: 200 });
    }
    return new Response('<html>no video</html>', { status: 200 });
  }) as typeof fetch;

  try {
    const resolution = await resolveLaunchVideoIdsFromLinks([
      ...directIds.map((id) => `https://www.youtube.com/watch?v=${id}`),
      'https://www.youtube.com/results?search_query=duplicate',
      'https://www.youtube.com/results?search_query=addUnique',
      'https://www.youtube.com/results?search_query=overflow',
    ]);

    assert.deepEqual(resolution.videoIds, [...directIds, resolvedUnique]);
    assert.deepEqual(
      resolution.skipped.map((entry) => entry.reason),
      ['duplicate-video-id', 'max-videos-reached'],
    );

    const launchPayload = buildYouTubePlaylistUrl(resolution.videoIds);
    assert.equal(launchPayload, `https://www.youtube.com/watch_videos?video_ids=${[...directIds, resolvedUnique].join(',')}`);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('resolveLaunchVideoIdsFromLinks keeps unresolved-search-query reason deterministic when top result cannot be extracted', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response('<html>no watch ids anywhere</html>', { status: 200 })) as typeof fetch;

  try {
    const resolution = await resolveLaunchVideoIdsFromLinks([
      'https://www.youtube.com/results?search_query=first-miss',
      'https://www.youtube.com/results?search_query=second-miss',
    ]);

    assert.deepEqual(resolution.videoIds, []);
    assert.deepEqual(resolution.skipped.map((entry) => entry.reason), ['unresolved-search-query', 'unresolved-search-query']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('recoverYouTubeLinksFromPlaylistMarkdown recovers YouTube links from playlist table rows', () => {
  const markdown = [
    '| Mood | Genre | Artist | Song | YouTube Link |',
    '| --- | --- | --- | --- | --- |',
    '| Calm Focus | Lo-fi | Nujabes | Feather | [Watch](https://www.youtube.com/watch?v=dQw4w9WgXcQ) |',
    '| Calm Focus | Jazz | Miles Davis | Blue in Green | [Watch](https://www.youtube.com/results?search_query=miles+davis+blue+in+green) |',
    '| Calm Focus | Ambient | Tycho | Awake | N/A |',
  ].join('\n');

  assert.deepEqual(recoverYouTubeLinksFromPlaylistMarkdown(markdown), [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/results?search_query=miles+davis+blue+in+green',
  ]);
});

test('recoverYouTubeLinksFromPlaylistMarkdownFiles handles no prior files and malformed rows', () => {
  assert.deepEqual(recoverYouTubeLinksFromPlaylistMarkdownFiles([]), []);

  const malformed = [
    '| Mood | Genre | Artist | Song | YouTube Link |',
    '| --- | --- | --- | --- | --- |',
    '| Calm Focus | Lo-fi | Nujabes | Feather | [Watch](https://www.youtube.com/watch?v=dQw4w9WgXcQ |',
    '| Calm Focus | Lo-fi | Nujabes | Feather | [Watch](notaurl) |',
    '| Calm Focus | Lo-fi | Nujabes | Feather | [Watch](https://example.com/watch?v=dQw4w9WgXcQ) |',
  ].join('\n');

  assert.deepEqual(recoverYouTubeLinksFromPlaylistMarkdownFiles([malformed]), []);
});

test('resolveHistoricalLaunchFromPlaylistMarkdown assembles launch IDs with dedupe, cap 8, and skip reasons', async () => {
  const originalFetch = globalThis.fetch;
  const directIds = Array.from({ length: 7 }, (_, i) => `${String(i).padStart(2, '0')}bcdefghijk`).map((id) =>
    id.slice(0, 11),
  );
  const resolvedUnique = 'ylXk1LBvIqU';
  const overflowResolved = 'QH2-TGUlwu4';

  globalThis.fetch = (async (input: URL | RequestInfo) => {
    const value = String(input);
    if (value.includes('first-resolve')) {
      return new Response(`<html>..."videoRenderer":{"videoId":"${resolvedUnique}"}...</html>`, { status: 200 });
    }
    if (value.includes('overflow-resolve')) {
      return new Response(`<html>watch?v=${overflowResolved}</html>`, { status: 200 });
    }
    return new Response('<html>no watch id</html>', { status: 200 });
  }) as typeof fetch;

  const firstPlaylistMarkdown = [
    '| Mood | Genre | Artist | Song | YouTube Link |',
    '| --- | --- | --- | --- | --- |',
    ...directIds.map((id) => `| High Energy | Pop | Artist ${id} | Song ${id} | [Watch](https://www.youtube.com/watch?v=${id}) |`),
    `| High Energy | Pop | Duplicate | Duplicate | [Watch](https://www.youtube.com/watch?v=${directIds[3]}) |`,
    '| High Energy | Pop | Search One | Search One | [Watch](https://www.youtube.com/results?search_query=first-resolve) |',
  ].join('\n');

  const secondPlaylistMarkdown = [
    '| Mood | Genre | Artist | Song | YouTube Link |',
    '| --- | --- | --- | --- | --- |',
    '| High Energy | Pop | Search Overflow | Search Overflow | [Watch](https://www.youtube.com/results?search_query=overflow-resolve) |',
    '| High Energy | Pop | Not A Url | Broken | [Watch](notaurl) |',
    '| High Energy | Pop | Non Youtube | Song | [Watch](https://example.com/watch?v=abc) |',
  ].join('\n');

  try {
    const resolution = await resolveHistoricalLaunchFromPlaylistMarkdown([
      firstPlaylistMarkdown,
      secondPlaylistMarkdown,
    ]);

    assert.deepEqual(resolution.videoIds, [...directIds, resolvedUnique]);
    assert.deepEqual(
      resolution.skipped.map((entry) => entry.reason),
      ['duplicate-video-id', 'max-videos-reached'],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('listSavedPlaylistFiles returns only playlist-date markdown files newest first', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'mood-playlist-files-'));
  const playlistsDir = join(tempRoot, 'mood-playlists');
  appendMarkdownRow(join(playlistsDir, 'playlist-2026-03-07.md'), ['Mood', 'Genre', 'Artist', 'Song', 'YouTube Link'], [
    'Calm Focus',
    'Lo-fi',
    'Nujabes',
    'Feather',
    '[Watch](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
  ]);
  appendMarkdownRow(join(playlistsDir, 'playlist-2026-03-09.md'), ['Mood', 'Genre', 'Artist', 'Song', 'YouTube Link'], [
    'Happy Vibes',
    'Pop',
    'Dua Lipa',
    'Levitating',
    '[Watch](https://www.youtube.com/watch?v=ylXk1LBvIqU)',
  ]);
  appendMarkdownRow(join(playlistsDir, 'notes.md'), ['A', 'B', 'C', 'D', 'E'], ['1', '2', '3', '4', '5']);

  const files = listSavedPlaylistFiles(playlistsDir);
  assert.deepEqual(files.map((entry) => entry.filename), ['playlist-2026-03-09.md', 'playlist-2026-03-07.md']);
  assert.deepEqual(files.map((entry) => entry.dateLabel), ['2026-03-09', '2026-03-07']);
});

test('readSavedPlaylistEntries parses escaped markdown cells and flags unresolved link cells', () => {
  const markdown = [
    '| Mood | Genre | Artist | Song | YouTube Link |',
    '| --- | --- | --- | --- | --- |',
    '| Quiet Storm | R&B | Earth \\| Wind & Fire | Reasons | [Watch](https://www.youtube.com/watch?v=dQw4w9WgXcQ) |',
    '| Quiet Storm | Soul | Anita Baker | Sweet Love | https://www.youtube.com/watch?v=ylXk1LBvIqU |',
    '| Quiet Storm | Soul | Unknown | No Link | watch this later |',
    '| broken | row | only |',
  ].join('\n');
  const tempRoot = mkdtempSync(join(tmpdir(), 'mood-playlist-open-'));
  const playlistPath = join(tempRoot, 'mood-playlists', 'playlist-2026-03-09.md');
  appendMarkdownRow(playlistPath, ['Mood', 'Genre', 'Artist', 'Song', 'YouTube Link'], [
    'Seed',
    'Seed',
    'Seed',
    'Seed',
    '[Watch](https://www.youtube.com/watch?v=aaaaaaaaaaa)',
  ]);
  // overwrite with controlled markdown fixture
  writeFileSync(playlistPath, markdown, 'utf-8');

  const entries = readSavedPlaylistEntries(playlistPath);
  assert.equal(entries.length, 4);
  assert.equal(entries[0]?.artist, 'Earth | Wind & Fire');
  assert.equal(entries[0]?.youtubeLink, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(entries[1]?.youtubeLink, 'https://www.youtube.com/watch?v=ylXk1LBvIqU');
  assert.equal(entries[2]?.youtubeLink, null);
  assert.match(entries[2]?.diagnostics ?? '', /Unable to parse stored YouTube link/);
  assert.match(entries[3]?.diagnostics ?? '', /Malformed playlist row/);
});

test('readSavedPlaylistEntries + groupSavedPlaylistSessions recover individual sessions from a daily playlist file', () => {
  const markdown = [
    '| Mood | Genre | Artist | Song | YouTube Link |',
    '| --- | --- | --- | --- | --- |',
    '| Calm Focus | Lo-fi | Nujabes | Feather | [Watch](https://www.youtube.com/watch?v=dQw4w9WgXcQ) |',
    '| Calm Focus | Jazz | Miles Davis | Blue in Green | [Watch](https://www.youtube.com/watch?v=ylXk1LBvIqU) |',
    '',
    '| Mood | Genre | Artist | Song | YouTube Link |',
    '| --- | --- | --- | --- | --- |',
    '| High Energy | Pop | Dua Lipa | Levitating | [Watch](https://www.youtube.com/watch?v=QH2-TGUlwu4) |',
    '| malformed | row | only |',
    '| High Energy | Pop | Unknown | Missing | notalink |',
    '',
    '| Mood | Genre | Artist | Song | YouTube Link |',
    '| --- | --- | --- | --- | --- |',
  ].join('\n');
  const tempRoot = mkdtempSync(join(tmpdir(), 'mood-playlist-sessions-'));
  const playlistPath = join(tempRoot, 'mood-playlists', 'playlist-2026-03-10.md');
  appendMarkdownRow(playlistPath, ['Mood', 'Genre', 'Artist', 'Song', 'YouTube Link'], [
    'Seed',
    'Seed',
    'Seed',
    'Seed',
    '[Watch](https://www.youtube.com/watch?v=aaaaaaaaaaa)',
  ]);
  writeFileSync(playlistPath, markdown, 'utf-8');

  const entries = readSavedPlaylistEntries(playlistPath);
  const sessions = groupSavedPlaylistSessions(entries);

  assert.equal(sessions.length, 4);
  assert.equal(sessions[0]?.entries.length, 2);
  assert.equal(sessions[1]?.entries.length, 1);
  assert.equal(sessions[0]?.mood, 'Calm Focus');
  assert.equal(sessions[1]?.mood, 'High Energy');
  assert.equal(sessions[2]?.mood, 'Unknown Mood');
  assert.equal(sessions[3]?.mood, 'High Energy');
  assert.equal(sessions[2]?.entries[0]?.diagnostics, 'Malformed playlist row (expected 5 columns).');
  assert.match(sessions[3]?.entries[0]?.diagnostics ?? '', /Unable to parse stored YouTube link/);
  assert.equal(entries.length, 5);
});

test('selecting one grouped saved session launches only that session links via resolver semantics (dedupe + cap + skip reasons)', async () => {
  const selectedDirectIds = Array.from({ length: 8 }, (_, i) => `${String(i).padStart(2, '0')}bcdefghijk`.slice(0, 11));
  const selectedResolvedId = 'QH2-TGUlwu4';
  const firstSessionId = 'dQw4w9WgXcQ';
  const overflowId = 'aqz-KE-bpKQ';
  const markdown = [
    '| Mood | Genre | Artist | Song | YouTube Link |',
    '| --- | --- | --- | --- | --- |',
    `| Calm Focus | Lo-fi | First Session | Seed | [Watch](https://www.youtube.com/watch?v=${firstSessionId}) |`,
    '',
    '| Mood | Genre | Artist | Song | YouTube Link |',
    '| --- | --- | --- | --- | --- |',
    ...selectedDirectIds.slice(0, 6).map(
      (id) => `| High Energy | Pop | Artist ${id} | Song ${id} | [Watch](https://www.youtube.com/watch?v=${id}) |`,
    ),
    `| High Energy | Pop | Duplicate | Duplicate | [Watch](https://www.youtube.com/watch?v=${selectedDirectIds[2]}) |`,
    '| High Energy | Pop | Search OK | Search OK | [Watch](https://www.youtube.com/results?search_query=session-good) |',
    '| High Energy | Pop | Search Missing | Search Missing | [Watch](https://www.youtube.com/results?search_query=session-bad) |',
    `| High Energy | Pop | Last In Cap | Last In Cap | [Watch](https://www.youtube.com/watch?v=${selectedDirectIds[6]}) |`,
    `| High Energy | Pop | Overflow | Overflow | [Watch](https://www.youtube.com/watch?v=${overflowId}) |`,
  ].join('\n');
  const tempRoot = mkdtempSync(join(tmpdir(), 'mood-playlist-session-launch-'));
  const playlistPath = join(tempRoot, 'mood-playlists', 'playlist-2026-03-10.md');
  appendMarkdownRow(playlistPath, ['Mood', 'Genre', 'Artist', 'Song', 'YouTube Link'], [
    'Seed',
    'Seed',
    'Seed',
    'Seed',
    '[Watch](https://www.youtube.com/watch?v=aaaaaaaaaaa)',
  ]);
  writeFileSync(playlistPath, markdown, 'utf-8');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: URL | RequestInfo) => {
    const value = String(input);
    if (value.includes('session-good')) {
      return new Response(`<html>..."videoRenderer":{"videoId":"${selectedResolvedId}"}...</html>`, { status: 200 });
    }
    return new Response('<html>no launchable id</html>', { status: 200 });
  }) as typeof fetch;

  try {
    const sessions = groupSavedPlaylistSessions(readSavedPlaylistEntries(playlistPath));
    const selectedSession = sessions[1];
    assert.ok(selectedSession);

    const links = selectedSession.entries.flatMap((entry) => (entry.youtubeLink ? [entry.youtubeLink] : []));
    const resolution = await resolveLaunchVideoIdsFromLinks(links);
    assert.deepEqual(resolution.videoIds, [...selectedDirectIds.slice(0, 6), selectedResolvedId, selectedDirectIds[6] as string]);
    assert.equal(resolution.videoIds.length, MAX_PLAYLIST_SONGS);
    assert.equal(resolution.videoIds.includes(firstSessionId), false);
    assert.deepEqual(
      resolution.skipped.map((entry) => entry.reason),
      ['duplicate-video-id', 'unresolved-search-query', 'max-videos-reached'],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('groupSavedPlaylistSessions creates deterministic contiguous mood sessions with labels', () => {
  const sessions = groupSavedPlaylistSessions([
    {
      mood: 'Calm Focus',
      genre: 'Lo-fi',
      artist: 'A',
      song: 'S1',
      youtubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      rowNumber: 3,
    },
    {
      mood: 'Calm Focus',
      genre: 'Jazz',
      artist: 'B',
      song: 'S2',
      youtubeLink: null,
      rowNumber: 4,
    },
    {
      mood: 'Happy Vibes',
      genre: 'Pop',
      artist: 'C',
      song: 'S3',
      youtubeLink: 'https://www.youtube.com/watch?v=ylXk1LBvIqU',
      rowNumber: 5,
    },
    {
      mood: 'Calm Focus',
      genre: 'Ambient',
      artist: 'D',
      song: 'S4',
      youtubeLink: 'https://www.youtube.com/watch?v=QH2-TGUlwu4',
      rowNumber: 6,
    },
  ]);

  assert.equal(sessions.length, 3);
  assert.equal(sessions[0]?.mood, 'Calm Focus');
  assert.equal(sessions[0]?.startRow, 3);
  assert.equal(sessions[0]?.endRow, 4);
  assert.equal(sessions[0]?.linkCount, 1);
  assert.match(sessions[0]?.label ?? '', /Calm Focus — rows 3-4 \(2 songs, 1 links\)/);
  assert.equal(sessions[1]?.mood, 'Happy Vibes');
  assert.equal(sessions[2]?.mood, 'Calm Focus');
});

test('groupSavedPlaylistSessions normalizes empty mood names to Unknown Mood', () => {
  const sessions = groupSavedPlaylistSessions([
    {
      mood: '  ',
      genre: 'Alt',
      artist: 'A',
      song: 'S1',
      youtubeLink: null,
      rowNumber: 10,
    },
  ]);

  assert.equal(sessions.length, 1);
  assert.equal(sessions[0]?.mood, 'Unknown Mood');
  assert.match(sessions[0]?.label ?? '', /Unknown Mood — rows 10-10 \(1 songs, 0 links\)/);
});

test('chooseArchiveInformedMoodPhrase is deterministic for tie-breaks and open-mood input', () => {
  const archive = [
    { dateTime: '2026-03-07T07:00:00.000Z', rawMood: 'blank', moodPhrase: 'High Energy' },
    { dateTime: '2026-03-07T08:00:00.000Z', rawMood: 'blank', moodPhrase: 'Calm Focus' },
    { dateTime: '2026-03-07T09:00:00.000Z', rawMood: 'blank', moodPhrase: 'High Energy' },
    { dateTime: '2026-03-07T10:00:00.000Z', rawMood: 'blank', moodPhrase: 'Calm Focus' },
    { dateTime: '2026-03-07T11:00:00.000Z', rawMood: 'blank', moodPhrase: 'Calm Focus' },
  ];

  assert.equal(chooseArchiveInformedMoodPhrase('   ', archive), 'Calm Focus');
  assert.equal(chooseArchiveInformedMoodPhrase('I am hyped', archive), 'High Energy');
});

test('buildArchiveMoodSuggestions surfaces recent and popular phrases', () => {
  const suggestions = buildArchiveMoodSuggestions('rainy calm evening', [
    { dateTime: '2026-03-01T00:00:00Z', rawMood: 'rainy and reflective', moodPhrase: 'Rainy Reflection' },
    { dateTime: '2026-03-02T00:00:00Z', rawMood: 'calm focus session', moodPhrase: 'Calm Focus' },
    { dateTime: '2026-03-03T00:00:00Z', rawMood: 'rainy and reflective', moodPhrase: 'Rainy Reflection' },
  ]);

  assert.equal(suggestions.recentMoodPhrases[0], 'Rainy Reflection');
  assert.equal(suggestions.popularMoodPhrases[0]?.phrase, 'Rainy Reflection');
  assert.equal(suggestions.adjacentMoodHints.includes('Rainy Reflection'), true);
});
