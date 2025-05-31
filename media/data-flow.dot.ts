import { digraph } from 'ts-graphviz';

export default digraph((g) => {
  g.set('rankdir', 'LR');
  g.node({
    shape: 'circle',
  });

  g.subgraph('cluster_creation', { label: 'Graph Creation' }, (sg) => {
    sg.subgraph('cluster_parsing', { label: 'Parsing' }, (parsing) => {
      parsing.node('dot_input', {
        label: 'DOT\\nString',
      });

      parsing.node('parded_ast', {
        label: 'AST',
      });
    });

    sg.node('oop', {
      label: 'Object-Oriented API',
      shape: 'box',
    });

    sg.node('declarative', {
      label: 'Declarative API',
      shape: 'box',
    });

    sg.node('react', {
      label: 'React\\nComponent',
    });

    sg.node('model', {
      label: 'Graph\\nModel',
    });

    sg.edge([['oop', 'react', 'declarative'], 'model']);

    sg.edge(['dot_input', 'parded_ast', 'model']);
  });

  g.subgraph('cluster_core_processing', { label: 'Core Processing' }, (sg) => {
    sg.node('ast', {
      label: 'AST',
    });

    sg.node('dot_output', {
      label: 'DOT\\nString',
    });
  });

  g.subgraph('cluster_rendering', { label: 'Rendering' }, (sg) => {
    sg.node('node_adapter', {
      label: 'Node\\nAdapter',
      shape: 'box',
    });
    sg.node('deno_adapter', {
      label: 'Deno\\nAdapter',
      shape: 'box',
    });

    sg.node('image', {
      label: 'Visual\\nOutput',
    });

    sg.edge([['deno_adapter', 'node_adapter'], 'image']);
  });
  g.edge(['model', 'dot_output', ['node_adapter', 'deno_adapter']]);
  g.edge(['model', 'ast', 'dot_output']);

  // g.edge(['dot_output', 'ast', 'model'], {
  //   constraint: false,
  //   style: 'dashed',
  // })
  // g.edge(['dot_output', 'model'], {
  //   constraint: false,
  // });
});
