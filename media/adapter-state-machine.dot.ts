import { digraph } from 'ts-graphviz';

export default digraph('state_machine', (g) => {
  g.set('newrank', true);

  g.node({ shape: 'circle' });

  g.edge(['DOT', 'Stream'], { label: 'toStream' });
  g.edge(['DOT', 'File'], { label: 'toFile' });
});

export const meta = {
  exportTo: [
    './packages/adapter/media/adapter-state-machine.svg',
    './packages/ts-graphviz/media/adapter-state-machine.svg',
  ],
};
