import { describe, expect, test } from 'vitest';
import { escapeComment } from './escape-comment.js';

describe('escapeComment', () => {
  describe('Block comments', () => {
    test('should escape */ sequence to prevent comment injection', () => {
      const malicious = 'test */ digraph { a -> b; } /*';
      const escaped = escapeComment(malicious, 'Block');
      // Zero-width space (U+200B) is inserted between * and /
      expect(escaped).toBe('test *\u200B/ digraph { a -> b; } /*');
      expect(escaped).not.toContain('*/');
    });

    test('should escape multiple */ sequences', () => {
      const malicious = 'first */ second */ third */';
      const escaped = escapeComment(malicious, 'Block');
      expect(escaped).toBe('first *\u200B/ second *\u200B/ third *\u200B/');
    });

    test('should not modify normal block comment content', () => {
      const normal = 'This is a normal comment\nwith multiple lines';
      const escaped = escapeComment(normal, 'Block');
      expect(escaped).toBe(normal);
    });

    test('should handle edge case with * and / separately', () => {
      const content = 'test * and / separately';
      const escaped = escapeComment(content, 'Block');
      expect(escaped).toBe(content);
    });

    test('should remove null bytes', () => {
      const malicious = 'test\0null\0byte';
      const escaped = escapeComment(malicious, 'Block');
      expect(escaped).toBe('testnullbyte');
    });
  });

  describe('Slash comments', () => {
    test('should not escape */ in slash comments', () => {
      const content = 'test */ content';
      const escaped = escapeComment(content, 'Slash');
      expect(escaped).toBe(content);
    });

    test('should remove null bytes', () => {
      const malicious = 'test\0null';
      const escaped = escapeComment(malicious, 'Slash');
      expect(escaped).toBe('testnull');
    });
  });

  describe('Macro comments', () => {
    test('should not escape */ in macro comments', () => {
      const content = 'test */ content';
      const escaped = escapeComment(content, 'Macro');
      expect(escaped).toBe(content);
    });

    test('should remove null bytes', () => {
      const malicious = 'test\0null';
      const escaped = escapeComment(malicious, 'Macro');
      expect(escaped).toBe('testnull');
    });
  });

  describe('Security test cases', () => {
    test('should prevent DOT syntax injection via block comment', () => {
      const injection =
        'comment */ digraph malicious { x -> y [label="pwned"]; } /**';
      const escaped = escapeComment(injection, 'Block');

      // The escaped version should not contain */ which would close the comment early
      expect(escaped).not.toContain('*/');
      expect(escaped).toContain('*\u200B/');
    });

    test('should handle complex nested patterns', () => {
      const complex = '/* nested */ */ more /* nesting */';
      const escaped = escapeComment(complex, 'Block');
      expect(escaped).toBe(
        '/* nested *\u200B/ *\u200B/ more /* nesting *\u200B/',
      );
    });
  });
});
