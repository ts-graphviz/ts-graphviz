/**
 * Run a command with an allowlisted environment and a fresh temporary
 * directory: for tests that start real processes where the container of
 * `pnpm test:sandbox` cannot run them (the E2E jobs on Windows, macOS and
 * Linux, and Deno).
 *
 *   node scripts/clean-env.ts <command> [arguments...]
 *
 * Only the variables listed below reach the command (no tokens or other
 * secrets of the caller), and TMPDIR, TEMP and TMP point at a new directory
 * that is removed afterwards. Nothing else is restricted: network, file
 * system and privileges are the caller's.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const allowed = [
  // what any program needs
  'PATH',
  'HOME',
  'LANG',
  'LC_ALL',
  'TZ',
  'TERM',
  // what Windows programs (and cmd.exe, which runs pnpm's shim) need
  'PATHEXT',
  'SystemRoot',
  'SystemDrive',
  'windir',
  'ComSpec',
  'USERPROFILE',
  'APPDATA',
  'LOCALAPPDATA',
  'ProgramData',
  'ProgramFiles',
  'ProgramFiles(x86)',
  'CommonProgramFiles',
  'NUMBER_OF_PROCESSORS',
  'PROCESSOR_ARCHITECTURE',
  // test switches
  'CI',
  'E2E_RUNTIME',
  'FC_NUM_RUNS',
  'FC_SEED',
  'FORCE_COLOR',
  'NO_COLOR',
];

const [command, ...args] = process.argv.slice(2);
if (command === undefined) {
  console.error('usage: node scripts/clean-env.ts <command> [arguments...]');
  process.exit(2);
}

// On Windows the command runs through cmd.exe (pnpm is a `.cmd` shim),
// which would read these characters as shell syntax: refuse them rather
// than quote them.
const shell = process.platform === 'win32';
const unsafe = [command, ...args].find((arg) => /[\s"&|<>^%!()]/.test(arg));
if (shell && unsafe !== undefined) {
  console.error(
    `clean-env: ${JSON.stringify(unsafe)} would be read as shell syntax on Windows`,
  );
  process.exit(2);
}

const temp = mkdtempSync(join(tmpdir(), 'ts-graphviz-tests-'));
const env: Record<string, string> = { TMPDIR: temp, TEMP: temp, TMP: temp };
for (const name of allowed) {
  // process.env is case-insensitive on Windows (Path, PATH)
  const value = process.env[name];
  if (value !== undefined) env[name] = value;
}

let status: number;
try {
  const result = spawnSync(command, args, {
    env,
    stdio: 'inherit',
    shell,
  });
  if (result.error) throw result.error;
  status = result.status ?? 1;
} finally {
  rmSync(temp, { recursive: true, force: true, maxRetries: 5 });
}
process.exit(status);
