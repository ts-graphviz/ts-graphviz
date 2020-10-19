import { file } from 'tmp-promise';
import { close, writeFile, execFile } from './utils';
import { ExecuteOption } from './types';

/**
 * A low-level API for wrappers for dot commands provided by Graphviz.
 */
export async function executeDot(
  dot: string,
  { format, output, dotCommand: cmd = 'dot', childProcessOptions = {} }: ExecuteOption = {},
): Promise<Buffer> {
  const { fd, path, cleanup } = await file();
  try {
    await writeFile(fd, dot);
    await close(fd);

    const args: string[] = [];
    if (typeof format === 'string') {
      args.push(`-T${format}`);
    }
    if (typeof output === 'string') {
      args.push('-o', output);
    }
    args.push(path);
    const { stdout } = await execFile(cmd, args, { ...childProcessOptions, encoding: 'buffer' });
    return stdout;
  } finally {
    await cleanup();
  }
}
