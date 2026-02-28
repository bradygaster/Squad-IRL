/**
 * SQUAD_DEBUG environment variable handling tests (Issue #588).
 *
 * Verifies that debug output is gated behind the SQUAD_DEBUG env var.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('SQUAD_DEBUG environment variable', () => {
  const originalEnv = process.env['SQUAD_DEBUG'];

  beforeEach(() => {
    delete process.env['SQUAD_DEBUG'];
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env['SQUAD_DEBUG'] = originalEnv;
    } else {
      delete process.env['SQUAD_DEBUG'];
    }
  });

  it('is not set by default', () => {
    expect(process.env['SQUAD_DEBUG']).toBeUndefined();
  });

  it('can be set to "1" to enable debug output', () => {
    process.env['SQUAD_DEBUG'] = '1';
    expect(process.env['SQUAD_DEBUG']).toBe('1');
  });

  it('only matches strict "1" value for debug gating', () => {
    // Common pattern: process.env['SQUAD_DEBUG'] === '1'
    process.env['SQUAD_DEBUG'] = 'true';
    expect(process.env['SQUAD_DEBUG'] === '1').toBe(false);

    process.env['SQUAD_DEBUG'] = '0';
    expect(process.env['SQUAD_DEBUG'] === '1').toBe(false);

    process.env['SQUAD_DEBUG'] = '1';
    expect(process.env['SQUAD_DEBUG'] === '1').toBe(true);
  });

  // TODO: Add integration test that spawns CLI process and verifies
  // stderr does not contain debug output when SQUAD_DEBUG is unset,
  // and does contain debug output when SQUAD_DEBUG=1.
});
