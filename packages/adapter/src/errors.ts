import { excerpt } from './limits.js';

/** At most this many characters of the command are put in a message. */
const MAX_MESSAGE_COMMAND_LENGTH = 256;

/** At most this many characters of the detail (stderr excerpt) are put in a message. */
const MAX_MESSAGE_DETAIL_LENGTH = 1024;

/**
 * The Graphviz command could not be started or exited with an error.
 *
 * An `Error` with `code` `TSG_ERR_COMMAND_FAILED`.
 *
 * The `message` is bounded: it holds at most 256 characters of the command
 * and at most 1024 characters of the detail (the exit status and the start
 * of the kept stderr), with control characters, line and paragraph
 * separators and bidirectional formatting characters escaped as `\xNN` /
 * `\uNNNN`. Tabs and line feeds are kept. The full kept stderr is in
 * `exit.stderr`.
 *
 * The message and `exit.stderr` come from Graphviz and can contain file
 * paths, parts of the DOT source (names, attribute values, the token near a
 * syntax error) and, in `exit.stderr`, any bytes the command wrote. Log
 * them for the application's operators; do not show them to end users
 * verbatim.
 * @group Errors
 */
export class CommandExecutionError extends Error {
  override readonly name = 'CommandExecutionError';
  readonly code = 'TSG_ERR_COMMAND_FAILED';

  /**
   * @param command - The command that was run.
   * @param detail - Why it failed. It is escaped and cut for the message.
   * @param exit - Exit code and signal, when the process did start, and
   * the command's stderr: its last 64 KiB, decoded as UTF-8, unescaped. It
   * can contain file paths, parts of the DOT source and control
   * characters; do not show it to end users verbatim.
   * @param options - `cause` for the underlying error, if any.
   */
  constructor(
    public readonly command: string,
    detail: string,
    public readonly exit?: {
      code: number | null;
      signal: string | null;
      stderr: string;
    },
    options?: ErrorOptions,
  ) {
    super(
      `Command "${excerpt(command, MAX_MESSAGE_COMMAND_LENGTH)}" failed.\n${excerpt(detail, MAX_MESSAGE_DETAIL_LENGTH)}`,
      options,
    );
  }
}
