import { execFile } from 'node:child_process';
import { ExecuteOption } from './types.js';

/**
 * A low-level API for wrappers for dot commands provided by Graphviz.
 */
export async function executeDot(
  dot: string,
  { format, output, suppressWarnings, dotCommand: cmd = 'dot', childProcessOptions = {} }: ExecuteOption = {},
): Promise<Buffer> {
  const args: string[] = [];
  if (suppressWarnings === true) {
    args.push('-q');
  }
  if (typeof format === 'string') {
    args.push(`-T${format}`);
  }
  if (typeof output === 'string') {
    args.push('-o', output);
  }
  return new Promise((resolve, reject) => {
    const child = execFile(cmd, args, { ...childProcessOptions, encoding: 'buffer' }, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    child.stdin!.write(dot, 'utf8');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    child.stdin!.end();
  });
}
