import * as ast from './ast';
import { GraphvizObject, ICluster, Digraph, Graph, RootCluster } from 'ts-graphviz';

/**
 * dot language parser.
 */
export class Parser extends GraphvizObject {
  private applyStmts(cluster: ICluster, stmts: ast.GraphObject[]): void {
    for (const stmt of stmts) {
      switch (stmt.kind) {
        case ast.Kinds.Subgraph:
          const subgraph = cluster.subgraph();
          this.applyStmts(subgraph, stmt.children);
          break;
        case ast.Kinds.Attribute:
          cluster.set(stmt.key, stmt.value);
          break;
        case ast.Kinds.Node:
          cluster.node(
            stmt.id,
            stmt.attributes.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {}),
          );
          break;
        case ast.Kinds.Edge:
          cluster.edge(
            stmt.targets.map((t) => ({ id: t.id, port: t.port, compass: t.commpass })),
            stmt.attributes.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {}),
          );
          break;
        case ast.Kinds.Attributes:
          const attrs = stmt.attributes.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {});
          switch (stmt.target) {
            case ast.Attributes.Target.Edge:
              cluster.edge(attrs);
              break;
            case ast.Attributes.Target.Node:
              cluster.node(attrs);
              break;
            case ast.Attributes.Target.Graph:
              cluster.graph(attrs);
              break;
          }
          break;
      }
    }
  }

  /**
   * Parse string written in dot language and convert it to a model.
   *
   * @param dot string written in the dot language.
   */
  public parse(dot: string): RootCluster {
    const root = ast.parse(dot);
    const cls = root.directed ? Digraph : Graph;
    const g = new cls(root.id, root.strict);
    this.applyStmts(g, root.children);
    return g;
  }

  public dot(template: TemplateStringsArray, ...substitutions: unknown[]): RootCluster {
    return this.parse(String.raw(template, ...substitutions));
  }
}
