import { type CodedError, withCode } from '@ts-graphviz/common';

/** Default for `maxOutputSize`: 128 MiB. */
const DEFAULT_MAX_OUTPUT_SIZE = 128 * 1024 * 1024;

/** How much of the command's stderr is kept for error messages. */
const MAX_STDERR_SIZE = 64 * 1024;

/**
 * Whether a character is escaped in a message: C0 controls other than tab
 * and line feed, DEL, C1 controls, lone surrogates, the line and paragraph
 * separators, and the bidirectional formatting characters. They could move
 * the cursor, change colors, rewrite earlier lines or reorder text when the
 * message is shown in a terminal or a log.
 */
function isUnsafe(code: number): boolean {
  return (
    (code < 0x20 && code !== 0x09 && code !== 0x0a) ||
    (code >= 0x7f && code <= 0x9f) ||
    (code >= 0xd800 && code <= 0xdfff) ||
    code === 0x061c ||
    code === 0x200e ||
    code === 0x200f ||
    (code >= 0x2028 && code <= 0x202e) ||
    (code >= 0x2066 && code <= 0x206f)
  );
}

function escapeCharacter(code: number): string {
  return code <= 0xff
    ? `\\x${code.toString(16).toUpperCase().padStart(2, '0')}`
    : `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
}

/**
 * `text` with the characters of {@link isUnsafe} escaped (as `\xNN` / `\uNNNN`),
 * cut to at most `max` UTF-16 code units without splitting a character or
 * an escape; a cut is marked at the end with how many characters (code
 * points) of `text` were left out.
 */
export function excerpt(text: string, max: number): string {
  let out = '';
  let index = 0;
  for (const char of text) {
    const code = char.codePointAt(0) as number;
    const piece = isUnsafe(code) ? escapeCharacter(code) : char;
    if (out.length + piece.length > max) break;
    out += piece;
    index += char.length;
  }
  if (index < text.length) {
    let left = 0;
    for (const _ of text.slice(index)) left++;
    out += `… (${left} more characters)`;
  }
  return out;
}

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
      `Command "${excerpt(command, 256)}" wrote more than ${limit} bytes (maxOutputSize) and was stopped.`,
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
 * written is copied at most once: `toString` decodes it where it is.
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
    const { max } = this;
    // Oldest byte first. Once full, the kept bytes wrap around the end of the
    // buffer, and the two parts are decoded in turn rather than copied into
    // one: a character split between them is joined by the decoder.
    const full = this.#length === max;
    const start = full ? this.#position : 0;
    const parts = full
      ? [buffer.subarray(start), buffer.subarray(0, start)]
      : [buffer.subarray(0, this.#length)];
    let skip = 0;
    if (this.#truncated) {
      // At most three continuation bytes (10xxxxxx) follow a lead byte.
      while (
        skip < 3 &&
        skip < this.#length &&
        (buffer[(start + skip) % max] & 0xc0) === 0x80
      ) {
        skip++;
      }
    }
    const decoder = new TextDecoder();
    let text = '';
    for (const part of parts) {
      const drop = Math.min(skip, part.byteLength);
      skip -= drop;
      text += decoder.decode(part.subarray(drop), { stream: true });
    }
    return text + decoder.decode();
  }
}
