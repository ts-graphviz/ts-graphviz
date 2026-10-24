/**
 * SM-1 / SM-2 through the model: for any input, `fromDot` returns a model
 * or throws a coded error; a model printed with `toDot` reads back to text
 * that prints identically (the printer is idempotent through the model).
 */
import { fromDot, type RootGraphModel, toDot } from 'ts-graphviz';
import { expectCodedError, Finding } from './expect.js';

export function fuzz(data: Buffer): void {
  const source = data.toString('utf8');
  let model: RootGraphModel;
  try {
    model = fromDot(source);
  } catch (e) {
    expectCodedError(e, 'fromDot');
    return;
  }
  let once: string;
  try {
    once = toDot(model);
  } catch (e) {
    // toDot may refuse values the model cannot write (e.g. a port with
    // ':'), but only with a coded error.
    expectCodedError(e, 'toDot');
    return;
  }
  let twice: string;
  try {
    twice = toDot(fromDot(once));
  } catch (e) {
    throw new Finding(
      `toDot output does not read back:\n${once}\n${String(e)}`,
      { cause: e },
    );
  }
  if (twice !== once) {
    throw new Finding(`toDot is not idempotent:\n${once}\n---\n${twice}`);
  }
}
