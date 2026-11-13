import type {
  EmptySchema,
  GraphAttributeKey,
  GraphAttributesObject,
  RootGraphModel,
  Schema,
} from '@ts-graphviz/common';
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

  constructor(id?: string, attributes?: GraphAttributesObject<S>);

  constructor(
    id?: string,
    strict?: boolean,
    attributes?: GraphAttributesObject<S>,
  );

  constructor(strict?: boolean, attributes?: GraphAttributesObject<S>);

  constructor(attributes?: GraphAttributesObject<S>);

  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    this.strict =
      args.find((arg): arg is boolean => typeof arg === 'boolean') ?? false;
    const attributes = args.find(
      (arg): arg is GraphAttributesObject<S> =>
        typeof arg === 'object' && arg !== null,
    );
    if (attributes !== undefined) {
      this.setAttributes(attributes);
    }
  }
}
