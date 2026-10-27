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
    (code >= 0x2066 && code <= 0x2069)
  );
}

function escapeCharacter(code: number): string {
  return code <= 0xff
    ? `\\x${code.toString(16).toUpperCase().padStart(2, '0')}`
    : `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
}

/**
 * `text` with the characters of {@link isUnsafe} escaped (as `\xNN` / `\uNNNN`),
 * cut to at most `max` characters; a cut is marked at the end with how many
 * characters of `text` were left out.
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
    out += `… (${text.length - index} more characters)`;
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
 */
export class TailBuffer {
  #chunks: Uint8Array[] = [];
  #size = 0;
  constructor(private readonly max: number = MAX_STDERR_SIZE) {}
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
