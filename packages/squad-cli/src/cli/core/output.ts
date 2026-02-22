/**
 * Color and emoji output utilities — zero dependencies
 */

// ANSI color codes
export const GREEN = '\x1b[32m';
export const RED = '\x1b[31m';
export const YELLOW = '\x1b[33m';
export const DIM = '\x1b[2m';
export const BOLD = '\x1b[1m';
export const RESET = '\x1b[0m';

/**
 * Print success message with green checkmark
 */
export function success(msg: string): void {
  console.log(`${GREEN}✓${RESET} ${msg}`);
}

/**
 * Print error message with red cross
 */
export function error(msg: string): void {
  console.error(`${RED}✗${RESET} ${msg}`);
}

/**
 * Print warning message with yellow warning sign
 */
export function warn(msg: string): void {
  console.log(`${YELLOW}⚠️${RESET} ${msg}`);
}

/**
 * Print info message
 */
export function info(msg: string): void {
  console.log(msg);
}

/**
 * Print dimmed text
 */
export function dim(msg: string): void {
  console.log(`${DIM}${msg}${RESET}`);
}

/**
 * Print bold text
 */
export function bold(msg: string): void {
  console.log(`${BOLD}${msg}${RESET}`);
}
