import {
  ClusterStatementASTNode,
  CommentASTNode,
  createElement,
  EdgeTargetASTNode,
  NodeASTNode,
  SubgraphASTNode,
  AttributeListASTNode,
  GraphASTNode,
  AttributeASTNode,
  DotASTNode,
} from '../ast/index.js';
import { AttributeKey, Attribute } from '../attribute/index.js';

import { GraphBaseModel, EdgeModel, NodeModel, SubgraphModel, AttributeListModel, GraphModel } from './types.js';
import { isForwardRefNode, isNodeModel } from './utils.js';

export class ASTConverter {
  protected onAttribute<K extends AttributeKey>(key: K, value: Attribute<K>): AttributeASTNode {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const isHTMLLike = /^<.+>$/ms.test(trimmed);
      if (isHTMLLike) {
        return createElement(
          'Attribute',
          {
            key: createElement('Literal', { value: key, quoted: false }, []),
            value: createElement('Literal', { value: trimmed.slice(1, trimmed.length - 1), quoted: 'html' }, []),
          },
          [],
        );
      } else {
        return createElement(
          'Attribute',
          {
            key: createElement('Literal', { value: key, quoted: false }, []),
            value: createElement('Literal', { value: value, quoted: true }, []),
          },
          [],
        );
      }
    }
    return createElement(
      'Attribute',
      {
        key: createElement('Literal', { value: key, quoted: false }, []),
        value: createElement('Literal', { value: String(value), quoted: false }, []),
      },
      [],
    );
  }

  protected onAttributeList(model: AttributeListModel): AttributeListASTNode {
    return createElement(
      'AttributeList',
      {
        kind: model.$$kind,
      },
      model.values.map(([key, value]) => this.onAttribute(key, value)),
    );
  }
  protected onEdge(model: EdgeModel) {
    return createElement(
      'Edge',
      {
        targets: model.targets.map((target) => {
          if (isNodeModel(target)) {
            return createElement(
              'NodeRef',
              {
                id: createElement(
                  'Literal',
                  {
                    value: target.id,
                    quoted: true,
                  },
                  [],
                ),
              },
              [],
            );
          } else if (isForwardRefNode(target)) {
            return createElement(
              'NodeRef',
              {
                id: createElement(
                  'Literal',
                  {
                    value: target.id,
                    quoted: true,
                  },
                  [],
                ),
                port: target.port
                  ? createElement(
                      'Literal',
                      {
                        value: target.port,
                        quoted: true,
                      },
                      [],
                    )
                  : undefined,
                compass: target.compass
                  ? createElement(
                      'Literal',
                      {
                        value: target.compass,
                        quoted: true,
                      },
                      [],
                    )
                  : undefined,
              },
              [],
            );
          }
        }) as [from: EdgeTargetASTNode, to: EdgeTargetASTNode, ...rest: EdgeTargetASTNode[]],
      },
      [
        ...(model.attributes.comment ? [this.comment(model.attributes.comment)] : []),
        ...model.attributes.values.map(([key, value]) => this.onAttribute(key, value)),
      ],
    );
  }

  protected onGraph(model: GraphModel): GraphASTNode {
    return createElement(
      'Graph',
      {
        directed: model.directed,
        strict: model.strict,
        id: model.id
          ? createElement(
              'Literal',
              {
                value: model.id,
                quoted: true,
              },
              [],
            )
          : undefined,
      },
      Array.from(this.createClusterChildren(model)),
    );
  }

  protected onNode(model: NodeModel): NodeASTNode {
    return createElement(
      'Node',
      {
        id: createElement(
          'Literal',
          {
            value: model.id,
            quoted: true,
          },
          [],
        ),
      },
      [
        ...(model.attributes.comment ? [this.comment(model.attributes.comment)] : []),
        ...model.attributes.values.map(([key, value]) => this.onAttribute(key, value)),
      ],
    );
  }

  protected onSubgraph(model: SubgraphModel): SubgraphASTNode {
    return createElement(
      'Subgraph',
      {
        id: model.id
          ? createElement(
              'Literal',
              {
                value: model.id,
                quoted: true,
              },
              [],
            )
          : undefined,
      },
      Array.from(this.createClusterChildren(model)),
    );
  }

  protected comment(value: string): CommentASTNode {
    return createElement(
      'Comment',
      {
        kind: 'Slash',
        value: value,
      },
      [],
    );
  }

  protected *createClusterChildren(cluster: GraphBaseModel): Generator<ClusterStatementASTNode> {
    for (const [key, value] of cluster.values) {
      yield this.onAttribute(key, value);
    }
    for (const attrs of Object.values(cluster.attributes)) {
      if (attrs.size > 0) {
        if (attrs.comment) {
          yield this.comment(attrs.comment);
        }
        yield this.onAttributeList(attrs);
      }
    }
    for (const node of cluster.nodes) {
      if (node.comment) {
        yield this.comment(node.comment);
      }
      yield this.onNode(node);
    }
    for (const subgraph of cluster.subgraphs) {
      if (subgraph.comment) {
        yield this.comment(subgraph.comment);
      }
      yield this.onSubgraph(subgraph);
    }
    for (const edge of cluster.edges) {
      if (edge.comment) {
        yield this.comment(edge.comment);
      }
      yield this.onEdge(edge);
    }
  }

  public toAST(model: GraphModel): DotASTNode {
    return createElement('Dot', {}, [...(model.comment ? [this.comment(model.comment)] : []), this.onGraph(model)]);
  }
}

export function convertToAST(graph: GraphModel): DotASTNode {
  const converter = new ASTConverter();
  return converter.toAST(graph);
}
