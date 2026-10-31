import { createCommandArgs } from './create-command-args.js';
import { CommandExecutionError } from './errors.js';
import type { AnyOptions } from './options.js';

/**
 * Whether Windows runs `command` as a batch script: a name ending in `.bat`
 * or `.cmd` (any case), also followed by the dots and spaces Windows strips
 * from a file name (`dot.bat.`, `dot.CMD  `) or by other trailing
 * ASCII whitespace, which Node.js's own check ignores too.
 *
 * Windows starts such a script through `cmd.exe`, which parses the command
 * line again with its own rules, so the arguments would no longer reach the
 * command as they were given. Node.js refuses to start one without a shell
 * (since the fix for CVE-2024-27980), and Deno's handling of their arguments
 * has changed between releases (CVE-2025-61787, CVE-2026-22864).
 */
export function isWindowsCommandScript(command: string): boolean {
  return /\.(?:bat|cmd)$/i.test(command.replace(/[. \t\n\v\f\r]+$/, ''));
}

/**
 * createCommandAndArgs creates a command and an array of arguments, based on the given {@link Options}.
 *
 * @param options Options to create the command and args from.
 * @param windows Whether the command will run on Windows: a batch script
 * (see {@link isWindowsCommandScript}) is then rejected.
 * @returns A tuple containing the command and an array of arguments.
 * @throws {CommandExecutionError} on Windows, when `dotCommand` names a
 * `.bat` or `.cmd` script.
 */
export function createCommandAndArgs(
  options: AnyOptions,
  windows = false,
): [command: string, args: string[]] {
  const command = options.dotCommand ?? 'dot';
  if (
    windows &&
    typeof command === 'string' &&
    isWindowsCommandScript(command)
  ) {
    throw new CommandExecutionError(
      command,
      'MESSAGE:a .bat or .cmd script cannot be run as the Graphviz command on Windows: Windows runs it through cmd.exe, which parses the arguments again. Give the path of dot.exe.',
    );
  }
  return [command, Array.from(createCommandArgs(options))];
}
