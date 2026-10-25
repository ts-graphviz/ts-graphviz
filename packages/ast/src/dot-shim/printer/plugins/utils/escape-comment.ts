import { withCode } from '@ts-graphviz/common';
import type { CommentKind } from '../../../../types.js';

/**
 * Zero-width space character (U+200B) used to break up comment-ending sequences.
 * This invisible character prevents `* /` from being interpreted as a comment delimiter
 * while maintaining visual appearance.
 */
const ZERO_WIDTH_SPACE = '​';

/**
 * Escape comment content to prevent comment injection attacks.
 *
 * @remarks
 * This function prevents malicious content from breaking out of comment context:
 * - Block comments: Breaks up asterisk-slash sequences to prevent early comment termination
 * - All comments: a NUL character is rejected (`RangeError`, code
 *   `TSG_ERR_NUL_CHARACTER`), as in any other DOT text: Graphviz stops reading
 *   at a NUL, so it cannot be written, and dropping it would change the text.
 *
 * According to C/C++ and DOT language specifications, block comments cannot be nested
 * and there is no escape sequence for the closing delimiter within comments.
 * The standard workaround is to insert a zero-width space or break the sequence.
 *
 * @param value - The comment content to escape
 * @param kind - The kind of comment (Block, Macro, or Slash)
 * @returns The escaped comment content
 */
export function escapeComment(value: string, kind: CommentKind): string {
  if (value.includes('\0')) {
    throw withCode(
      new RangeError('A comment must not contain a null character'),
      'TSG_ERR_NUL_CHARACTER',
    );
  }

  // For block comments, break up asterisk-slash sequences to prevent comment injection
  if (kind === 'Block') {
    // Replace asterisk-slash with asterisk + zero-width space + slash
    // This prevents early comment termination while preserving visual appearance
    return value.replace(/\*\//g, `*${ZERO_WIDTH_SPACE}/`);
  }

  return value;
}
