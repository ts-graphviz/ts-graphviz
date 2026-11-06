import { describe, expect, it } from 'vitest';
import { MODEL, modelOf } from './model-view.js';

describe('MODEL', () => {
  it('is the registered symbol every copy of the package shares', () => {
    expect(MODEL).toBe(Symbol.for('@ts-graphviz/common/model'));
  });
});

describe('modelOf', () => {
  it('gives the model under MODEL, or the value itself', () => {
    const model = { $$type: 'Node', id: 'a' };
    expect(modelOf({ [MODEL]: model })).toBe(model);
    expect(modelOf(model)).toBe(model);
    expect(modelOf('a')).toBe('a');
    expect(modelOf(null)).toBe(null);
  });

  it('reads MODEL from a function and through the prototype', () => {
    const model = { $$type: 'Node', id: 'a' };
    const callable = Object.assign(() => {}, { [MODEL]: model });
    expect(modelOf(callable)).toBe(model);
    expect(modelOf(Object.create({ [MODEL]: model }))).toBe(model);
  });

  it('gives the value itself when MODEL holds nothing', () => {
    const empty = { [MODEL]: null };
    expect(modelOf(empty)).toBe(empty);
  });
});
