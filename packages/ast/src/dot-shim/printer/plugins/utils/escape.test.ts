import { describe, expect, test } from 'vitest';
import { escape } from './escape.js';

describe('escape', () => {
  test.each([
    ['\r', '\\r'],
    ['\n', '\\n'],
    ['"', '\\"'],
    [String.raw`a\la`, String.raw`a\la`],
  ])('should escape %s to %s', (value, expected) => {
    expect(escape(value)).toBe(expected);
  });

  test('should escape multiple characters', () => {
    expect(escape('\r\n"')).toBe(String.raw`\r\n\"`);
  });

  test('should not escape other characters', () => {
    expect(escape('abc')).toBe('abc');
  });

  test('should not escape escaped characters', () => {
    expect(escape(String.raw`\r\n\"`)).toBe(String.raw`\r\n\"`);
  });

  test('should not escape empty string', () => {
    expect(escape('')).toBe('');
  });

  describe('DOT injection prevention', () => {
    test('should escape semicolons in node IDs to prevent statement injection', () => {
      const malicious = 'node1"; injected_node [label="owned"]; dummy="';
      const escaped = escape(malicious);
      // The escaped output should not contain unescaped quotes that could break out
      expect(escaped).toBe(
        'node1\\"; injected_node [label=\\"owned\\"]; dummy=\\"',
      );
    });

    test('should handle edge operator injection attempts', () => {
      const malicious = 'node1" -> "malicious';
      const escaped = escape(malicious);
      expect(escaped).toBe('node1\\" -> \\"malicious');
    });

    test('should handle bracket injection with newlines', () => {
      const malicious = 'node1"\n} malicious { node';
      const escaped = escape(malicious);
      expect(escaped).toBe('node1\\"\\n} malicious { node');
    });

    test('should handle closing brace injection', () => {
      const malicious = 'node1" } digraph evil { "node2';
      const escaped = escape(malicious);
      expect(escaped).toBe('node1\\" } digraph evil { \\"node2');
    });

    test('should handle attribute injection with equals sign', () => {
      const malicious = 'node1" [color="red"] "node2';
      const escaped = escape(malicious);
      expect(escaped).toBe('node1\\" [color=\\"red\\"] \\"node2');
    });

    test('should handle multiple quote injection attempts', () => {
      const malicious = '""""""';
      const escaped = escape(malicious);
      // 6 quotes become 6 escaped quotes
      expect(escaped).toBe(String.raw`\"\"\"\"\"\"`);
    });

    test('should handle mixed newlines and quotes', () => {
      const malicious = 'line1"\n"line2"\r"line3';
      const escaped = escape(malicious);
      expect(escaped).toBe('line1\\"\\n\\"line2\\"\\r\\"line3');
    });

    test('should handle subgraph injection attempts', () => {
      const malicious =
        'sg1"; subgraph cluster_evil { rank=same; "a"; "b"} "sg2';
      const escaped = escape(malicious);
      expect(escaped).toBe(
        'sg1\\"; subgraph cluster_evil { rank=same; \\"a\\"; \\"b\\"} \\"sg2',
      );
    });

    test('should handle edge chain injection', () => {
      const malicious = 'a" -> "b" -> "c" -> "d';
      const escaped = escape(malicious);
      expect(escaped).toBe('a\\" -> \\"b\\" -> \\"c\\" -> \\"d');
    });

    test('should handle HTML-like label injection with quotes', () => {
      const malicious =
        'node1" label=<table><tr><td>"cell"</td></tr></table> "node2';
      const escaped = escape(malicious);
      expect(escaped).toBe(
        'node1\\" label=<table><tr><td>\\"cell\\"</td></tr></table> \\"node2',
      );
    });

    test('should handle port injection', () => {
      const malicious = 'node1":port1 -> "node2":port2 "dummy';
      const escaped = escape(malicious);
      expect(escaped).toBe('node1\\":port1 -> \\"node2\\":port2 \\"dummy');
    });

    test('should handle backslash before quote (already escaped)', () => {
      const malicious = 'node1\\" already escaped';
      const escaped = escape(malicious);
      // Should not double-escape
      expect(escaped).toBe('node1\\" already escaped');
    });

    test('should remove null bytes to prevent parsing errors', () => {
      const malicious = 'node1"\x00injected';
      const escaped = escape(malicious);
      // Null bytes are removed because Graphviz treats them as string terminators
      expect(escaped).toBe('node1\\"injected');
    });

    test('should remove multiple null bytes', () => {
      const malicious = 'node\x00with\x00\x00nulls';
      const escaped = escape(malicious);
      expect(escaped).toBe('nodewithnulls');
    });

    test('should handle unicode with quotes', () => {
      const malicious = 'ノード1"日本語"ノード2';
      const escaped = escape(malicious);
      expect(escaped).toBe('ノード1\\"日本語\\"ノード2');
    });

    test('should handle strict keyword injection', () => {
      const malicious = 'g1" strict digraph evil { "node';
      const escaped = escape(malicious);
      expect(escaped).toBe('g1\\" strict digraph evil { \\"node');
    });
  });
});
