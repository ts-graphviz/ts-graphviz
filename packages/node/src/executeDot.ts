import { file } from 'tmp-promise';
import { close, writeFile, execFile } from './utils';
import { ExecuteOption } from './types';

/**
 * A low-level API for wrappers for dot commands provided by Graphviz.
 */
export async function executeDot(dot: string, options: ExecuteOption = {}): Promise<Buffer> {
  const { fd, path, cleanup } = await file();
  try {
    await writeFile(fd, dot);
    await close(fd);

    const args: string[] = [];
    if (typeof options.format === 'string') {
      args.push(`-T${options.format}`);
    }
    if (typeof options.output === 'string') {
      args.push('-o', options.output);
    }
    args.push(path);
    const cmd = options.dotCommand ?? 'dot';
    const { stdout } = await execFile(cmd, args, {
      encoding: 'buffer',
    });
    return stdout;
  } finally {
    await cleanup();
  }
}
