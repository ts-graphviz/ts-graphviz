import { parse } from '../parse';
import { Kinds } from '../types';

test('digraph named test', () => {
  const result = parse('digraph test {}');
  expect(result).toMatchObject({
    kind: Kinds.Graph,
    id: 'test',
    directed: true,
    strict: false,
    children: [],
  });
});

test('strict digraph named test', () => {
  const result = parse('strict digraph test {}');
  expect(result).toMatchObject({
    kind: Kinds.Graph,
    id: 'test',
    directed: true,
    strict: true,
    children: [],
  });
});

test('digraph named test(quated)', () => {
  const result = parse('digraph "test" {}');
  expect(result).toMatchObject({
    kind: Kinds.Graph,
    id: 'test',
    directed: true,
    strict: false,
    children: [],
  });
});

test('anonymous digraph', () => {
  const result = parse('digraph {}');
  expect(result).toMatchObject({
    kind: Kinds.Graph,
    strict: false,
    directed: true,
    children: [],
  });
});

test('graph named test', () => {
  const result = parse('graph test {}');
  expect(result).toMatchObject({
    kind: Kinds.Graph,
    id: 'test',
    directed: false,
    strict: false,
    children: [],
  });
});

test('strict graph named test', () => {
  const result = parse('strict graph test {}');
  expect(result).toMatchObject({
    kind: Kinds.Graph,
    id: 'test',
    directed: false,
    strict: true,
    children: [],
  });
});
