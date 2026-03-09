# Mood Playlist Builder

Create a playlist based on how you feel, refine the songs interactively, save everything in markdown, and instantly open a YouTube playlist.

## What This Sample Does

### Creating a New Playlist
1. Prompts for your raw mood text.
2. Uses Squad SDK + model output to generate a 1–3 word mood phrase, adjacent mood options, and up to 8 songs.
   - Shows live pipeline progress while you wait:
     - `interpret mood`
     - `curate songs`
     - `apply mood logic`
3. Validates model output with strict schema guardrails; if invalid/unavailable, falls back to deterministic local logic.
   - Prints completion/fallback status so you can tell when deterministic logic was used.
4. Lets you confirm/edit the list with interactive commands:
   - `done` — accept current song list and move on
   - `remove 2,5,8` — remove songs by index number
   - `add Artist - Song` — add a custom song (up to 8 total)
   - `reset` — restore default suggestions for the mood phrase
5. Looks up each song on YouTube and stores the link.
6. Appends rows to a daily playlist file: `mood-playlists/playlist-YYYY-MM-DD.md`.
7. Appends your raw mood + summarized mood + timestamp to `mood-archive.md`.
8. Reads prior archive entries on startup and uses that history as context for adjacent mood suggestions.

### Opening a Saved Playlist
9. At startup, choose to open a previously saved daily playlist.
10. Prompts with a numbered list of available `mood-playlists/playlist-YYYY-MM-DD.md` files.
11. After selecting a file, choose whether to:
    - Open the **whole playlist file** (all songs/sessions in it)
    - Open **one playlist session** (contiguous rows sharing the same `Mood` value)

### Launching to YouTube
12. Resolves YouTube links: converts non-watch `results?search_query=...` URLs to canonical `watch?v=` video IDs (when possible).
13. Builds a YouTube playlist URL and opens it in your browser: `https://www.youtube.com/watch_videos?video_ids=...`
14. **Respects an 8-song launch cap** to keep playlists focused. If more than 8 valid songs exist, the first 8 are used.
15. **Prints skip diagnostics** for any links that cannot be launched, including:
    - `unresolved-search-query`: A YouTube search link that couldn't be resolved to a video ID (shown in yellow)
    - `invalid-link`: A malformed or non-YouTube URL
    - `non-youtube-link`: A link from another source
    - `missing-video-id`: A YouTube URL without a valid video ID
    - `duplicate-video-id`: A song that's already in the playlist
    - `max-videos-reached`: Valid links beyond the 8-song cap

## Squad Orchestration (Role-Based)

The mood pipeline orchestration is configured in `squad.config.ts` and enforced by `squad-orchestration.ts`.

- **`mood-interpreter`**: mood interpretation / summarization
- **`song-curator`**: song matching / curation
- **`mood-logic-guardian`**: history-aware mood logic + fallback policy

At runtime (`index.ts`), dynamic generation executes the explicit `moodPipeline` stages from `squad.config.ts` in order:
1) `interpret-mood` → 2) `curate-songs` → 3) `apply-mood-logic`.

To modify orchestration, update agent charters/routing/stage definitions in `squad.config.ts`; runtime stage routing follows that config directly.

Builds the dynamic system prompt directly from `squad.config.ts`, so mood interpretation, music curation, and mood-logic responsibilities cannot be bypassed silently.

## Usage

```bash
npm install
npm start
```

### At Startup

Choose an action:

- **`1`** — Create a new playlist
  - Describe your mood in plain English
  - Get AI-generated mood phrase + adjacent alternatives + 8 song suggestions
  - Edit the list with interactive commands
  - Save to `mood-playlists/playlist-YYYY-MM-DD.md` and `mood-archive.md`
  - Open the playlist in YouTube

- **`2`** — Open a previous saved playlist
  - Select a date from the list
  - Choose to open the **whole file** or a **single session** (same mood, contiguous rows)
  - View skip diagnostics for any unresolved links
  - Open launchable songs in YouTube (up to 8)

### Interactive Commands (New Playlist Only)

When creating a new playlist, after seeing song suggestions, you can:

- **`done`** — Accept the current song list and proceed
- **`remove 2,5,8`** — Remove songs by their index number
- **`add Artist - Song`** — Add a custom song (format: `add Artist Name - Song Title`)
- **`reset`** — Restore the original AI-generated suggestions for this mood phrase

## Dynamic Mode Requirements

Dynamic generation uses the Squad SDK and your local Copilot CLI session.
During dynamic generation startup, Node warning noise from spawned Squad subprocesses is suppressed so stage progress and fallback status lines stay readable.

1. Install dependencies:

```bash
npm install
```

2. Ensure Copilot CLI is installed and authenticated:

```bash
npm install -g @github/copilot
copilot auth login
```

If dynamic generation fails (connection issue, invalid model JSON, etc.), the app prints a warning and automatically falls back to deterministic local mood/song generation so the workflow still completes.

## Files Created at Runtime

- `mood-playlists/playlist-YYYY-MM-DD.md`
  - Table columns: `Mood | Genre | Artist | Song | YouTube Link`
- `mood-archive.md`
  - Table columns: `DateTime | Raw Mood | Mood Phrase`

Both are appended over time so each run adds history without overwriting previous entries.

## Testing

```bash
npm run typecheck
npm test
```
