import { ICluster, Digraph, Graph, RootCluster, Subgraph, Node, Edge } from 'ts-graphviz';
import { AST } from './ast';

function applyStatements(cluster: ICluster, statements: AST.ClusterStatement[]): void {
  for (const stmt of statements) {
    switch (stmt.type) {
      case AST.Types.Subgraph:
        const subgraph = stmt.id ? cluster.subgraph(stmt.id) : cluster.subgraph();
        applyStatements(subgraph, stmt.body);
        break;
      case AST.Types.Attribute:
        cluster.set(stmt.key, stmt.value);
        break;
      case AST.Types.Node:
        cluster.node(
          stmt.id,
          stmt.attributes.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {}),
        );
        break;
      case AST.Types.Edge:
        cluster.edge(
          stmt.targets.map((t) => ({ id: t.id, port: t.port, compass: t.commpass })),
          stmt.attributes.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {}),
        );
        break;
      case AST.Types.Attributes:
        const attrs = stmt.attributes.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {});
        switch (stmt.target) {
          case AST.Attributes.Target.Edge:
            cluster.edge(attrs);
            break;
          case AST.Attributes.Target.Node:
            cluster.node(attrs);
            break;
          case AST.Attributes.Target.Graph:
            cluster.graph(attrs);
            break;
        }
        break;
    }
  }
}

export function convert(ast: AST.Graph): RootCluster;
export function convert(ast: AST.Subgraph): Subgraph;
export function convert(ast: AST.Node): Node;
export function convert(ast: AST.Edge): Edge;
export function convert(ast: AST.Graph | AST.Subgraph | AST.Node | AST.Edge): RootCluster | Subgraph | Node | Edge;
export function convert(ast: AST.Graph | AST.Subgraph | AST.Node | AST.Edge): RootCluster | Subgraph | Node | Edge {
  switch (ast.type) {
    case AST.Types.Graph:
      const Root = ast.directed ? Digraph : Graph;
      const root = new Root(ast.id, ast.strict);
      applyStatements(root, ast.body);
      return root;
    case AST.Types.Subgraph:
      const subgraph = new Subgraph(ast.id);
      applyStatements(subgraph, ast.body);
      return subgraph;
    case AST.Types.Edge:
      const edge = new Edge(
        ast.targets.map((t) => ({ id: t.id, port: t.port, compass: t.commpass })),
        ast.attributes.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {}),
      );
      return edge;
    case AST.Types.Node:
      const node = new Node(
        ast.id,
        ast.attributes.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {}),
      );
      return node;
    default:
      throw Error();
  }
}
