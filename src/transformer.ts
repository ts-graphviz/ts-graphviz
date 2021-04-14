import { ICluster } from './types';
import * as ast from './ast';
import { Digraph, Graph, RootCluster } from './model/root-clusters';

export class TransformerCore {
  private applyStmts(cluster: ICluster, stmts: ast.GraphObject[]): void {
    for (const stmt of stmts) {
      switch (stmt.kind) {
        case ast.Kinds.Subgraph:
          const subgraph = cluster.subgraph();
          this.applyStmts(subgraph, stmt.children);
          break;
        case ast.Kinds.Attr:
          cluster.set(stmt.key, stmt.value);
          break;
        case ast.Kinds.Node:
          cluster.node(
            stmt.id,
            stmt.attrs.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {}),
          );
          break;
        case ast.Kinds.Edge:
          cluster.edge(
            stmt.targets.map((t) => ({ id: t.id, port: { port: t.port, compass: t.commpass } })),
            stmt.attrs.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {}),
          );
          break;
        case ast.Kinds.Attrs:
          const attrs = stmt.attrs.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {});
          switch (stmt.target) {
            case ast.Attrs.Target.Edge:
              cluster.edge(attrs);
              break;
            case ast.Attrs.Target.Node:
              cluster.node(attrs);
              break;
            case ast.Attrs.Target.Graph:
              cluster.graph(attrs);
              break;
          }
          break;
      }
    }
  }

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
