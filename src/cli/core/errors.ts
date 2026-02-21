/**
 * Error handling utilities — zero dependencies
 */

import { RED, RESET } from './output.js';

/**
 * Print error message and exit with code 1
 */
export function fatal(msg: string): never {
  console.error(`${RED}✗${RESET} ${msg}`);
  process.exit(1);
}
