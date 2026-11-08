import type {
  AnyModelTypes,
  GraphAttributeKey,
  GraphAttributesObject,
  ModelTypes,
  RootGraphModel,
  SchemaOf,
} from '@ts-graphviz/common';
import { GraphBase } from './GraphBase.js';

/**
 * Base class representing a root graph(digraph, graph).
 * @group Models
 */
export abstract class RootGraph<M extends AnyModelTypes = ModelTypes>
  extends GraphBase<'Graph', GraphAttributeKey, M>
  implements RootGraphModel<M>
{
  public get $$type(): 'Graph' {
    return 'Graph';
  }
  /**
   * The graph's name.
   * @deprecated Read `graphId` (in the DOT DSL, `id` is Graphviz's `id`
   * attribute). Removed in v5.
   */
  public override readonly id?: string;
  /** The graph's name: its ID in DOT (`G` in `digraph G`). */
  public get graphId(): string | undefined {
    return this.id;
  }
  public abstract readonly directed: boolean;
  public strict: boolean;

  constructor(id?: string, attributes?: GraphAttributesObject<SchemaOf<M>>);

  constructor(
    id?: string,
    strict?: boolean,
    attributes?: GraphAttributesObject<SchemaOf<M>>,
  );

  constructor(
    strict?: boolean,
    attributes?: GraphAttributesObject<SchemaOf<M>>,
  );

  constructor(attributes?: GraphAttributesObject<SchemaOf<M>>);

  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    this.strict =
      args.find((arg): arg is boolean => typeof arg === 'boolean') ?? false;
    const attributes = args.find(
      (arg): arg is GraphAttributesObject<SchemaOf<M>> =>
        typeof arg === 'object' && arg !== null,
    );
    if (attributes !== undefined) {
      this.setAttributes(attributes);
    }
  }
}
