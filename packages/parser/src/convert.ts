import { ICluster, Digraph, Graph, RootCluster, Subgraph, Node, Edge, IHasComment } from 'ts-graphviz';
import { AST } from './ast';

class CommentHolder {
  public comment: AST.Comment | null = null;

  public set(comment: AST.Comment): void {
    this.comment = comment;
  }

  public reset(): void {
    this.comment = null;
  }

  public apply(model: IHasComment, location: AST.FileRange): void {
    if (this.comment?.kind === AST.Comment.Kind.Block) {
      if (this.comment?.location.end.line === location.start.line - 1) {
        model.comment = this.comment.value;
      }
    } else {
      if (this.comment?.location.end.line === location.start.line) {
        model.comment = this.comment.value;
      }
    }
    this.reset();
  }
}

function applyStatements(cluster: ICluster, statements: AST.ClusterStatement[]): void {
  const commentHolder = new CommentHolder();
  for (const stmt of statements) {
    switch (stmt.type) {
      case AST.Types.Subgraph:
        const subgraph = stmt.id ? cluster.subgraph(stmt.id.value) : cluster.subgraph();
        applyStatements(subgraph, stmt.body);
        commentHolder.apply(subgraph, stmt.location);
        break;
      case AST.Types.Attribute:
        cluster.set(stmt.key.value, stmt.value.value);
        commentHolder.reset();
        break;
      case AST.Types.Node:
        commentHolder.apply(
          cluster.node(
            stmt.id.value,
            stmt.body.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
          ),
          stmt.location,
        );
        break;
      case AST.Types.Edge:
        commentHolder.apply(
          cluster.edge(
            stmt.targets.map((t) => ({ id: t.id.value, port: t.port?.value, compass: t.compass?.value })),
            stmt.body.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
          ),
          stmt.location,
        );
        break;
      case AST.Types.Attributes:
        const attrs: { [key: string]: string } = stmt.body
          .filter<AST.Attribute>((v): v is AST.Attribute => v.type === AST.Types.Attribute)
          .reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {});
        switch (stmt.kind) {
          case AST.Attributes.Kind.Edge:
            cluster.edge(attrs);
            break;
          case AST.Attributes.Kind.Node:
            cluster.node(attrs);
            break;
          case AST.Attributes.Kind.Graph:
            cluster.graph(attrs);
            break;
        }
        commentHolder.reset();
        break;
      case AST.Types.Comment:
        commentHolder.set(stmt);
    }
  }
}

export function convert(ast: AST.Dot): RootCluster;
export function convert(ast: AST.Graph): RootCluster;
export function convert(ast: AST.Subgraph): Subgraph;
export function convert(ast: AST.Node): Node;
export function convert(ast: AST.Edge): Edge;
export function convert(
  ast: AST.Dot | AST.Graph | AST.Subgraph | AST.Node | AST.Edge,
): RootCluster | Subgraph | Node | Edge;
export function convert(
  ast: AST.Dot | AST.Graph | AST.Subgraph | AST.Node | AST.Edge,
): RootCluster | Subgraph | Node | Edge {
  switch (ast.type) {
    case AST.Types.Graph:
      const Root = ast.directed ? Digraph : Graph;
      const root = new Root(ast.id?.value, ast.strict);
      applyStatements(root, ast.body);
      return root;
    case AST.Types.Subgraph:
      const subgraph = new Subgraph(ast.id?.value);
      applyStatements(subgraph, ast.body);
      return subgraph;
    case AST.Types.Edge:
      const edge = new Edge(
        ast.targets.map((t) => ({ id: t.id.value, port: t.port?.value, compass: t.compass?.value })),
        ast.body.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
      );
      return edge;
    case AST.Types.Node:
      const node = new Node(
        ast.id.value,
        ast.body.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
      );
      return node;
    case AST.Types.Dot:
      const commentHolder = new CommentHolder();
      for (const stmt of ast.body) {
        switch (stmt.type) {
          case AST.Types.Comment:
            commentHolder.set(stmt);
            break;
          case AST.Types.Graph:
            const graph = convert(stmt);
            commentHolder.apply(graph, stmt.location);
            return graph;
        }
      }
    default:
      throw Error();
  }
}
