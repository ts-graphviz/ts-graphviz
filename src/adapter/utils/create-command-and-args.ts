import { Layout, Options } from '../types/index.js';
import { createCommandArgs } from './create-command-args.js';

/**
 * createCommandAndArgs creates a command and an array of arguments, based on the given {@link Options}.
 *
 * @param options Options to create the command and args from.
 * @returns A tuple containing the command and an array of arguments.
 */
export function createCommandAndArgs<T extends Layout>(
  options: Options<T>,
): [command: string, args: string[]] {
  return [options.dotCommand ?? 'dot', Array.from(createCommandArgs(options))];
}
