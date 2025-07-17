import { describe, expect, it } from 'vitest';
import { renderHTMLLike } from './renderHTMLLike.js';

describe('renderHTMLLike()', () => {
  it('returns "<>" for undefined label', () => {
    expect(renderHTMLLike()).toBe('<>');
  });

  it('returns "<>" for null label', () => {
    expect(renderHTMLLike(null as any)).toBe('<>');
  });

  it('handles simple dot:port transformation', () => {
    const element = <dot:port>portname</dot:port>;
    const result = renderHTMLLike(element);
    expect(result).toBe('<<portname>>');
  });

  it('handles dot:table transformation', () => {
    const element = (
      <dot:table border={0} cellborder={1}>
        <dot:tr>
          <dot:td>Cell1</dot:td>
          <dot:td>Cell2</dot:td>
        </dot:tr>
      </dot:table>
    );
    const result = renderHTMLLike(element);
    expect(result).toContain('<table border="0" cellborder="1">');
    expect(result).toContain('<tr>');
    expect(result).toContain('<td>');
    expect(result).toContain('Cell1');
    expect(result).toContain('Cell2');
  });

  it('handles mixed dot: and regular elements', () => {
    const element = (
      <div>
        <dot:table>
          <tr>
            <dot:td>Mixed</dot:td>
          </tr>
        </dot:table>
      </div>
    );
    const result = renderHTMLLike(element);
    expect(result).toContain('<div>');
    expect(result).toContain('<table>');
    expect(result).toContain('<tr>');
    expect(result).toContain('<td>');
  });

  it('handles nested dot:port elements', () => {
    const element = (
      <dot:table>
        <dot:tr>
          <dot:td>
            <dot:port>port1</dot:port>
          </dot:td>
        </dot:tr>
      </dot:table>
    );
    const result = renderHTMLLike(element);
    expect(result).toContain('<table>');
    expect(result).toContain('<port1>');
  });

  it('handles closing tags with dot: prefix', () => {
    const element = (
      <dot:font color="red">
        <dot:b>Bold text</dot:b>
      </dot:font>
    );
    const result = renderHTMLLike(element);
    expect(result).toContain('<font color="red">');
    expect(result).toContain('</font>');
    expect(result).toContain('<b>');
    expect(result).toContain('</b>');
  });

  it('handles malformed HTML gracefully', () => {
    // This tests edge cases where tags might be incomplete
    const element = <div>Content with &lt; and &gt;</div>;
    const result = renderHTMLLike(element);
    expect(result).toContain('Content with < and >');
  });

  it('handles multiple dot:port elements', () => {
    const element = (
      <dot:table>
        <dot:tr>
          <dot:td>
            <dot:port>port1</dot:port>
          </dot:td>
          <dot:td>
            <dot:port>port2</dot:port>
          </dot:td>
        </dot:tr>
      </dot:table>
    );
    const result = renderHTMLLike(element);
    expect(result).toContain('<port1>');
    expect(result).toContain('<port2>');
  });

  it('handles empty elements', () => {
    const element = <dot:br />;
    const result = renderHTMLLike(element);
    expect(result).toContain('<br');
  });

  it('preserves attributes on transformed elements', () => {
    const element = (
      <dot:table border={1} cellspacing={0} cellpadding={4}>
        Content
      </dot:table>
    );
    const result = renderHTMLLike(element);
    expect(result).toContain('border="1"');
    expect(result).toContain('cellspacing="0"');
    expect(result).toContain('cellpadding="4"');
    expect(result).toContain('<table');
  });

  it('handles complex nested structures', () => {
    const element = (
      <dot:table>
        <dot:tr>
          <dot:td>
            <dot:font color="blue">
              <dot:b>Header</dot:b>
            </dot:font>
          </dot:td>
        </dot:tr>
        <dot:tr>
          <dot:td>
            <dot:port>data</dot:port>
          </dot:td>
        </dot:tr>
      </dot:table>
    );
    const result = renderHTMLLike(element);
    expect(result).toContain('<table>');
    expect(result).toContain('<font color="blue">');
    expect(result).toContain('<b>Header</b>');
    expect(result).toContain('<data>');
  });

  // Test for potential ReDoS protection
  it('handles pathological input efficiently', () => {
    // Create a string that would be problematic for the original regex
    const problematicContent = 'a'.repeat(1000);
    const element = (
      <dot:table>
        <dot:tr>
          <dot:td>{problematicContent}</dot:td>
        </dot:tr>
      </dot:table>
    );

    const start = Date.now();
    const result = renderHTMLLike(element);
    const duration = Date.now() - start;

    // Should complete in reasonable time (< 100ms)
    expect(duration).toBeLessThan(100);
    expect(result).toContain(problematicContent);
  });
});
