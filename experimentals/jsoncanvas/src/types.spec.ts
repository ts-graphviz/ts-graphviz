import { describe, expect, it } from 'vitest';
import { BackgroundStyle, CanvasColor, EdgeEnd, EdgeSide } from './types.js';

describe('CanvasColor', () => {
  it('should return the correct color value', () => {
    expect(CanvasColor.red).toBe('1');
    expect(CanvasColor.orange).toBe('2');
    expect(CanvasColor.yellow).toBe('3');
    expect(CanvasColor.green).toBe('4');
    expect(CanvasColor.cyan).toBe('5');
    expect(CanvasColor.purple).toBe('6');
  });

  describe('function assert', () => {
    it('should not throw an error for valid CanvasColor', () => {
      expect(() => CanvasColor.assert('1')).not.toThrow();
      expect(() => CanvasColor.assert('#123456')).not.toThrow();
      expect(() => CanvasColor.assert('#abcdef')).not.toThrow();
      expect(() => CanvasColor.assert('#ABCDEF')).not.toThrow();
    });

    it('should throw an error for invalid CanvasColor', () => {
      expect(() => CanvasColor.assert('7')).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid CanvasColor: 7]`,
      );
      expect(() =>
        CanvasColor.assert('123456'),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid CanvasColor: 123456]`,
      );
      expect(() =>
        CanvasColor.assert('#123'),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid CanvasColor: #123]`,
      );
      expect(() =>
        CanvasColor.assert('#gggggg'),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid CanvasColor: #gggggg]`,
      );
    });
  });
});

describe('BackgroundStyle', () => {
  it('should return the correct background style value', () => {
    expect(BackgroundStyle.cover).toBe('cover');
    expect(BackgroundStyle.ratio).toBe('ratio');
    expect(BackgroundStyle.repeat).toBe('repeat');
  });

  describe('function assert', () => {
    it('should not throw an error for valid BackgroundStyle', () => {
      expect(() => BackgroundStyle.assert('cover')).not.toThrow();
      expect(() => BackgroundStyle.assert('ratio')).not.toThrow();
      expect(() => BackgroundStyle.assert('repeat')).not.toThrow();
    });

    it('should throw an error for invalid BackgroundStyle', () => {
      expect(() =>
        BackgroundStyle.assert('invalid'),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid group node background style: invalid]`,
      );
    });
  });

  describe('function validate', () => {
    it('should return true for valid BackgroundStyle', () => {
      expect(BackgroundStyle.validate('cover')).toBe(true);
      expect(BackgroundStyle.validate('ratio')).toBe(true);
      expect(BackgroundStyle.validate('repeat')).toBe(true);
    });

    it('should return false for invalid BackgroundStyle', () => {
      expect(BackgroundStyle.validate('invalid')).toBe(false);
    });
  });
});

describe('EdgeSide', () => {
  it('should return the correct edge side value', () => {
    expect(EdgeSide.top).toBe('top');
    expect(EdgeSide.right).toBe('right');
    expect(EdgeSide.bottom).toBe('bottom');
    expect(EdgeSide.left).toBe('left');
  });

  describe('function assert', () => {
    it('should not throw an error for valid EdgeSide', () => {
      expect(() => EdgeSide.assert('top')).not.toThrow();
      expect(() => EdgeSide.assert('right')).not.toThrow();
      expect(() => EdgeSide.assert('bottom')).not.toThrow();
      expect(() => EdgeSide.assert('left')).not.toThrow();
    });

    it('should throw an error for invalid EdgeSide', () => {
      expect(() =>
        EdgeSide.assert('invalid'),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge side: invalid]`,
      );
    });
  });

  describe('function validate', () => {
    it('should return true for valid EdgeSide', () => {
      expect(EdgeSide.validate('top')).toBe(true);
      expect(EdgeSide.validate('right')).toBe(true);
      expect(EdgeSide.validate('bottom')).toBe(true);
      expect(EdgeSide.validate('left')).toBe(true);
    });

    it('should return false for invalid EdgeSide', () => {
      expect(EdgeSide.validate('invalid')).toBe(false);
    });
  });
});

describe('EdgeEnd', () => {
  it('should return the correct edge end value', () => {
    expect(EdgeEnd.arrow).toBe('arrow');
    expect(EdgeEnd.none).toBe('none');
  });

  describe('function assert', () => {
    it('should not throw an error for valid EdgeEnd', () => {
      expect(() => EdgeEnd.assert('arrow')).not.toThrow();
      expect(() => EdgeEnd.assert('none')).not.toThrow();
    });

    it('should throw an error for invalid EdgeEnd', () => {
      expect(() =>
        EdgeEnd.assert('invalid'),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge end: invalid]`,
      );
    });
  });

  describe('function validate', () => {
    it('should return true for valid EdgeEnd', () => {
      expect(EdgeEnd.validate('arrow')).toBe(true);
      expect(EdgeEnd.validate('none')).toBe(true);
    });

    it('should return false for invalid EdgeEnd', () => {
      expect(EdgeEnd.validate('invalid')).toBe(false);
    });
  });
});
