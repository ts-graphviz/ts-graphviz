import { strict } from 'ts-graphviz';

enum STATE {
  DOT = 'DOT',
  AST = 'AST',
  MODEL = 'MODEL',
};

const methods: { [method: string]: [input: STATE, output: STATE] } = {
  parse: [STATE.DOT, STATE.AST],
  stringify: [STATE.AST, STATE.DOT],
  toDot: [STATE.MODEL, STATE.DOT],
  toAST: [STATE.MODEL, STATE.AST],
  fromAST: [STATE.AST, STATE.MODEL],
  convert: [STATE.DOT, STATE.MODEL],
};

export default strict.digraph((g) => {
  g.node({
    shape: 'circle',
    width: 1.5,
  });
  g.subgraph({ rank: 'same' }, (sub) => {
    for (const state of [STATE.DOT, STATE.MODEL]) {
      sub.node(state);
    }
  });

  for (const [method, [input, output]] of Object.entries(methods)) {
    g.edge([input, output], { label: method });
  }
});
