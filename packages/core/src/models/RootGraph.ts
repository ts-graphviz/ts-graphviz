import type {
  GraphAttributeKey,
  GraphAttributesObject,
  ModelTypes,
  RootGraphModel,
} from '@ts-graphviz/common';
import { GraphBase } from './GraphBase.js';

/**
 * Base class representing a root graph(digraph, graph).
 * @group Models
 */
export abstract class RootGraph<M extends ModelTypes = ModelTypes>
  extends GraphBase<'Graph', GraphAttributeKey, M>
  implements RootGraphModel<M>
{
  public get $$type(): 'Graph' {
    return 'Graph';
  }
  public readonly id?: string;
  public abstract readonly directed: boolean;
  public strict: boolean;

  constructor(id?: string, attributes?: GraphAttributesObject);

  constructor(
    id?: string,
    strict?: boolean,
    attributes?: GraphAttributesObject,
  );

  constructor(strict?: boolean, attributes?: GraphAttributesObject);

  constructor(attributes?: GraphAttributesObject);

  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    this.strict =
      args.find((arg): arg is boolean => typeof arg === 'boolean') ?? false;
    const attributes = args.find(
      (arg): arg is GraphAttributesObject =>
        typeof arg === 'object' && arg !== null,
    );
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }
}
