import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CommandExecutionError } from './errors.js';
import { excerpt, outputLimitExceeded } from './limits.js';

const ESC = String.fromCharCode(0x1b);
const CSI = String.fromCharCode(0x9b);
const NUL = String.fromCharCode(0);
const RLO = String.fromCharCode(0x202e);
const LS = String.fromCharCode(0x2028);
const LONE = String.fromCharCode(0xd800);

/**
 * The characters of `message` that a terminal or log could act on: C0
 * controls other than tab and line feed, DEL, C1 controls, lone
 * surrogates, U+061C, U+200E/F, U+2028..U+202E and U+2066..U+2069.
 */
function unsafeIn(message: string): string[] {
  return Array.from(message).filter((char) => {
    const code = char.codePointAt(0) as number;
    return (
      (code < 0x20 && char !== '\t' && char !== '\n') ||
      (code >= 0x7f && code <= 0x9f) ||
      (code >= 0xd800 && code <= 0xdfff) ||
      [0x061c, 0x200e, 0x200f].includes(code) ||
      (code >= 0x2028 && code <= 0x202e) ||
      (code >= 0x2066 && code <= 0x2069)
    );
  });
}

/**
 * One character of text a command could write: often one to escape (a C0
 * or C1 control, a bidirectional or line separator character, a lone
 * surrogate), otherwise ASCII or any code point.
 */
const char = fc.oneof(
  fc
    .oneof(
      fc.integer({ min: 0, max: 0x1f }),
      fc.integer({ min: 0x7f, max: 0x9f }),
      fc.constantFrom(0x061c, 0x200e, 0x200f, 0x2028, 0x202e, 0x2066, 0x2069),
      fc.integer({ min: 0xd800, max: 0xdfff }),
    )
    .map((code) => String.fromCharCode(code)),
  fc.string({ unit: 'grapheme-ascii', minLength: 1, maxLength: 1 }),
  fc.string({ unit: 'binary', minLength: 1, maxLength: 1 }),
);

describe('CommandExecutionError message', { tags: ['SM-4'] }, () => {
  it('keeps at most 1024 characters of the detail, and the whole stderr in exit', () => {
    const stderr = 'x'.repeat(64 * 1024);
    const error = new CommandExecutionError(
      'dot',
      `CODE: 1\nSIGNAL: null\nMESSAGE: ${stderr}`,
      { code: 1, signal: null, stderr },
    );
    expect(error.message.length).toBeLessThan(1200);
    expect(error.message).toMatch(
      /^Command "dot" failed\.\nCODE: 1\nSIGNAL: null\nMESSAGE: x+… \(\d+ more characters\)$/,
    );
    expect(error.exit?.stderr).toBe(stderr);
    expect(error.code).toBe('TSG_ERR_COMMAND_FAILED');
  });

  it('escapes control and formatting characters, keeping tabs and line feeds', () => {
    const stderr = `Error:\t${ESC}[31mred${ESC}]0;title\u0007\r${CSI}2J${NUL}${RLO}txt.exe${LS}${LONE}\nnext`;
    const error = new CommandExecutionError('dot', `MESSAGE: ${stderr}`, {
      code: 1,
      signal: null,
      stderr,
    });
    expect(error.message).toBe(
      'Command "dot" failed.\nMESSAGE: Error:\t\\x1B[31mred\\x1B]0;title\\x07\\x0D\\x9B2J\\x00\\u202Etxt.exe\\u2028\\uD800\nnext',
    );
    expect(unsafeIn(error.message)).toStrictEqual([]);
    // exit.stderr is what the command wrote
    expect(error.exit?.stderr).toBe(stderr);
  });

  it('escapes and cuts the command', () => {
    const command = `/opt/${ESC}[2J${'d'.repeat(1000)}`;
    const error = new CommandExecutionError(command, 'MESSAGE: failed');
    expect(error.command).toBe(command);
    expect(error.message).toMatch(
      /^Command "\/opt\/\\x1B\[2Jd+… \(\d+ more characters\)" failed\.\nMESSAGE: failed$/,
    );
    expect(error.message.length).toBeLessThan(330);
  });

  it('escapes and cuts the command in the output limit error', () => {
    const command = `${ESC}[2J${'d'.repeat(1000)}`;
    const error = outputLimitExceeded(command, 10);
    expect(unsafeIn(error.message)).toStrictEqual([]);
    expect(error.message.length).toBeLessThan(360);
    expect(error.code).toBe('TSG_ERR_OUTPUT_LIMIT_EXCEEDED');
  });

  it('is bounded and safe to print for any detail', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ unit: char, maxLength: 20 }),
          fc.string({ unit: char, maxLength: 1500, size: 'max' }),
        ),
        fc.oneof(
          fc.string({ unit: char, maxLength: 20 }),
          fc.string({ unit: char, maxLength: 300, size: 'max' }),
        ),
        (detail, command) => {
          const { message } = new CommandExecutionError(command, detail);
          expect(unsafeIn(message)).toStrictEqual([]);
          // 256 + 1024 characters and two cut markers at most
          expect(message.length).toBeLessThanOrEqual(1280 + 2 * 40 + 20);
        },
      ),
      { numRuns: 500 },
    );
  });
});

describe('excerpt', { tags: ['SM-4'] }, () => {
  it('is the escaped text, cut at a whole character or escape', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: char, maxLength: 60 }),
        fc.integer({ min: 0, max: 80 }),
        (text, max) => {
          const full = excerpt(text, Number.POSITIVE_INFINITY);
          const cut = excerpt(text, max);
          if (full.length <= max) {
            expect(cut).toBe(full);
          } else {
            const [, kept, more] =
              /^([\s\S]*)… \((\d+) more characters\)$/.exec(
                cut,
              ) as RegExpExecArray;
            expect(kept.length).toBeLessThanOrEqual(max);
            expect(full.startsWith(kept)).toBe(true);
            // what is left out starts with a whole character or escape
            expect(
              excerpt(
                text.slice(text.length - Number(more)),
                Number.POSITIVE_INFINITY,
              ),
            ).toBe(full.slice(kept.length));
          }
        },
      ),
      { numRuns: 1000 },
    );
  });

  it('leaves text without such characters as it is', () => {
    expect(excerpt('Error: line 1\tnear "é 𝄞"\n', 100)).toBe(
      'Error: line 1\tnear "é 𝄞"\n',
    );
  });
});
