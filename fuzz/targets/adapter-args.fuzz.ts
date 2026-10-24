/**
 * SM-4: whatever option values an application passes, the argv given to
 * `dot` has exactly one element per option and every element is a flag;
 * option values never add elements or turn into operands (file names).
 */
import { FuzzedDataProvider } from '@jazzer.js/core';
import { createCommandArgs } from '../../packages/adapter/src/create-command-args.js';
import { Finding } from './expect.js';

const LAYOUTS: ('dot' | 'neato' | 'fdp' | 'sfdp' | 'circo' | 'twopi')[] = [
  'dot',
  'neato',
  'fdp',
  'sfdp',
  'circo',
  'twopi',
];

export function fuzz(data: Buffer): void {
  const p = new FuzzedDataProvider(data);
  const attrs = () => {
    const out: Record<string, string | number | boolean> = {};
    const n = p.consumeIntegralInRange(0, 3);
    for (let i = 0; i < n; i++) {
      const key = p.consumeString(12);
      const kind = p.consumeIntegralInRange(0, 2);
      out[key] =
        kind === 0
          ? p.consumeString(24)
          : kind === 1
            ? p.consumeNumber()
            : p.consumeBoolean();
    }
    return out;
  };
  const layout = p.pickValue(LAYOUTS);
  const options = {
    format: p.consumeString(12) as 'svg',
    suppressWarnings: p.consumeBoolean(),
    attributes: { graph: attrs(), node: attrs(), edge: attrs() },
    scale: p.consumeBoolean() ? p.consumeNumber() : undefined,
    library: Array.from({ length: p.consumeIntegralInRange(0, 2) }, () =>
      p.consumeString(16),
    ),
    y: p.consumeBoolean(),
    layout,
    ...(layout === 'neato'
      ? { reduce: p.consumeBoolean(), noop: p.consumeIntegral(2) }
      : {}),
    ...(layout === 'fdp'
      ? {
          grid: p.consumeBoolean(),
          oldAttractive: p.consumeBoolean(),
          iterations: p.consumeIntegral(2),
        }
      : {}),
  };

  const args = [...createCommandArgs(options as never)];
  for (const arg of args) {
    if (typeof arg !== 'string' || !arg.startsWith('-') || arg.length < 2) {
      throw new Finding(`argv element is not a flag: ${JSON.stringify(arg)}`);
    }
  }
  const attributeCount =
    Object.keys(options.attributes.graph).length +
    Object.keys(options.attributes.node).length +
    Object.keys(options.attributes.edge).length;
  const flagged = args.filter((a) => /^-[GNE]/.test(a)).length;
  if (flagged !== attributeCount) {
    throw new Finding(
      `${attributeCount} attributes produced ${flagged} -G/-N/-E arguments: ${JSON.stringify(args)}`,
    );
  }
}
