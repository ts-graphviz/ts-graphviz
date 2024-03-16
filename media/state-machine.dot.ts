import { digraph } from 'ts-graphviz';

export default digraph('state_machine', (g) => {
  g.set('newrank', true);
  g.node({ shape: 'circle' });

  g.edge(['Model', 'DOT'], { label: 'toDot', constraint: false });
  g.edge(['AST', 'DOT'], { label: 'stringify' });
  g.edge(['DOT', 'AST'], { label: 'parse' });
  g.edge(['Model', 'AST'], { label: 'fromModel' });
  g.edge(['AST', 'Model'], { label: 'toModel' });
  g.edge(['DOT', 'Model'], { label: 'fromDot', constraint: false });
});

export const meta = {
  exportTo: ['./packages/ts-graphviz/media/state-machine.svg'],
};
