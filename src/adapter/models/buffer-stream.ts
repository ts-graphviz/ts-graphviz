/* eslint-disable @typescript-eslint/no-explicit-any */
import { Writable } from 'node:stream';

export class BufferStream extends Writable {
  readonly #chunks: any[] = [];

  _write(chunk: any, _: string, next: (error?: Error | null) => void): void {
    this.#chunks.push(chunk);
    next();
  }

  public toBuffer(): Buffer {
    return Buffer.concat(this.#chunks);
  }
}
