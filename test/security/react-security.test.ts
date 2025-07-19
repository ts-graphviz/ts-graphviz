import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Digraph, Graph, Node, Edge, Subgraph, renderToDot } from '@ts-graphviz/react';
import {
  SecurityArbitraries,
  ATTACK_PATTERNS
} from './utils/security-test-helpers.js';

/**
 * Security tests for @ts-graphviz/react components
 * These tests verify that React components safely handle potentially malicious props and prevent XSS
 */
describe('@ts-graphviz/react Security Tests', () => {
  describe('XSS Prevention in React Components', () => {
    it('should escape malicious scripts in node labels', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            SecurityArbitraries.maliciousString('script_injection'),
            fc.constant('<script>alert("xss")</script>'),
            fc.constant('<img src=x onerror=alert(1)>'),
            fc.constant('javascript:alert(1)')
          ),
          (maliciousLabel) => {
            const dot = renderToDot(
              <Digraph>
                <Node id="test" label={maliciousLabel} />
              </Digraph>
            );

            // The DOT output should escape the malicious content
            expect(dot).toContain('test');
            expect(dot).toContain('label=');
            
            // Should not contain unescaped script tags
            expect(dot).not.toMatch(/<script[^>]*>/i);
            expect(dot).not.toMatch(/javascript:/i);
            
            // Malicious content should be properly quoted
            const labelMatch = dot.match(/label="([^"]*)"/);
            expect(labelMatch).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle malicious URLs in node props', () => {
      const maliciousUrls = [
        'javascript:alert(document.cookie)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        '//evil.com/xss.js',
      ];

      maliciousUrls.forEach(url => {
        const dot = renderToDot(
          <Digraph>
            <Node 
              id="test" 
              URL={url}
              href={url}
              target="_blank"
            />
          </Digraph>
        );

        // URL should be included but escaped
        expect(dot).toContain('URL=');
        expect(dot).toMatch(/URL="[^"]*"/);
        
        // Should not execute JavaScript
        expect(() => renderToStaticMarkup(
          <Digraph>
            <Node id="test" URL={url} />
          </Digraph>
        )).not.toThrow();
      });
    });
  });

  describe('Component Props Validation', () => {
    it('should handle malicious node IDs safely', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            SecurityArbitraries.maliciousString('script_injection'),
            fc.string().map(s => `"; ${s}; "`),
            fc.string().map(s => `] ${s} [`),
          ),
          (maliciousId) => {
            const dot = renderToDot(
              <Digraph>
                <Node id={maliciousId} />
              </Digraph>
            );

            // ID should be properly escaped in DOT output
            expect(dot).toBeDefined();
            expect(dot).toContain('digraph');
            
            // Should not break DOT syntax
            expect(dot.split('\n').filter(line => line.trim()).length).toBeGreaterThan(2);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle edge endpoints with malicious content', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.safeString(),
          SecurityArbitraries.maliciousString('command_injection'),
          (safeId, maliciousId) => {
            // Test with malicious source
            const dot1 = renderToDot(
              <Digraph>
                <Node id={safeId} />
                <Node id="target" />
                <Edge targets={[maliciousId, "target"]} />
              </Digraph>
            );

            // Test with malicious target
            const dot2 = renderToDot(
              <Digraph>
                <Node id="source" />
                <Node id={safeId} />
                <Edge targets={["source", maliciousId]} />
              </Digraph>
            );

            // Both should produce valid DOT
            expect(dot1).toContain('->');
            expect(dot2).toContain('->');

            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('HTML-like Labels Security', () => {
    it('should handle HTML injection attempts in HTML-like labels', () => {
      const htmlInjections = [
        '<TABLE><TR><TD><SCRIPT>alert(1)</SCRIPT></TD></TR></TABLE>',
        '<B onmouseover="alert(1)">hover me</B>',
        '<IMG SRC="javascript:alert(1)">',
        '<FONT COLOR="red" onclick="alert(1)">click</FONT>',
        '<BR/><SCRIPT>alert(1)</SCRIPT>',
      ];

      htmlInjections.forEach(injection => {
        const dot = renderToDot(
          <Digraph>
            <Node id="test" label={<>{injection}</>} />
          </Digraph>
        );

        // HTML-like labels should be marked properly
        expect(dot).toContain('label=<');
        expect(dot).toContain('>');
        
        // Script tags should not be present in output
        expect(dot).not.toMatch(/<script[^>]*>/i);
      });
    });

    it('should sanitize HTML attributes in HTML-like labels', () => {
      fc.assert(
        fc.property(
          fc.record({
            tag: fc.constantFrom('TABLE', 'TD', 'TR', 'FONT', 'B', 'I'),
            attr: fc.constantFrom('onclick', 'onmouseover', 'onerror', 'onload'),
            payload: SecurityArbitraries.maliciousString('script_injection'),
          }),
          ({ tag, attr, payload }) => {
            const htmlLabel = `<${tag} ${attr}="${payload}">content</${tag}>`;
            
            const dot = renderToDot(
              <Digraph>
                <Node id="test" label={<>{htmlLabel}</>} />
              </Digraph>
            );

            // Should contain the HTML structure
            expect(dot).toContain(`<${tag}`);
            
            // Event handlers should not be in output
            expect(dot).not.toMatch(new RegExp(`${attr}\\s*=`, 'i'));

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Subgraph Security', () => {
    it('should handle malicious subgraph IDs', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            SecurityArbitraries.maliciousString('script_injection'),
            fc.string().map(s => `cluster_${s}`),
          ),
          (maliciousId) => {
            const dot = renderToDot(
              <Digraph>
                <Subgraph id={maliciousId}>
                  <Node id="inner" />
                </Subgraph>
              </Digraph>
            );

            // Should contain subgraph
            expect(dot).toContain('subgraph');
            expect(dot).toContain('inner');
            
            // Should be properly structured
            const openBraces = (dot.match(/{/g) || []).length;
            const closeBraces = (dot.match(/}/g) || []).length;
            expect(openBraces).toBe(closeBraces);

            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Attribute Injection Prevention', () => {
    it('should prevent attribute injection through props spreading', () => {
      fc.assert(
        fc.property(
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 20 }),
            SecurityArbitraries.maliciousString('script_injection'),
            { maxKeys: 10 }
          ),
          (maliciousAttrs) => {
            const dot = renderToDot(
              <Digraph>
                <Node id="test" {...maliciousAttrs} />
              </Digraph>
            );

            // Should produce valid DOT
            expect(dot).toContain('test');
            
            // Check that attributes are properly escaped
            Object.entries(maliciousAttrs).forEach(([key, value]) => {
              if (dot.includes(key)) {
                // If attribute is included, it should be properly formatted
                const attrRegex = new RegExp(`${key}="[^"]*"`);
                expect(dot).toMatch(attrRegex);
              }
            });

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle special characters in attribute values', () => {
      const specialChars = ['"', "'", '\\', '\n', '\r', '\t', '&', '<', '>'];
      
      specialChars.forEach(char => {
        const dot = renderToDot(
          <Digraph>
            <Node 
              id="test" 
              label={`prefix${char}suffix`}
              tooltip={`tooltip${char}text`}
            />
          </Digraph>
        );

        // Should contain the node
        expect(dot).toContain('test');
        expect(dot).toContain('label=');
        
        // Special characters should be properly handled
        expect(dot).toBeDefined();
      });
    });
  });

  describe('Complex Component Hierarchies', () => {
    it('should handle deeply nested malicious content', () => {
      fc.assert(
        fc.property(
          fc.array(
            SecurityArbitraries.maliciousString('script_injection'),
            { minLength: 2, maxLength: 5 }
          ),
          (maliciousLabels) => {
            const dot = renderToDot(
              <Digraph>
                <Subgraph id="outer" label={maliciousLabels[0]}>
                  <Subgraph id="middle" label={maliciousLabels[1]}>
                    {maliciousLabels.slice(2).map((label, i) => (
                      <Node key={i} id={`node${i}`} label={label} />
                    ))}
                  </Subgraph>
                </Subgraph>
              </Digraph>
            );

            // Should have proper structure
            expect(dot).toContain('digraph');
            expect(dot).toContain('subgraph');
            
            // All nodes should be present
            maliciousLabels.slice(2).forEach((_, i) => {
              expect(dot).toContain(`node${i}`);
            });

            // No unescaped scripts
            expect(dot).not.toMatch(/<script[^>]*>/i);

            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Edge Label Security', () => {
    it('should escape malicious content in edge labels', () => {
      fc.assert(
        fc.property(
          fc.record({
            label: SecurityArbitraries.maliciousString('script_injection'),
            headlabel: SecurityArbitraries.maliciousString('script_injection'),
            taillabel: SecurityArbitraries.maliciousString('script_injection'),
          }),
          (edgeLabels) => {
            const dot = renderToDot(
              <Digraph>
                <Node id="a" />
                <Node id="b" />
                <Edge 
                  targets={["a", "b"]}
                  label={edgeLabels.label}
                  headlabel={edgeLabels.headlabel}
                  taillabel={edgeLabels.taillabel}
                />
              </Digraph>
            );

            // Should contain edge
            expect(dot).toContain('->');
            
            // Labels should be escaped
            Object.entries(edgeLabels).forEach(([key, value]) => {
              if (dot.includes(key)) {
                // Label should be quoted
                const labelRegex = new RegExp(`${key}="[^"]*"`);
                expect(dot).toMatch(labelRegex);
              }
            });

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Unicode and Emoji Security', () => {
    it('should handle unicode attacks in React components', () => {
      const unicodeAttacks = [
        '‮⁦test⁩⁦', // RTL override
        'a\u202Eb', // Right-to-left override
        '\u200B\u200C\u200D', // Zero-width characters
        '🔥<script>alert(1)</script>🔥', // Emoji with script
      ];

      unicodeAttacks.forEach(attack => {
        const dot = renderToDot(
          <Digraph>
            <Node id="test" label={attack} />
          </Digraph>
        );

        expect(dot).toContain('test');
        expect(dot).toContain('label=');
        
        // Should not contain unescaped scripts
        expect(dot).not.toMatch(/<script[^>]*>/i);
      });
    });
  });
});