import { type CodedError, withCode } from '@ts-graphviz/common';

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

export function outputLimitExceeded(
  command: string,
  limit: number,
): Omit<RangeError, 'code'> & CodedError<'TSG_ERR_OUTPUT_LIMIT_EXCEEDED'> {
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
 *
 * The bytes are kept in one buffer of `max` bytes (allocated on the first
 * write), so memory stays bounded whatever the chunk sizes, and each byte
 * written is copied at most once.
 */
export class TailBuffer {
  #buffer: Uint8Array | undefined;
  /** Where the next byte goes in `#buffer`. */
  #position = 0;
  /** How many bytes of `#buffer` are in use (at most `max`). */
  #length = 0;
  /** Whether older bytes have been dropped. */
  #truncated = false;
  constructor(private readonly max: number = MAX_STDERR_SIZE) {}
  push(chunk: Uint8Array): void {
    const { max } = this;
    if (chunk.byteLength === 0) return;
    if (max === 0) {
      this.#truncated = true;
      return;
    }
    this.#buffer ??= new Uint8Array(max);
    const buffer = this.#buffer;
    if (this.#length + chunk.byteLength > max) this.#truncated = true;
    if (chunk.byteLength >= max) {
      buffer.set(chunk.subarray(chunk.byteLength - max));
      this.#position = 0;
      this.#length = max;
      return;
    }
    const first = Math.min(chunk.byteLength, max - this.#position);
    buffer.set(chunk.subarray(0, first), this.#position);
    buffer.set(chunk.subarray(first), 0);
    this.#position = (this.#position + chunk.byteLength) % max;
    this.#length = Math.min(this.#length + chunk.byteLength, max);
  }
  /**
   * The kept bytes decoded as UTF-8. When older bytes were dropped, the
   * continuation bytes of a character cut at the start are left out rather
   * than decoded as U+FFFD.
   */
  toString(): string {
    const buffer = this.#buffer;
    if (buffer === undefined) return '';
    let bytes: Uint8Array;
    if (this.#length < this.max) {
      bytes = buffer.subarray(0, this.#length);
    } else {
      bytes = new Uint8Array(this.max);
      bytes.set(buffer.subarray(this.#position));
      bytes.set(buffer.subarray(0, this.#position), this.max - this.#position);
    }
    let start = 0;
    if (this.#truncated) {
      // At most three continuation bytes (10xxxxxx) follow a lead byte.
      while (
        start < 3 &&
        start < bytes.byteLength &&
        (bytes[start] & 0xc0) === 0x80
      ) {
        start++;
      }
    }
    return new TextDecoder().decode(bytes.subarray(start));
  }
}
