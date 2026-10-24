/**
 * The Graphviz command could not be started or exited with an error.
 *
 * An `Error` with `code` `TSG_ERR_COMMAND_FAILED`.
 * @group Errors
 */
export class CommandExecutionError extends Error {
  override readonly name = 'CommandExecutionError';
  readonly code = 'TSG_ERR_COMMAND_FAILED';

  /**
   * @param command - The command that was run.
   * @param detail - Why it failed.
   * @param exit - Exit code and signal, when the process did start.
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
    super(`Command "${command}" failed.\n${detail}`, options);
  }
}
