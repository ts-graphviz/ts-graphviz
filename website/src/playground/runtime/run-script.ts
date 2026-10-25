import { evaluate, type ModuleMap } from './evaluate';
import type { RunError, RunResult } from './protocol';
import { resultToDot } from './to-dot';
import { transpile } from './transpile';

/**
 * Transpile, evaluate and render a Playground script to DOT.
 * Never throws: failures come back as `{ ok: false, error }`.
 */
export function runScript(source: string, modules: ModuleMap): RunResult {
  try {
    return { ok: true, dot: resultToDot(evaluate(transpile(source), modules)) };
  } catch (error) {
    return { ok: false, error: toRunError(error) };
  }
}

export function toRunError(error: unknown): RunError {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return { name: 'Error', message: String(error) };
}
