import { isAttributeAssignmentModel } from '@ts-graphviz/common';
import { describe, expect, it, test } from 'vitest';
import { AttributeAssignment } from './AttributeAssignment.js';
import { Digraph } from './Digraph.js';
import { LegacyDigraph } from './legacy.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

const invalid = expect.objectContaining({
  name: 'TypeError',
  code: 'TSG_ERR_INVALID_ATTRIBUTE_ASSIGNMENT',
});

describe('AttributeAssignment', () => {
  it('holds a key and a value, which can be changed', () => {
    const a = new AttributeAssignment('label', 'x');
    expect(a.$$type).toBe('AttributeAssignment');
    expect(isAttributeAssignmentModel(a)).toBe(true);
    expect([a.key, a.value]).toEqual(['label', 'x']);
    a.value = 'y';
    expect(a.value).toBe('y');
  });

  test.each([
    [1, 'x'],
    [undefined, 'x'],
    ['label', null],
    ['label', undefined],
  ])('rejects the key %j with the value %j', (key, value) => {
    expect(() => new AttributeAssignment(key as never, value as never)).toThrow(
      invalid,
    );
  });

  it('rejects a value set to null or undefined, and keeps the old one', () => {
    const a = new AttributeAssignment('label', 'x');
    expect(() => {
      a.value = null as never;
    }).toThrow(invalid);
    expect(a.value).toBe('x');
  });

  it('takes leading and trailing comments', () => {
    const a = new AttributeAssignment('label', 'x');
    const lead = a.addComment('lead');
    a.addComment('trail', { position: 'trailing' });
    expect(() => a.addComment('end', { position: 'end' as never })).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_INVALID_COMMENT' }),
    );
    a.removeComment(lead);
    expect(a.comments.map((c) => [c.text, c.position])).toEqual([
      ['trail', 'trailing'],
    ]);
  });
});

describe('a graph', () => {
  it('adds an assignment as its last statement and removes it', () => {
    const g = new Digraph();
    const a = new Node('a');
    g.addNode(a);
    const assignment = g.addAttributeAssignment('label', 'G');
    // A default statement added after it keeps its place.
    const list = g.addAttributeList('Node', { shape: 'box' });
    expect(g.statements).toStrictEqual([a, assignment, list]);
    // The graph's attributes are its assignments.
    expect(g.getAttribute('label')).toBe('G');
    g.removeAttributeAssignment(a as never);
    g.removeAttributeAssignment(assignment);
    expect(g.statements).toStrictEqual([a, list]);
  });

  it('adds one in place before any other statement too', () => {
    const g = new Digraph();
    const assignment = g.addAttributeAssignment('label', 'G');
    const list = g.addAttributeList('Node', { shape: 'box' });
    expect(g.statements).toStrictEqual([assignment, list]);
  });

  it('checks the key and the value', () => {
    const g = new Digraph();
    expect(() => g.addAttributeAssignment('label', undefined as never)).toThrow(
      invalid,
    );
    expect(g.statements).toStrictEqual([]);
  });
});

describe("a graph's attributes, its assignments", () => {
  it('set the first assignment of a key and remove the others', () => {
    const g = new Digraph('G', { bgcolor: 'red' });
    const s = new Subgraph('s');
    g.addSubgraph(s);
    const later = g.addAttributeAssignment('bgcolor', 'blue');
    later.addComment('blue from here');
    expect(g.getAttribute('bgcolor')).toBe('blue');
    g.setAttribute('bgcolor', 'green');
    // One value throughout: the later one, and its comment, are gone.
    expect(g.statements).toMatchObject([
      { key: 'bgcolor', value: 'green' },
      { $$type: 'Subgraph' },
    ]);
    expect(g.getAttribute('bgcolor')).toBe('green');
    g.setAttribute('label', 'L');
    expect(g.getAttributeNames()).toEqual(['bgcolor', 'label']);
    expect(g.statements.map((x) => x.$$type)).toEqual([
      'AttributeAssignment',
      'AttributeAssignment',
      'Subgraph',
    ]);
    g.removeAttributes();
    expect(g.statements).toStrictEqual([s]);
  });

  it('are a table of its own with the legacy classes', () => {
    const g = new LegacyDigraph('G', { bgcolor: 'red' });
    expect(g.attributesInStatements).toBe(false);
    expect(g.statements).toStrictEqual([]);
    g.addAttributeAssignment('bgcolor', 'blue');
    expect(g.getAttribute('bgcolor')).toBe('red');
  });
});
