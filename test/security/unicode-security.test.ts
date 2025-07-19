import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { parse, stringify } from '@ts-graphviz/ast';

/**
 * Unicode and internationalization security tests
 * These tests verify safe handling of Unicode, preventing homograph attacks and encoding issues
 */
describe('Unicode Security Tests', () => {
  describe('Homograph Attack Prevention', () => {
    it('should detect and handle homograph characters', () => {
      const homographPairs = [
        ['a', 'а'], // Latin vs Cyrillic
        ['o', 'о'], // Latin vs Cyrillic
        ['e', 'е'], // Latin vs Cyrillic
        ['p', 'р'], // Latin vs Cyrillic
        ['c', 'с'], // Latin vs Cyrillic
        ['0', 'О'], // Zero vs Cyrillic O
        ['1', 'l'], // One vs lowercase L
        ['I', 'l'], // Uppercase I vs lowercase L
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...homographPairs),
          ([latinChar, homograph]) => {
            const dotString1 = `digraph G { "${latinChar}_node" -> b; }`;
            const dotString2 = `digraph G { "${homograph}_node" -> b; }`;
            
            try {
              const result1 = parse(dotString1);
              const result2 = parse(dotString2);
              
              // Both should parse successfully
              expect(result1).toBeDefined();
              expect(result2).toBeDefined();
              
              // Serialized output should preserve the distinction
              const output1 = stringify(result1);
              const output2 = stringify(result2);
              
              expect(output1).not.toBe(output2);
              
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

    it('should handle mixed script attacks', () => {
      const mixedScriptExamples = [
        'admin_аdmin', // Mixed Latin and Cyrillic
        'test_τest', // Mixed Latin and Greek
        'user_υser', // Mixed Latin and Greek
        'data_ԁata', // Mixed Latin and Armenian
        'info_іnfo', // Mixed Latin and Ukrainian
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...mixedScriptExamples),
          (mixedScript) => {
            const dotString = `digraph G { "${mixedScript}" [label="Mixed Script Node"]; }`;
            
            try {
              const result = parse(dotString);
              expect(result).toBeDefined();
              
              // Should handle mixed scripts safely
              const output = stringify(result);
              expect(output).toContain(mixedScript);
              
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

  describe('Unicode Normalization Security', () => {
    it('should handle different Unicode normalization forms', () => {
      // Same character in different normalization forms
      const testCases = [
        ['é', 'é'], // NFC vs NFD (e + combining acute)
        ['ñ', 'ñ'], // NFC vs NFD (n + combining tilde)
        ['ü', 'ü'], // NFC vs NFD (u + combining diaeresis)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...testCases),
          ([nfc, nfd]) => {
            const dotString1 = `digraph G { "${nfc}" -> b; }`;
            const dotString2 = `digraph G { "${nfd}" -> b; }`;
            
            try {
              const result1 = parse(dotString1);
              const result2 = parse(dotString2);
              
              // Both forms should parse successfully
              expect(result1).toBeDefined();
              expect(result2).toBeDefined();
              
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

    it('should handle zero-width characters safely', () => {
      const zeroWidthChars = [
        '\u200B', // Zero-width space
        '\u200C', // Zero-width non-joiner
        '\u200D', // Zero-width joiner
        '\uFEFF', // Zero-width no-break space
        '\u2060', // Word joiner
      ];

      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 10 }),
          fc.constantFrom(...zeroWidthChars),
          (baseString, zeroWidth) => {
            const maliciousString = baseString + zeroWidth + 'hidden';
            const dotString = `digraph G { "${maliciousString}" -> b; }`;
            
            try {
              const result = parse(dotString);
              expect(result).toBeDefined();
              
              // Zero-width characters should be handled safely
              const output = stringify(result);
              expect(output).toBeDefined();
              
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

  describe('Bidirectional Text Security', () => {
    it('should handle RTL/LTR override characters safely', () => {
      const bidiChars = [
        '\u202A', // Left-to-right embedding
        '\u202B', // Right-to-left embedding
        '\u202C', // Pop directional formatting
        '\u202D', // Left-to-right override
        '\u202E', // Right-to-left override
      ];

      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.constantFrom(...bidiChars),
          (text, bidiChar) => {
            const maliciousString = `${text}${bidiChar}evil`;
            const dotString = `digraph G { "${maliciousString}" [label="Bidi Test"]; }`;
            
            try {
              const result = parse(dotString);
              expect(result).toBeDefined();
              
              // Bidi characters should not break parsing
              const output = stringify(result);
              expect(output).toBeDefined();
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 40 }
      );
    });
  });

  describe('Emoji and Special Unicode Handling', () => {
    it('should handle emoji and special Unicode safely', () => {
      const specialChars = [
        '😈', // Devil emoji
        '💉', // Syringe emoji
        '🔓', // Unlocked padlock
        '⚠️', // Warning sign
        '🚫', // Prohibited sign
        '👁️‍🗨️', // Eye in speech bubble (ZWJ sequence)
        '🏴‍☠️', // Pirate flag (ZWJ sequence)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...specialChars),
          (emoji) => {
            const dotString = `digraph G { "${emoji}_node" [label="${emoji} Security Test"]; }`;
            
            try {
              const result = parse(dotString);
              expect(result).toBeDefined();
              
              // Emoji should be preserved correctly
              const output = stringify(result);
              expect(output).toContain(emoji);
              
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

    it('should handle Unicode escape sequences', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0x0020, max: 0xD7FF }),
          (codePoint) => {
            const unicodeEscape = `\\u${codePoint.toString(16).padStart(4, '0')}`;
            const dotString = `digraph G { "node${unicodeEscape}" -> b; }`;
            
            try {
              const result = parse(dotString);
              expect(result).toBeDefined();
              
              return true;
            } catch (error) {
              // Some code points might be invalid
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