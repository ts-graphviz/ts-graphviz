/**
 * @module ts-graphviz/executor
 * @beta
 */
import { createWriteStream } from 'node:fs';
import { Readable, pipeline as _pipeline } from 'node:stream';
import { promisify } from 'node:util';
import { spawn } from 'node:child_process';

export type Format = 'png' | 'svg' | 'json' | 'jpg' | 'pdf' | 'xdot' | 'plain' | 'dot_json';

export interface Options {
  format?: Format;
  suppressWarnings?: boolean;
  dotCommand?: string;
}

function commandBuilder({ dotCommand = 'dot', suppressWarnings = true, format = 'svg' }: Options = {}): [
  command: string,
  args: string[],
] {
  const args = [
    ...(function* () {
      if (suppressWarnings) yield '-q';
      yield `-T${format}`;
    })(),
  ];
  return [dotCommand, args];
}

/**
 * NOTE:
 * The node:stream/promises standard module is not provided in Node 14.
 * Fix Node 14 to use node:stream/promises after LTS ends.
 */
const pipeline = promisify(_pipeline);

export async function toStream(dot: string, options?: Options): Promise<NodeJS.ReadableStream> {
  const [command, args] = commandBuilder(options);
  const p = spawn(command, args, { stdio: 'pipe' });
  await pipeline(Readable.from([dot]), p.stdin);
  return p.stdout;
}

export async function toFile(dot: string, filePath: string, options?: Options): Promise<void> {
  const stream = await toStream(dot, options);
  await pipeline(stream, createWriteStream(filePath));
}
