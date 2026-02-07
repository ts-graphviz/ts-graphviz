import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Node } from './components/Node.js';
import { renderHTMLLike } from './renderHTMLLike.js';
import { renderToDot } from './renderToDot.js';
import type { DotJSXElements } from './types.js';

/**
 * Tests for auto-augmentation of JSX type definitions.
 *
 * Importing @ts-graphviz/react (or its modules) should automatically
 * make dot:* elements available in JSX without any additional setup.
 * These tests verify that:
 * 1. DotJSXElements is exported and usable as a type
 * 2. dot:* elements work in JSX expressions (compile-time type check)
 * 3. dot:* elements render correctly in renderHTMLLike and renderToDot
 */
describe('dot:* JSX auto-augmentation', () => {
  it('DotJSXElements type is exported and represents all dot:* elements', () => {
    // Type-level assertion: DotJSXElements should be assignable
    const _typeCheck: DotJSXElements['dot:table'] = { children: undefined };
    expect(_typeCheck).toBeDefined();
  });

  it('dot:* elements are usable in JSX without explicit type imports', () => {
    // This test primarily verifies compile-time type checking.
    // If the augmentation is broken, this file will not compile.
    const table = (
      <dot:table border={1} cellborder={0} cellspacing={0}>
        <dot:tr>
          <dot:td align="LEFT">
            <dot:b>Header</dot:b>
          </dot:td>
        </dot:tr>
        <dot:tr>
          <dot:td>
            <dot:i>Italic</dot:i>
          </dot:td>
        </dot:tr>
      </dot:table>
    );
    expect(table).toBeDefined();
  });

  it('all dot:* element types are accepted in JSX', () => {
    // Verify every dot:* element type compiles and renders
    const elements = (
      <dot:table>
        <dot:tr>
          <dot:td>
            <dot:font color="red">
              <dot:b>bold</dot:b>
              <dot:i>italic</dot:i>
              <dot:u>underline</dot:u>
              <dot:o>overline</dot:o>
              <dot:s>strikethrough</dot:s>
              <dot:sub>subscript</dot:sub>
              <dot:sup>superscript</dot:sup>
            </dot:font>
            <dot:br />
            <dot:hr />
            <dot:vr />
            <dot:img src="test.png" />
          </dot:td>
        </dot:tr>
      </dot:table>
    );
    expect(elements).toBeDefined();
  });

  it('dot:port element accepts string children', () => {
    const port = <dot:port>port_name</dot:port>;
    const result = renderHTMLLike(port);
    expect(result).toBe('<<port_name>>');
  });

  it('renderHTMLLike correctly processes dot:* elements', () => {
    const label = (
      <dot:table border={1}>
        <dot:tr>
          <dot:td bgcolor="lightblue">
            <dot:b>Title</dot:b>
          </dot:td>
        </dot:tr>
        <dot:tr>
          <dot:td>Content</dot:td>
        </dot:tr>
      </dot:table>
    );

    const result = renderHTMLLike(label);
    expect(result).toContain('<table border="1">');
    expect(result).toContain('<td bgcolor="lightblue">');
    expect(result).toContain('<b>Title</b>');
    expect(result).toContain('Content');
  });

  it('dot:* elements work as labels in renderToDot', async () => {
    const dot = await renderToDot(
      <Digraph id="html_label_test">
        <Node
          id="n1"
          label={
            <dot:table border={0}>
              <dot:tr>
                <dot:td>
                  <dot:b>Node 1</dot:b>
                </dot:td>
              </dot:tr>
            </dot:table>
          }
        />
        <Node id="n2" label="plain" />
        <Edge targets={['n1', 'n2']} />
      </Digraph>,
    );

    expect(dot).toContain('digraph "html_label_test"');
    expect(dot).toContain('<table border="0">');
    expect(dot).toContain('<b>Node 1</b>');
    expect(dot).toContain('"n1" -> "n2"');
  });
});
