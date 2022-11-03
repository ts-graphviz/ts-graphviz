import { createWriteStream } from 'node:fs';
import { Readable, pipeline as _pipeline } from 'node:stream';
import { promisify } from 'node:util';
import { spawn } from 'node:child_process';
import { Options } from '../types.js';
import { BufferStream } from './buffer-stream.js';

/**
 * NOTE:
 * The node:stream/promises standard module is not provided in Node 14.
 * Fix Node 14 to use node:stream/promises after LTS ends.
 */
const pipeline = promisify(_pipeline);

export class DotExecutor {
  constructor(private options: Options = {}) {}

  private get cmd(): string {
    return this.options.dotCommand ?? 'dot';
  }

  private *createArgs() {
    if (this.options.suppressWarnings ?? true) yield '-q';
    yield `-T${this.options.format ?? 'svg'}`;
  }

  private get args(): string[] {
    return Array.from(this.createArgs());
  }

  public async toStream(dot: string): Promise<NodeJS.ReadableStream> {
    const p = spawn(this.cmd, this.args, { stdio: 'pipe' });
    await pipeline(Readable.from([dot]), p.stdin);
    return p.stdout;
  }

  public async toFile(dot: string, filePath: string): Promise<void> {
    const stream = await this.toStream(dot);
    await pipeline(stream, createWriteStream(filePath));
  }

  public async toBuffer(dot: string): Promise<Buffer> {
    const stream = await this.toStream(dot);
    return stream.pipe(new BufferStream()).toBuffer();
  }
}
