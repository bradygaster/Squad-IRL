/**
 * History split utility — port from beta CLI
 * Separates portable knowledge from project-specific data
 */

/**
 * Split history into portable knowledge and project learnings
 */
export function splitHistory(history: string, sourceProject: string): string {
  const lines = history.split('\n');
  const portable: string[] = [];
  const projectLearnings: string[] = [];

  // Sections that are project-specific by nature
  const projectSectionPatterns = [
    /^##\s*key file paths/i,
    /^##\s*sprint/i,
    /^##\s*pr\s*#/i,
    /^##\s*file system/i,
    /^##\s*session/i,
    /^###\s*key file paths/i,
    /^###\s*sprint/i,
    /^###\s*pr\s*#/i,
    /^###\s*file system/i,
    /^###\s*session/i,
  ];

  // Sections that are portable by nature
  const portableSectionPatterns = [
    /^##\s*learnings/i,
    /^##\s*portable knowledge/i,
    /^###\s*runtime architecture/i,
    /^###\s*windows compatibility/i,
    /^###\s*critical paths/i,
    /^###\s*forwardability/i,
    /^##\s*team updates/i,
  ];

  let inProjectSection = false;

  for (const line of lines) {
    // Check if this line starts a new section
    if (/^#{1,3}\s/.test(line)) {
      const isProjectSection = projectSectionPatterns.some(p => p.test(line));
      const isPortableSection = portableSectionPatterns.some(p => p.test(line));

      if (isProjectSection) {
        inProjectSection = true;
      } else if (isPortableSection) {
        inProjectSection = false;
      }
    }

    if (inProjectSection) {
      projectLearnings.push(line);
    } else {
      portable.push(line);
    }
  }

  let result = '';
  if (portable.length > 0) {
    result += portable.join('\n');
  }
  if (projectLearnings.length > 0) {
    result += `\n\n## Project Learnings (from import — ${sourceProject})\n\n`;
    result += projectLearnings.join('\n');
  }
  return result;
}
