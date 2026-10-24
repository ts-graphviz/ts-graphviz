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

  // The exact argv the options mean, built independently: one flag per
  // option, values verbatim inside their flag, nothing dropped or repeated.
  const value = (v: string | number | boolean) => (v === true ? '' : `=${v}`);
  const expected: string[] = [
    ...(options.suppressWarnings ? ['-q'] : []),
    `-T${options.format}`,
    ...Object.entries(options.attributes.graph).map(
      ([k, v]) => `-G${k}${value(v)}`,
    ),
    ...Object.entries(options.attributes.node).map(
      ([k, v]) => `-N${k}${value(v)}`,
    ),
    ...Object.entries(options.attributes.edge).map(
      ([k, v]) => `-E${k}${value(v)}`,
    ),
    ...(typeof options.scale === 'number' && !Number.isNaN(options.scale)
      ? [`-s${options.scale}`]
      : []),
    ...options.library.map((lib) => `-l${lib}`),
    ...(options.y ? ['-y'] : []),
    `-K${layout}`,
  ];
  if (layout === 'neato') {
    const o = options as typeof options & { reduce: boolean; noop: number };
    if (o.reduce) expected.push('-x');
    expected.push(`-n${o.noop}`);
  }
  if (layout === 'fdp') {
    const o = options as typeof options & {
      grid: boolean;
      oldAttractive: boolean;
      iterations: number;
    };
    if (o.grid === false) expected.push('-Lg');
    if (o.oldAttractive === true) expected.push('-LO');
    expected.push(`-Ln${o.iterations}`);
  }
  if (JSON.stringify(args) !== JSON.stringify(expected)) {
    throw new Finding(
      `argv differs from the options:\n${JSON.stringify(args)}\n${JSON.stringify(expected)}`,
    );
  }
}
