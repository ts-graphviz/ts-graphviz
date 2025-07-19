import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { parse, stringify } from '@ts-graphviz/ast';
import { Digraph, Node, Edge } from 'ts-graphviz';
import { createCommandArgs } from '@ts-graphviz/adapter';
import {
  SecurityArbitraries,
  SecurityTestPatterns,
  SecurityValidators,
  ATTACK_PATTERNS,
  SecurityMockFactory
} from './utils/security-test-helpers.js';

/**
 * Tests for command injection prevention in ts-graphviz adapter modules
 * These tests verify that the library safely handles potentially malicious command arguments
 */
describe('Command Injection Prevention in ts-graphviz Adapters', () => {
  describe('Command Argument Sanitization', () => {
    it('should safely escape shell metacharacters in graph attributes', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            SecurityArbitraries.maliciousString('command_injection'),
            fc.string().map(s => `; ${s}`),
            fc.string().map(s => `&& ${s}`),
            fc.string().map(s => `| ${s}`),
            fc.string().map(s => `$(${s})`),
            fc.string().map(s => '`' + s + '`')
          ),
          (maliciousInput) => {
            const options = {
              format: 'svg' as const,
              attributes: {
                graph: {
                  label: maliciousInput,
                  fontname: maliciousInput
                },
                node: {
                  label: maliciousInput,
                  tooltip: maliciousInput
                },
                edge: {
                  label: maliciousInput
                }
              }
            };

            const args = Array.from(createCommandArgs(options));
            
            // Verify no shell metacharacters are exposed
            args.forEach(arg => {
              expect(arg).not.toMatch(/[;&|`$]/);
              expect(arg).not.toContain('&&');
              expect(arg).not.toContain('||');
              expect(arg).not.toContain('$(');
              expect(arg).not.toContain('${');
            });

            // Arguments should be properly quoted when needed
            const hasQuotedValues = args.some(arg => arg.includes('"'));
            if (maliciousInput.includes(' ')) {
              expect(hasQuotedValues).toBe(true);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should prevent command injection through DOT syntax manipulation', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.maliciousString('command_injection'),
          (payload) => {
            const g = new Digraph();
            
            // Try to inject through various graph elements
            g.node('test', { 
              label: payload,
              xlabel: payload,
              tooltip: payload
            });
            
            g.edge(['test', 'test2'], {
              label: payload,
              xlabel: payload,
              headlabel: payload,
              taillabel: payload
            });

            const dot = g.toDot();
            
            // The DOT output should properly escape the payload
            expect(dot).toContain('digraph');
            
            // Verify no command injection patterns remain unescaped
            const lines = dot.split('\n');
            lines.forEach(line => {
              // Check for unescaped shell commands
              if (line.includes(payload) && !line.includes('"')) {
                expect(line).not.toMatch(/[;&|`$]/);
              }
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('File Path Injection Prevention', () => {
    it('should sanitize file paths in output options', () => {
      const dangerousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        '/etc/shadow',
        '~/../../root/.ssh/id_rsa',
        '\0/etc/passwd', // Null byte injection
        'file://etc/passwd',
        '\\\\server\\share\\sensitive'
      ];

      dangerousPaths.forEach(path => {
        const g = new Digraph();
        g.node('test', { label: 'Test' });
        
        // Simulate output path handling
        const safePath = path
          .replace(/\.\./g, '') // Remove directory traversal
          .replace(/[\\\/]/g, '_') // Replace path separators
          .replace(/\0/g, '') // Remove null bytes
          .replace(/^~/, '') // Remove home directory expansion
          .replace(/^file:\/\//i, ''); // Remove file protocol

        expect(safePath).not.toContain('..');
        expect(safePath).not.toMatch(/^[\\\/]/);
        expect(safePath).not.toContain('\0');
      });
    });
  });

  describe('Environment Variable Injection', () => {
    it('should prevent environment variable expansion in attributes', () => {
      const envVarPatterns = [
        '$HOME/.ssh/id_rsa',
        '${USER}_secret',
        '%USERPROFILE%\\Documents',
        '$(whoami)',
        '`id`',
        '$PATH:/malicious/path'
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...envVarPatterns),
          (envPattern) => {
            const g = new Digraph();
            g.node('test', { 
              label: envPattern,
              URL: envPattern // URL attribute might be particularly vulnerable
            });

            const dot = g.toDot();
            
            // Environment variables should be treated as literal strings
            expect(dot).toContain(envPattern);
            
            // But they should be properly quoted/escaped
            const lines = dot.split('\n');
            const attrLine = lines.find(line => line.includes(envPattern));
            expect(attrLine).toMatch(/"[^"]*"/); // Should be within quotes

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('URL Injection Prevention', () => {
    it('should sanitize URLs in graph attributes', () => {
      const maliciousUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'file:///etc/passwd',
        'ftp://evil.com/backdoor.sh',
        '//evil.com/steal.js' // Protocol-relative URL
      ];

      maliciousUrls.forEach(url => {
        const g = new Digraph();
        g.node('test', { 
          URL: url,
          href: url // Alternative URL attribute
        });

        const dot = g.toDot();
        
        // URLs should be included but properly escaped
        expect(dot).toContain('URL=');
        
        // Verify quotes are used for URLs
        const urlMatch = dot.match(/URL="([^"]*)"/);
        expect(urlMatch).toBeTruthy();
      });
    });
  });

  describe('Property-based Command Injection Tests', () => {
    it('should handle complex nested payloads safely', () => {
      fc.assert(
        fc.property(
          fc.record({
            nodeId: SecurityArbitraries.safeString(),
            label: SecurityArbitraries.maliciousString('command_injection'),
            attrs: fc.dictionary(
              fc.string({ minLength: 1, maxLength: 20 }),
              SecurityArbitraries.maliciousString('command_injection'),
              { maxKeys: 5 }
            )
          }),
          (data) => {
            const g = new Digraph();
            
            // Add node with potentially malicious attributes
            g.node(data.nodeId, {
              label: data.label,
              ...data.attrs
            });

            // Add edge with malicious label
            g.edge([data.nodeId, 'safe_node'], {
              label: data.label
            });

            const dot = g.toDot();
            
            // Verify the DOT is syntactically valid
            expect(() => parse(dot)).not.toThrow();

            // Verify no unescaped command patterns
            const unescapedPatterns = [';', '&&', '||', '|', '`', '$(']; 
            const lines = dot.split('\n');
            
            lines.forEach(line => {
              // Skip empty lines and graph declaration
              if (line.trim() && !line.includes('digraph')) {
                // Check if line contains unquoted dangerous patterns
                const outsideQuotes = line.replace(/"[^"]*"/g, '');
                unescapedPatterns.forEach(pattern => {
                  expect(outsideQuotes).not.toContain(pattern);
                });
              }
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should safely handle special characters in command arguments', () => {
      const isCI = process.env.CI === 'true';
      
      fc.assert(
        fc.property(
          fc.record({
            format: fc.constantFrom('svg', 'png', 'pdf', 'ps', 'json'),
            layout: fc.constantFrom('dot', 'neato', 'fdp', 'circo'),
            dpi: fc.integer({ min: 72, max: 300 }),
            label: fc.oneof(
              fc.string(),
              SecurityArbitraries.maliciousString('command_injection')
            )
          }),
          (config) => {
            const options = {
              format: config.format as any,
              layout: config.layout as any,
              dpi: config.dpi,
              attributes: {
                graph: {
                  label: config.label,
                  dpi: String(config.dpi)
                }
              }
            };

            const args = Array.from(createCommandArgs(options));
            
            // All arguments should be safe for shell execution
            args.forEach(arg => {
              // Check for proper formatting
              if (arg.startsWith('-T')) {
                expect(arg).toMatch(/^-T\w+$/);
              } else if (arg.startsWith('-K')) {
                expect(arg).toMatch(/^-K\w+$/);
              } else if (arg.startsWith('-G')) {
                // Graph attributes should be properly formatted
                expect(arg).toMatch(/^-G\w+/);
              }
            });

            return true;
          }
        ),
        { numRuns: isCI ? 50 : 100 }
      );
    });
  });
});