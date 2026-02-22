/**
 * M4-2: npm bundling & registry publication
 * Generates package.json content and validates npm publication readiness.
 */

export interface NpmPackageConfig {
  name: string;
  version: string;
  description: string;
  exports: Record<string, string | Record<string, string>>;
  bin?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: Record<string, string>;
}

export interface PackageJsonOutput {
  name: string;
  version: string;
  description: string;
  type: string;
  main: string;
  types: string;
  exports: Record<string, unknown>;
  bin?: Record<string, string>;
  files: string[];
  peerDependencies?: Record<string, string>;
  engines: Record<string, string>;
  license: string;
  repository: { type: string; url: string };
  keywords: string[];
}

export interface PackageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const DEFAULT_FILES = [
  'dist/',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
];

const DEFAULT_EXPORTS: Record<string, Record<string, string>> = {
  '.': {
    import: './dist/index.js',
    types: './dist/index.d.ts',
  },
  './config': {
    import: './dist/config/index.js',
    types: './dist/config/index.d.ts',
  },
  './agents': {
    import: './dist/agents/onboarding.js',
    types: './dist/agents/onboarding.d.ts',
  },
  './skills': {
    import: './dist/skills/index.js',
    types: './dist/skills/index.d.ts',
  },
  './runtime': {
    import: './dist/runtime/config.js',
    types: './dist/runtime/config.d.ts',
  },
};

/**
 * Generate package.json content suitable for npm publication.
 */
export function generatePackageJson(config: NpmPackageConfig): PackageJsonOutput {
  const exports: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config.exports)) {
    if (typeof value === 'string') {
      exports[key] = { import: value, types: value.replace(/\.js$/, '.d.ts') };
    } else {
      exports[key] = { ...value };
    }
  }

  return {
    name: config.name,
    version: config.version,
    description: config.description,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    exports,
    ...(config.bin && Object.keys(config.bin).length > 0 ? { bin: { ...config.bin } } : {}),
    files: [...DEFAULT_FILES],
    ...(config.peerDependencies && Object.keys(config.peerDependencies).length > 0
      ? { peerDependencies: { ...config.peerDependencies } }
      : {}),
    engines: config.engines ? { ...config.engines } : { node: '>=20.0.0' },
    license: 'MIT',
    repository: { type: 'git', url: 'https://github.com/bradygaster/squad.git' },
    keywords: ['copilot', 'multi-agent', 'squad', 'sdk'],
  };
}

/**
 * Validate a package.json object for npm publication readiness.
 */
export function validatePackageJson(pkg: Record<string, unknown>): PackageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pkg.name || typeof pkg.name !== 'string') {
    errors.push('Missing or invalid "name" field');
  } else {
    if (!/^(@[a-z0-9-]+\/)?[a-z0-9._-]+$/.test(pkg.name)) {
      errors.push(`Invalid package name: ${pkg.name}`);
    }
  }

  if (!pkg.version || typeof pkg.version !== 'string') {
    errors.push('Missing or invalid "version" field');
  } else {
    if (!/^\d+\.\d+\.\d+/.test(pkg.version)) {
      errors.push(`Invalid semver version: ${pkg.version}`);
    }
  }

  if (!pkg.description || typeof pkg.description !== 'string') {
    warnings.push('Missing "description" field');
  }

  if (!pkg.license || typeof pkg.license !== 'string') {
    warnings.push('Missing "license" field');
  }

  if (!pkg.exports || typeof pkg.exports !== 'object') {
    errors.push('Missing "exports" map — required for ESM packages');
  } else {
    const exports = pkg.exports as Record<string, unknown>;
    if (!exports['.']) {
      errors.push('Exports map missing "." entry point');
    }
  }

  if (pkg.type !== 'module') {
    warnings.push('"type" should be "module" for ESM packages');
  }

  if (!pkg.files || !Array.isArray(pkg.files) || pkg.files.length === 0) {
    warnings.push('Missing "files" field — all files will be published');
  }

  if (!pkg.engines || typeof pkg.engines !== 'object') {
    warnings.push('Missing "engines" field — specify Node.js version requirement');
  }

  if (!pkg.repository || typeof pkg.repository !== 'object') {
    warnings.push('Missing "repository" field');
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Return the files array for package.json publication.
 */
export function getPublishFiles(): string[] {
  return [...DEFAULT_FILES];
}

/**
 * Return the default ESM exports map for the SDK.
 */
export function getDefaultExports(): Record<string, Record<string, string>> {
  return JSON.parse(JSON.stringify(DEFAULT_EXPORTS));
}
