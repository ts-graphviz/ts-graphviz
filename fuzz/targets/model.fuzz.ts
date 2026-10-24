/**
 * SM-1 / SM-2 through the model: for any input, `fromDot` returns a model
 * or throws a coded error; a model printed with `toDot` reads back to the
 * same model (nothing is lost or changed by printing), and printing is
 * idempotent.
 */
import { fromDot, type RootGraphModel, toDot } from 'ts-graphviz';
import { summarize } from '../../test/properties/summarize.js';
import { expectCodedError, expectEqual, Finding } from './expect.js';

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
  let reread: RootGraphModel;
  try {
    reread = fromDot(once);
  } catch (e) {
    throw new Finding(
      `toDot output does not read back:\n${once}\n${String(e)}`,
      { cause: e },
    );
  }
  // Semantic check: printing lost or changed nothing in the model.
  // The printer writes comment lines with its own line ending, so a CRLF
  // inside a comment comes back as "\n" (documented normalization).
  const normalized = (m: RootGraphModel) =>
    JSON.parse(
      JSON.stringify(summarize(m), (key, value) =>
        key === 'comment' && typeof value === 'string'
          ? value.replace(/\r\n/g, '\n')
          : value,
      ),
    );
  expectEqual(
    normalized(reread),
    normalized(model),
    `the model read back from toDot output and the original model\n${once}\n---`,
  );
  const twice = toDot(reread);
  if (twice !== once) {
    throw new Finding(`toDot is not idempotent:\n${once}\n---\n${twice}`);
  }
}
