import type { CommentKind } from '../../../../types.js';

/**
 * Escape comment content to prevent comment injection attacks.
 *
 * @remarks
 * This function prevents malicious content from breaking out of comment context:
 * - Block comments: Breaks up asterisk-slash sequences to prevent early comment termination
 * - All comments: Strips null bytes that could cause parsing issues
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
  // Remove null bytes from all comment types
  let escaped = value.replace(/\0/g, '');

  // For block comments, break up asterisk-slash sequences to prevent comment injection
  if (kind === 'Block') {
    // Replace asterisk-slash with asterisk + zero-width space + slash (U+200B)
    // This prevents early comment termination while preserving visual appearance
    escaped = escaped.replace(/\*\//g, '*\u200B/');
  }

  return escaped;
}
