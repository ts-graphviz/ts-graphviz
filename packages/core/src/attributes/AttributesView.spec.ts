import { describe, expect, it } from 'vitest';
import { Node } from '../models/Node.js';
import { AttributesView } from './AttributesView.js';

describe('AttributesView', () => {
  it('goes to the object it views, under every name', () => {
    const node = new Node('a');
    const view = new AttributesView(node);
    view.setAttribute('label', 'A');
    view.set('color', 'red');
    view.setAttributes({ shape: 'box' });
    view.apply([['style', 'filled']]);
    expect(node.getAttributeNames()).toEqual([
      'label',
      'color',
      'shape',
      'style',
    ]);
    expect(view.getAttribute('label')).toBe('A');
    expect(view.get('color')).toBe('red');
    expect(view.hasAttribute('shape')).toBe(true);
    expect(view.getAttributeNames()).toEqual(node.getAttributeNames());
    expect(view.size).toBe(4);
    expect(view.values).toEqual([
      ['label', 'A'],
      ['color', 'red'],
      ['shape', 'box'],
      ['style', 'filled'],
    ]);
    view.removeAttribute('label');
    view.delete('color');
    expect(node.getAttributeNames()).toEqual(['shape', 'style']);
    view.removeAttributes();
    expect(node.getAttributeNames()).toEqual([]);
    node.setAttribute('label', 'B');
    view.clear();
    expect(node.hasAttribute('label')).toBe(false);
  });
});
