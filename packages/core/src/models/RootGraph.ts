import type {
  EmptySchema,
  GraphAttributeKey,
  RootGraphModel,
  RootGraphOptions,
  Schema,
} from '@ts-graphviz/common';
import {
  invalidArguments,
  ownOptions,
  readArguments,
} from '@ts-graphviz/common';
import { isRecord, isString } from './arguments.js';
import { GraphBase } from './GraphBase.js';

/**
 * Base class representing a root graph(digraph, graph).
 * @group Models
 */
export abstract class RootGraph<S extends Schema = EmptySchema>
  extends GraphBase<'Graph', GraphAttributeKey, S>
  implements RootGraphModel<S>
{
  public get $$type(): 'Graph' {
    return 'Graph';
  }
  public readonly id?: string;
  public abstract readonly directed: boolean;
  public strict: boolean;

  /**
   * The arguments are read by position: an id, then the options, either of
   * which may be left out (`new Digraph('G', { strict: true })`). A graph
   * takes no attributes here: as in DOT, they are statements of its body
   * (`setAttribute`, `addAttributeAssignment`). A call that fits neither
   * signature (3.x's attributes argument or `strict` flag included) throws
   * a `TypeError` with code `TSG_ERR_INVALID_ARGUMENTS`; an empty object
   * there is empty options, so 3.x's `new Digraph('G', {})` still runs.
   */
  constructor(id?: string, options?: RootGraphOptions);

  constructor(options: RootGraphOptions);

  constructor(...args: unknown[]) {
    super();
    // A literal name, as a class name does not survive minification. Read
    // only for an error: the subclass is not initialized yet, so its getter
    // may fail.
    const name = () => {
      try {
        return (this as { directed: boolean }).directed
          ? 'new Digraph()'
          : 'new Graph()';
      } catch {
        return 'the root graph constructor';
      }
    };
    const [id, options] = readArguments(name, args, [isString, isRecord]) as [
      string | undefined,
      RootGraphOptions | undefined,
    ];
    const given = ownOptions(options);
    const strict = given.strict;
    // Only the options there are: attributes put there would be lost.
    if (
      (strict !== undefined && typeof strict !== 'boolean') ||
      Object.keys(given).some((key) => key !== 'strict')
    ) {
      throw invalidArguments(name(), args);
    }
    this.id = id;
    this.strict = strict ?? false;
  }
}
