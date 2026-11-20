import type {
  EmptySchema,
  GraphAttributeKey,
  GraphAttributesObject,
  RootGraphModel,
  RootGraphOptions,
  Schema,
} from '@ts-graphviz/common';
import { ownOptions } from '@ts-graphviz/common';
import {
  invalidArguments,
  isBoolean,
  isRecord,
  isString,
  readArguments,
} from './arguments.js';
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
   * The arguments are read by position: an id, then the attributes, then
   * the options, each of which may be left out
   * (`new Digraph('G', { label: 'x' }, { strict: true })`). A call that fits
   * none of the signatures throws a `TypeError` with code
   * `TSG_ERR_INVALID_ARGUMENTS`.
   */
  constructor(
    id?: string,
    attributes?: GraphAttributesObject<S>,
    options?: RootGraphOptions,
  );

  constructor(attributes: GraphAttributesObject<S>, options?: RootGraphOptions);

  /**
   * @deprecated Pass `{ strict }` after the attributes:
   * `new Digraph(id, attributes, { strict })`. Removed in v5.
   */
  constructor(
    id: string | undefined,
    strict: boolean,
    attributes?: GraphAttributesObject<S>,
  );

  /**
   * @deprecated Pass `{ strict }` after the attributes:
   * `new Digraph(attributes, { strict })`. Removed in v5.
   */
  constructor(strict: boolean, attributes?: GraphAttributesObject<S>);

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
    let id: string | undefined;
    let strict: boolean | undefined;
    let attributes: GraphAttributesObject<S> | undefined;
    if (isBoolean(args[0]) || isBoolean(args[1])) {
      // The deprecated form: the strict flag before the attributes.
      [id, strict, attributes] = readArguments(name, args, [
        isString,
        isBoolean,
        isRecord,
      ]) as [string | undefined, boolean, GraphAttributesObject<S> | undefined];
    } else {
      let options: RootGraphOptions | undefined;
      [id, attributes, options] = readArguments(name, args, [
        isString,
        isRecord,
        isRecord,
      ]) as [
        string | undefined,
        GraphAttributesObject<S> | undefined,
        RootGraphOptions | undefined,
      ];
      const given = ownOptions(options);
      strict = given.strict;
      // Only the options there are: attributes put there would be lost.
      if (
        (strict !== undefined && typeof strict !== 'boolean') ||
        Object.keys(given).some((key) => key !== 'strict')
      ) {
        throw invalidArguments(name(), args);
      }
    }
    this.id = id;
    this.strict = strict ?? false;
    if (attributes !== undefined) {
      this.setAttributes(attributes);
    }
  }
}
