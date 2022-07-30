import { strict } from 'ts-graphviz';

enum PKG {
  graphviz = 'ts-graphviz',
  type = '@ts-graphviz/dot-type',
  attribute = '@ts-graphviz/dot-attribute',
  ast = '@ts-graphviz/dot-ast',
  node = '@ts-graphviz/node',
  react = '@ts-graphviz/react',
  renderer = '@ts-graphviz/renderer',
  parser = '@ts-graphviz/parser',
  model = '@ts-graphviz/model',
}

const dependencies: { [key: string]: PKG[] } = {
  [PKG.attribute]: [PKG.type],
  [PKG.ast]: [PKG.attribute, PKG.type],
  [PKG.renderer]: [PKG.ast, PKG.type, PKG.attribute],
  [PKG.model]: [PKG.attribute, PKG.ast],
  [PKG.parser]: [PKG.ast],
  [PKG.graphviz]: [PKG.ast, PKG.attribute, PKG.type, PKG.model, PKG.renderer, PKG.parser],
  [PKG.node]: [PKG.graphviz],
  [PKG.react]: [PKG.graphviz],
};

const groups: { [group: string]: PKG[] } = {
  Knowledge: [PKG.type, PKG.attribute, PKG.ast],
  Model: [PKG.model, PKG.parser, PKG.renderer],
  Interface: [PKG.graphviz],
  Adapter: [PKG.node, PKG.react],
};

export default strict.digraph((g) => {
  g.apply({
    newrank: true,
  });
  g.node({ shape: 'component' });
  g.edge({ dir: 'back' });
  g.graph({ labelloc: 't', labeljust: 'l' });

  g.edge([PKG.type, PKG.attribute, PKG.ast, PKG.model, PKG.graphviz]);

  for (const [group, packages] of Object.entries(groups)) {
    g.subgraph(`cluster_${group}`, (s) => {
      s.apply({ label: group });
      for (const pkg of packages) {
        s.node(pkg);
      }
    });
  }

  for (const [src, dists] of Object.entries(dependencies)) {
    for (const dist of dists) {
      g.edge([dist, src]);
    }
  }

  g.subgraph({ rank: 'same' }, (sub) => {
    sub.node(PKG.parser);
    sub.node(PKG.model);
    sub.node(PKG.renderer);
  });
});
