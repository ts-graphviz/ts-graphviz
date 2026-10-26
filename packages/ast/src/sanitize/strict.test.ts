import { describe, expect, it } from 'vitest';
import { sanitize } from './sanitize.js';

const strict = (dot: string) =>
  sanitize(dot, { policy: 'strict', format: 'svg' });

describe('sanitize with the strict policy', { tags: ['SM-7'] }, () => {
  it.each([
    'digraph { a -> b }',
    'digraph { rankdir=LR; node [shape=box style="filled,rounded" fillcolor="#eeeeee" fontname="Helvetica"]; a [label="A\\nline" tooltip="t" URL="https://example.com/"]; a -> b [label="x" color="red:blue" penwidth=2 arrowhead=vee headport="n:sw"] }',
    'digraph { subgraph cluster_x { label="X"; rank=same; a; b } size="7.5,10!" ratio=fill margin="0.1,0.2" }',
    'digraph { a [id="node-a" class="primary big" pos="1,2!" xlabel="x"] }',
    'digraph { a -> b [pos="e,1,2 3,4 5,6"] }',
    'digraph { a [shape=record label="<f0> left|{<f1> mid|right}"] }',
    'digraph { a [label=<<table border="0" cellborder="1" cellspacing="0" bgcolor="white"><tr><td port="p" colspan="2" href="/x" title="t" align="left"><font color="red" face="Helvetica" point-size="10"><b>B</b><br align="left"/>i<sub>2</sub></font></td></tr><hr/></table>>] }',
  ])('accepts ordinary DOT: %j', (dot) => {
    expect(() => strict(dot)).not.toThrow();
  });

  it.each([
    ['digraph { a [foo="x"] }', 'is not a Graphviz attribute'],
    ['digraph { a [Label="x"] }', 'is not a Graphviz attribute'],
    ['digraph { a [_draw_="x"] }', 'xdot drawing program'],
    ['digraph { a [id="a(b)"] }', 'characters outside'],
    ['digraph { a [class="a\\"b"] }', 'characters outside'],
    ['digraph { a [target="&amp;"] }', 'characters outside'],
    ['digraph { a [pos="1%2"] }', 'characters outside'],
    ['digraph { a [id="\\N"] }', 'characters outside'],
    [
      'digraph { a [label=<<marquee>x</marquee>>] }',
      'not an HTML-like label tag',
    ],
    [
      'digraph { a [label=<<table onclick="x"><tr><td>x</td></tr></table>>] }',
      'Graphviz does not define',
    ],
    [
      'digraph { a [label=<<font size="3">x</font>>] }',
      'Graphviz does not define',
    ],
    [
      'digraph { a [label=<<table id="a(b)"><tr><td>x</td></tr></table>>] }',
      'characters outside',
    ],
  ])('rejects %j', (dot, message) => {
    expect(() => strict(dot)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_UNSAFE_DOT' }),
    );
    expect(() => strict(dot)).toThrow(message);
  });

  it('is off by default', () => {
    expect(() =>
      sanitize('digraph { a [foo="x"] }', { format: 'svg' }),
    ).not.toThrow();
  });
});
