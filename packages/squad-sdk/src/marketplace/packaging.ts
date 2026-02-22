/**
 * Packaging utilities — prepare Squad projects for marketplace distribution
 * Issue #108 (M4-8)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { MarketplaceManifest } from './index.js';

// --- PackageResult ---

export interface PackageResult {
  outputPath: string;
  size: number;
  files: string[];
  warnings: string[];
}

// --- Package validation ---

export interface MarketplacePackageValidationResult {
  valid: boolean;
  errors: string[];
  missingFiles: string[];
}

const REQUIRED_FILES = ['manifest.json', 'README.md'];
const REQUIRED_PATHS = ['icon', 'dist/'];

/**
 * Package a project directory for marketplace distribution.
 */
export function packageForMarketplace(
  projectDir: string,
  manifest: MarketplaceManifest,
): PackageResult {
  const warnings: string[] = [];
  const files: string[] = [];

  if (!fs.existsSync(projectDir)) {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  // Write manifest.json
  const manifestPath = path.join(projectDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  files.push('manifest.json');

  // Collect README
  const readmePath = path.join(projectDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    files.push('README.md');
  } else {
    warnings.push('README.md not found — marketplace listings require a README');
  }

  // Collect icon
  const iconPath = path.join(projectDir, manifest.icon);
  if (fs.existsSync(iconPath)) {
    files.push(manifest.icon);
  } else {
    warnings.push(`Icon file not found: ${manifest.icon}`);
  }

  // Collect dist/
  const distDir = path.join(projectDir, 'dist');
  if (fs.existsSync(distDir) && fs.statSync(distDir).isDirectory()) {
    const distFiles = collectFiles(distDir, 'dist');
    files.push(...distFiles);
  } else {
    warnings.push('dist/ directory not found — run build before packaging');
  }

  // Calculate total size
  let totalSize = 0;
  for (const file of files) {
    const fullPath = path.join(projectDir, file);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      totalSize += fs.statSync(fullPath).size;
    }
  }

  const outputPath = path.join(projectDir, `${manifest.name}-${manifest.version}.squad-pkg`);

  return {
    outputPath,
    size: totalSize,
    files,
    warnings,
  };
}

/**
 * Validate that a package directory contains all required files.
 */
export function validatePackageContents(packagePath: string): MarketplacePackageValidationResult {
  const errors: string[] = [];
  const missingFiles: string[] = [];

  if (!fs.existsSync(packagePath)) {
    return {
      valid: false,
      errors: [`Package path not found: ${packagePath}`],
      missingFiles: [],
    };
  }

  for (const file of REQUIRED_FILES) {
    const filePath = path.join(packagePath, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
      errors.push(`Required file missing: ${file}`);
    }
  }

  // Check dist/ directory exists
  const distDir = path.join(packagePath, 'dist');
  if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
    missingFiles.push('dist/');
    errors.push('Required directory missing: dist/');
  }

  // Check icon — look for any common image file
  const iconCandidates = ['icon.png', 'icon.svg', 'icon.jpg'];
  const hasIcon = iconCandidates.some((ic) =>
    fs.existsSync(path.join(packagePath, ic)),
  );
  if (!hasIcon) {
    missingFiles.push('icon');
    errors.push('Required file missing: icon (icon.png, icon.svg, or icon.jpg)');
  }

  return {
    valid: errors.length === 0,
    errors,
    missingFiles,
  };
}

// --- Internal helpers ---

function collectFiles(dir: string, prefix: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(path.join(dir, entry.name), rel));
    } else {
      results.push(rel);
    }
  }
  return results;
}
