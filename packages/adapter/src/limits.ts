import { withCode } from '@ts-graphviz/common';

/** Default for `maxOutputSize`: 128 MiB. */
const DEFAULT_MAX_OUTPUT_SIZE = 128 * 1024 * 1024;

/** How much of the command's stderr is kept for error messages. */
const MAX_STDERR_SIZE = 64 * 1024;

/** The effective output limit for the options; `0` means no limit. */
export function outputLimit(options: { maxOutputSize?: number }): number {
  const limit = options.maxOutputSize ?? DEFAULT_MAX_OUTPUT_SIZE;
  if (!Number.isFinite(limit) || limit < 0) {
    throw withCode(
      new RangeError(
        `maxOutputSize must be a non-negative finite number: ${limit}`,
      ),
      'TSG_ERR_OUTPUT_LIMIT_EXCEEDED',
    );
  }
  return limit;
}

export function outputLimitExceeded(command: string, limit: number) {
  return withCode(
    new RangeError(
      `Command "${command}" wrote more than ${limit} bytes (maxOutputSize) and was stopped.`,
    ),
    'TSG_ERR_OUTPUT_LIMIT_EXCEEDED',
  );
}

/**
 * Keeps the last `max` bytes written to it, for the stderr of a failed
 * command, so a command that floods stderr cannot exhaust memory.
 */
export class TailBuffer {
  #chunks: Uint8Array[] = [];
  #size = 0;
  constructor(private readonly max = MAX_STDERR_SIZE) {}
  push(chunk: Uint8Array): void {
    this.#chunks.push(chunk);
    this.#size += chunk.byteLength;
    while (this.#size > this.max && this.#chunks.length > 1) {
      const first = this.#chunks.shift() as Uint8Array;
      this.#size -= first.byteLength;
    }
  }
  toString(): string {
    const joined = new Uint8Array(this.#size);
    let offset = 0;
    for (const chunk of this.#chunks) {
      joined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const start = Math.max(0, joined.byteLength - this.max);
    return new TextDecoder().decode(joined.subarray(start));
  }
}
