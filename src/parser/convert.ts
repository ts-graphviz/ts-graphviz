import {
  Graph,
  Subgraph,
  Node,
  Edge,
  HasComment,
  EdgeTarget,
  EdgeTargetTuple,
  GraphBaseModel,
} from '../model/index.js';
import {
  CommentASTNode,
  EdgeASTNode,
  FileRange,
  ClusterStatementASTNode,
  AttributeASTNode,
  DotASTNode,
  GraphASTNode,
  SubgraphASTNode,
  NodeASTNode,
} from '../ast/index.js';

class CommentHolder {
  public comment: CommentASTNode | null = null;

  public set(comment: CommentASTNode): void {
    this.comment = comment;
  }

  public reset(): void {
    this.comment = null;
  }

  public apply(model: HasComment, location: FileRange): void {
    if (this.comment?.kind === 'Block') {
      if (this.comment?.location?.end.line === location.start.line - 1) {
        model.comment = this.comment.value;
      }
    } else if (this.comment?.location?.end.line === location.start.line) {
      model.comment = this.comment.value;
    }
    this.reset();
  }
}

function convertToEdgeTargetTuple(edge: EdgeASTNode): EdgeTargetTuple {
  // eslint-disable-next-line array-callback-return, consistent-return
  return edge.targets.map((t): EdgeTarget => {
    switch (t.type) {
      case 'NodeRef':
        return { id: t.id.value, port: t.port?.value, compass: t.compass?.value };
      case 'NodeRefGroup':
        return t.children.map((r) => ({ id: r.id.value, port: r.port?.value, compass: r.compass?.value }));
    }
  }) as EdgeTargetTuple;
}

function applyStatements(cluster: GraphBaseModel, statements: ClusterStatementASTNode[]): void {
  const commentHolder = new CommentHolder();
  for (const stmt of statements) {
    switch (stmt.type) {
      case 'Subgraph': {
        const subgraph = stmt.id ? cluster.subgraph(stmt.id.value) : cluster.subgraph();
        applyStatements(subgraph, stmt.children);
        if (stmt.location) {
          commentHolder.apply(subgraph, stmt.location);
        }
        break;
      }
      case 'Attribute':
        cluster.set(stmt.key.value, stmt.value.value);
        commentHolder.reset();
        break;
      case 'Node':
        if (stmt.location) {
          commentHolder.apply(
            cluster.node(
              stmt.id.value,
              stmt.children.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
            ),
            stmt.location,
          );
        }
        break;
      case 'Edge':
        if (stmt.location) {
          commentHolder.apply(
            cluster.edge(
              convertToEdgeTargetTuple(stmt),
              stmt.children.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
            ),
            stmt.location,
          );
        }
        break;
      case 'AttributeList': {
        const attrs: { [key: string]: string } = stmt.children
          .filter<AttributeASTNode>((v): v is AttributeASTNode => v.type === 'Attribute')
          .reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {});
        switch (stmt.kind) {
          case 'Edge':
            cluster.edge(attrs);
            break;
          case 'Node':
            cluster.node(attrs);
            break;
          case 'Graph':
            cluster.graph(attrs);
            break;
        }
        commentHolder.reset();
        break;
      }
      case 'Comment':
        commentHolder.set(stmt);
    }
  }
}

/**
 * Convert AST to ts-graphviz model.
 *
 * @param ast AST node.
 *
 * @alpha May change the publishing method.
 */
export function convert(ast: DotASTNode): Graph;
export function convert(ast: GraphASTNode): Graph;
export function convert(ast: SubgraphASTNode): Subgraph;
export function convert(ast: NodeASTNode): Node;
export function convert(ast: EdgeASTNode): Edge;
export function convert(
  ast: DotASTNode | GraphASTNode | SubgraphASTNode | NodeASTNode | EdgeASTNode,
): Graph | Subgraph | Node | Edge;
export function convert(
  ast: DotASTNode | GraphASTNode | SubgraphASTNode | NodeASTNode | EdgeASTNode,
): Graph | Subgraph | Node | Edge {
  switch (ast.type) {
    case 'Graph': {
      const root = new Graph(ast.directed, ast.id?.value, ast.strict);
      applyStatements(root, ast.children);
      return root;
    }
    case 'Subgraph': {
      const subgraph = new Subgraph(ast.id?.value);
      applyStatements(subgraph, ast.children);
      return subgraph;
    }
    case 'Edge': {
      const edge = new Edge(
        convertToEdgeTargetTuple(ast),
        ast.children.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
      );
      return edge;
    }
    case 'Node': {
      const node = new Node(
        ast.id.value,
        ast.children.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
      );
      return node;
    }
    case 'Dot': {
      const commentHolder = new CommentHolder();
      for (const stmt of ast.children) {
        switch (stmt.type) {
          case 'Comment':
            commentHolder.set(stmt);
            break;
          case 'Graph': {
            if (stmt.location) {
              const graph = convert(stmt);
              commentHolder.apply(graph, stmt.location);
              return graph;
            }
          }
        }
      }
      throw Error();
    }
    default:
      throw Error();
  }
}
