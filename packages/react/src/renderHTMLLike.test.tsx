import { describe, expect, it, vi } from 'vitest';
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

  // Security tests: Stack overflow prevention
  describe('security: stack overflow prevention', () => {
    it('returns fallback on deeply nested structures (>1000 levels)', () => {
      // Create deeply nested structure
      let element: any = <div>content</div>;
      for (let i = 0; i < 1001; i++) {
        element = <div>{element}</div>;
      }

      // Should return fallback '<>' due to error being caught
      const result = renderHTMLLike(element);
      expect(result).toBe('<>');
    });

    it('allows custom maxDepth option to handle deeper nesting', () => {
      // Create structure with 1500 levels
      let element: any = <div>content</div>;
      for (let i = 0; i < 1500; i++) {
        element = <div>{element}</div>;
      }

      // With default depth (1000), should fail
      expect(renderHTMLLike(element)).toBe('<>');

      // With custom maxDepth (2000), should succeed
      const result = renderHTMLLike(element, { maxDepth: 2000 });
      expect(result).not.toBe('<>');
      expect(result).toContain('<div>');
    });

    it('allows custom maxDepth option for stricter limits', () => {
      // Create structure with 150 levels
      let element: any = <div>content</div>;
      for (let i = 0; i < 150; i++) {
        element = <div>{element}</div>;
      }

      // With default depth (1000), should succeed
      expect(renderHTMLLike(element)).not.toBe('<>');

      // With custom maxDepth (100), should fail
      expect(renderHTMLLike(element, { maxDepth: 100 })).toBe('<>');
    });

    it('handles structures just under the limit (1000 levels)', () => {
      // Create structure at exactly the limit
      let element: any = <div>content</div>;
      for (let i = 0; i < 999; i++) {
        element = <div>{element}</div>;
      }

      // Should complete without error
      const result = renderHTMLLike(element);
      expect(result).not.toBe('<>');
      expect(result).toContain('<div>');
    });

    it('logs warning with descriptive message on depth limit', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      let element: any = <div>deep</div>;
      for (let i = 0; i < 2000; i++) {
        element = <div>{element}</div>;
      }

      renderHTMLLike(element);

      expect(consoleSpy).toHaveBeenCalledWith(
        'renderHTMLLike fallback:',
        expect.stringContaining('Maximum rendering depth of 1000 exceeded'),
      );

      consoleSpy.mockRestore();
    });
  });

  // Security tests: Circular reference prevention
  describe('security: circular reference prevention', () => {
    it('allows reusing the same ReactElement instance multiple times', () => {
      // Create a reusable element
      const sharedElement = <span>Shared Text</span>;

      // Use the same element twice as children
      const parent = (
        <div>
          {sharedElement}
          {sharedElement}
        </div>
      );

      const result = renderHTMLLike(parent);

      // Should NOT be treated as circular reference
      expect(result).not.toBe('<>');
      expect(result).toContain('Shared Text');
      // The shared text should appear twice
      const matches = result.match(/Shared Text/g);
      expect(matches).toHaveLength(2);
    });

    it('detects circular element references', () => {
      // Create circular reference by making element reference itself
      const element: any = { type: 'div', props: {} };
      element.props.children = element;

      // Should return fallback '<>' due to circular reference error
      const result = renderHTMLLike(element as any);
      expect(result).toBe('<>');
    });

    it('logs warning on circular reference detection', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const element: any = { type: 'div', props: {} };
      element.props.children = element;

      renderHTMLLike(element as any);

      expect(consoleSpy).toHaveBeenCalledWith(
        'renderHTMLLike fallback:',
        expect.stringContaining('Circular reference detected'),
      );

      consoleSpy.mockRestore();
    });

    it('handles deeply nested arrays without false positive circular detection', () => {
      const element = (
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i}>
              {[4, 5, 6].map((j) => (
                <span key={j}>
                  Item {i}-{j}
                </span>
              ))}
            </div>
          ))}
        </div>
      );

      const result = renderHTMLLike(element);
      expect(result).not.toBe('<>');
      expect(result).toContain('Item');
    });
  });

  // Performance test with security constraints
  it('completes rendering within reasonable time even with complex structures', () => {
    // Create complex but safe structure (< 1000 depth)
    let element: any = <div>leaf</div>;
    for (let i = 0; i < 500; i++) {
      element = (
        <div>
          {element}
          <span>sibling-{i}</span>
        </div>
      );
    }

    const start = Date.now();
    renderHTMLLike(element);
    const duration = Date.now() - start;

    // Should complete reasonably fast (< 1000ms for 500 levels)
    expect(duration).toBeLessThan(1000);
  });
});
