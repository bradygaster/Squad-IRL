/**
 * Build & distribution module exports
 */

export * from './bundle.js';
export * from './npm-package.js';
export * from './github-dist.js';
export * from './ci-pipeline.js';
export * from './versioning.js';
export * from './install-migration.js';
export {
  type ReleaseChannel as BuildReleaseChannel,
  type ReleaseConfig,
  type ReleaseArtifact,
  type ReleaseManifest,
  type ReleaseValidationError,
  type ReleaseChecklistItem,
  computeSha256,
  buildArtifact,
  createRelease,
  validateRelease,
  generateReleaseNotes,
  getReleaseChecklist,
} from './release.js';
