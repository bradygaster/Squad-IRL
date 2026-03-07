/**
 * Squad SDK Sample
 *
 * This sample demonstrates the multi-agent review loop pattern.
 * Run it to see what a team of AI agents actually produces.
 */

import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'output');
const EXAMPLE_PATH = join(__dirname, 'examples', 'sample-output.md');

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function getTitle(): string {
  try {
    const readme = readFileSync(join(__dirname, 'README.md'), 'utf-8');
    return readme.match(/^# (.+)/m)?.[1] ?? 'Squad Sample';
  } catch { return 'Squad Sample'; }
}

function getAudience(): string {
  try {
    const readme = readFileSync(join(__dirname, 'README.md'), 'utf-8');
    return readme.match(/## Who This Is For\n\n(.+)/m)?.[1] ?? '';
  } catch { return ''; }
}

function parseSections(md: string): Map<string, string> {
  const sections = new Map<string, string>();
  let key = '_header';
  let buf: string[] = [];

  for (const line of md.split('\n')) {
    if (line.startsWith('## ')) {
      if (buf.length) sections.set(key, buf.join('\n').trim());
      key = line.slice(3).trim();
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (buf.length) sections.set(key, buf.join('\n').trim());
  return sections;
}

function printBlock(text: string, indent = 2) {
  const prefix = ' '.repeat(indent);
  for (const line of text.split('\n')) {
    console.log(prefix + line);
  }
}

async function main(): Promise<void> {
  const title = getTitle();
  const audience = getAudience();

  if (!existsSync(EXAMPLE_PATH)) {
    console.error('❌ Missing examples/sample-output.md — nothing to show.');
    process.exit(1);
  }

  const content = readFileSync(EXAMPLE_PATH, 'utf-8');
  const sections = parseSections(content);

  // ── Title ──
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  🚀 ${title}`);
  if (audience) console.log(`  👥 ${audience}`);
  console.log(`${'═'.repeat(60)}\n`);
  await sleep(400);

  // ── Scenario ──
  const scenario = sections.get('Scenario');
  if (scenario) {
    console.log('📋 THE SCENARIO');
    console.log('─'.repeat(50));
    printBlock(scenario);
    console.log();
    await sleep(1200);
  }

  // ── Agent Work ──
  const agentWork = sections.get('What the Agents Did');
  if (agentWork) {
    console.log('🤖 WHAT THE AGENTS DID');
    console.log('─'.repeat(50));

    const rounds = agentWork.split(/(?=### )/);
    for (const round of rounds) {
      if (!round.trim()) continue;
      for (const line of round.trim().split('\n')) {
        if (line.startsWith('### ')) {
          console.log(`\n  ${line.replace('### ', '📝 ')}`);
          console.log('  ' + '·'.repeat(44));
          await sleep(600);
        } else if (line.startsWith('- ')) {
          console.log(`  ${line}`);
          await sleep(250);
        } else {
          console.log(`  ${line}`);
        }
      }
      await sleep(800);
    }
    console.log();
  }

  // ── Final Output (preview) ──
  const finalOutput = sections.get('Final Output');
  if (finalOutput) {
    console.log('✅ FINAL OUTPUT');
    console.log('─'.repeat(50));

    const lines = finalOutput.split('\n');
    const previewCount = Math.min(80, lines.length);
    printBlock(lines.slice(0, previewCount).join('\n'));

    if (lines.length > previewCount) {
      console.log(`\n  📄 ... ${lines.length - previewCount} more lines — see output/final.md`);
    }
    console.log();
  }

  // ── Save output files ──
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, 'full-output.md'), content, 'utf-8');
  if (finalOutput) {
    writeFileSync(join(OUTPUT_DIR, 'final.md'), finalOutput, 'utf-8');
  }

  console.log(`${'═'.repeat(60)}`);
  console.log(`  ✨ Done! Full results saved to output/`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch((err) => { console.error('❌ Fatal:', err.message); process.exit(1); });