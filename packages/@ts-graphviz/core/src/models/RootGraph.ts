import { GraphAttributeKey, GraphAttributesObject, RootGraphModel } from '@ts-graphviz/common';
import { GraphBase } from './GraphBase.js';

/**
 * Base class representing a root graph(digraph, graph).
 * @group Models
 */
export class RootGraph extends GraphBase<GraphAttributeKey> implements RootGraphModel {
  public readonly id?: string;
  public strict: boolean;

  constructor(id?: string, attributes?: GraphAttributesObject);

  constructor(id?: string, strict?: boolean, attributes?: GraphAttributesObject);

  constructor(strict?: boolean, attributes?: GraphAttributesObject);

  constructor(attributes?: GraphAttributesObject);

  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    this.strict = args.find((arg): arg is boolean => typeof arg === 'boolean') ?? false;
    const attributes = args.find((arg): arg is GraphAttributesObject => typeof arg === 'object' && arg !== null);
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }
}
