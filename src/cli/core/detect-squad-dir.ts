/**
 * Squad directory detection — zero dependencies
 */

import fs from 'node:fs';
import path from 'node:path';

export interface SquadDirInfo {
  path: string;
  name: '.squad' | '.ai-team';
  isLegacy: boolean;
}

/**
 * Detect squad directory — .squad/ first, fall back to .ai-team/
 */
export function detectSquadDir(dest: string): SquadDirInfo {
  const squadDir = path.join(dest, '.squad');
  const aiTeamDir = path.join(dest, '.ai-team');
  
  if (fs.existsSync(squadDir)) {
    return { path: squadDir, name: '.squad', isLegacy: false };
  }
  if (fs.existsSync(aiTeamDir)) {
    return { path: aiTeamDir, name: '.ai-team', isLegacy: true };
  }
  // Default for new installations
  return { path: squadDir, name: '.squad', isLegacy: false };
}
