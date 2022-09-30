import '../../../core/index.js';
import { createElement } from '../../builder/create-element.js';
import { toModel } from './to-model.js';

test('brank ast throw error', () => {
  const ast = createElement('Dot', {}, []);

  expect(() => toModel(ast)).toThrowError();
});

test('comment', () => {
  const ast = createElement('Dot', {}, [
    createElement(
      'Comment',
      {
        kind: 'Macro',
        value: 'This is comment',
      },
      [],
    ),
    createElement(
      'Graph',
      {
        strict: false,
        directed: true,
      },
      [],
    ),
  ]);
  const model = toModel(ast);
  expect(model.comment).toStrictEqual('This is comment');
});
