import {
  type Compass,
  type ForwardRefNode,
  isCompass,
  isForwardRefNode,
  isNodeRef,
  isNodeRefGroupLike,
  isNodeRefLike,
  type NodeModel,
  toNodeRef,
  toNodeRefGroup,
} from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';

describe('Node Reference Utilities', () => {
  describe('isForwardRefNode', () => {
    it('should return true for valid ForwardRefNode objects', () => {
      const forwardRef: ForwardRefNode = { id: 'node1' };
      expect(isForwardRefNode(forwardRef)).toBe(true);
    });

    it('should return false for objects without id', () => {
      expect(isForwardRefNode({})).toBe(false);
      expect(isForwardRefNode({ name: 'test' })).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isForwardRefNode('string')).toBe(false);
      expect(isForwardRefNode(123)).toBe(false);
      expect(isForwardRefNode(null)).toBe(false);
      expect(isForwardRefNode(undefined)).toBe(false);
    });

    it('should return false for objects with non-string id', () => {
      expect(isForwardRefNode({ id: 123 })).toBe(false);
      expect(isForwardRefNode({ id: {} })).toBe(false);
    });
  });

  describe('isNodeRef', () => {
    it('should return true for NodeModel objects', () => {
      const nodeModel: Partial<NodeModel> = {
        $$type: 'Node',
        id: 'node1',
      };
      expect(isNodeRef(nodeModel)).toBe(true);
    });

    it('should return true for ForwardRefNode objects', () => {
      const forwardRef: ForwardRefNode = { id: 'node1' };
      expect(isNodeRef(forwardRef)).toBe(true);
    });

    it('should return false for other objects', () => {
      expect(isNodeRef({})).toBe(false);
      expect(isNodeRef('string')).toBe(false);
      expect(isNodeRef(123)).toBe(false);
    });
  });

  describe('isNodeRefLike', () => {
    it('should return true for strings', () => {
      expect(isNodeRefLike('node1')).toBe(true);
      expect(isNodeRefLike('node1:port')).toBe(true);
      expect(isNodeRefLike('')).toBe(true);
    });

    it('should return true for NodeRef objects', () => {
      const nodeModel: Partial<NodeModel> = {
        $$type: 'Node',
        id: 'node1',
      };
      expect(isNodeRefLike(nodeModel)).toBe(true);

      const forwardRef: ForwardRefNode = { id: 'node1' };
      expect(isNodeRefLike(forwardRef)).toBe(true);
    });

    it('should return false for other types', () => {
      expect(isNodeRefLike(123)).toBe(false);
      expect(isNodeRefLike({})).toBe(false);
      expect(isNodeRefLike(null)).toBe(false);
      expect(isNodeRefLike(undefined)).toBe(false);
    });
  });

  describe('isNodeRefGroupLike', () => {
    it('should return true for arrays of NodeRefLike', () => {
      expect(isNodeRefGroupLike(['node1', 'node2'])).toBe(true);
      expect(isNodeRefGroupLike(['node1:port', 'node2:port:n'])).toBe(true);
      expect(isNodeRefGroupLike([])).toBe(true);
    });

    it('should return true for arrays containing NodeRef objects', () => {
      const forwardRef: ForwardRefNode = { id: 'node1' };
      expect(isNodeRefGroupLike([forwardRef, 'node2'])).toBe(true);
    });

    it('should return false for arrays with invalid elements', () => {
      expect(isNodeRefGroupLike(['node1', 123] as any)).toBe(false);
      expect(isNodeRefGroupLike([{}, 'node2'] as any)).toBe(false);
    });

    it('should return false for non-arrays', () => {
      expect(isNodeRefGroupLike('node1' as any)).toBe(false);
      expect(isNodeRefGroupLike(123 as any)).toBe(false);
      expect(isNodeRefGroupLike({} as any)).toBe(false);
    });
  });

  describe('isCompass', () => {
    it('should return true for valid compass directions', () => {
      const validDirections: Compass[] = [
        'n',
        'ne',
        'e',
        'se',
        's',
        'sw',
        'w',
        'nw',
        'c',
      ];
      for (const direction of validDirections) {
        expect(isCompass(direction)).toBe(true);
      }
    });

    it('should return false for invalid compass directions', () => {
      expect(isCompass('north')).toBe(false);
      expect(isCompass('northeast')).toBe(false);
      expect(isCompass('invalid')).toBe(false);
      expect(isCompass('')).toBe(false);
      expect(isCompass('N')).toBe(false); // case sensitive
    });
  });

  describe('toNodeRef', () => {
    it('should return NodeRef as-is', () => {
      const forwardRef: ForwardRefNode = { id: 'node1' };
      expect(toNodeRef(forwardRef)).toBe(forwardRef);
    });

    it('should convert simple string to NodeRef', () => {
      const result = toNodeRef('node1');
      expect(result).toEqual({ id: 'node1', port: undefined });
    });

    it('should convert string with port to NodeRef', () => {
      const result = toNodeRef('node1:port1');
      expect(result).toEqual({ id: 'node1', port: 'port1' });
    });

    it('should convert string with port and compass to NodeRef', () => {
      const result = toNodeRef('node1:port1:n');
      expect(result).toEqual({ id: 'node1', port: 'port1', compass: 'n' });
    });

    it('should handle invalid compass directions', () => {
      const result = toNodeRef('node1:port1:invalid');
      expect(result).toEqual({ id: 'node1', port: 'port1' });
    });

    it('should handle empty parts', () => {
      expect(toNodeRef('node1::')).toEqual({ id: 'node1', port: '' });
      expect(toNodeRef('node1::n')).toEqual({
        id: 'node1',
        port: '',
        compass: 'n',
      });
    });
  });

  describe('toNodeRefGroup', () => {
    it('should convert array of strings to NodeRefGroup', () => {
      const result = toNodeRefGroup(['node1', 'node2:port']);
      expect(result).toEqual([
        { id: 'node1', port: undefined },
        { id: 'node2', port: 'port' },
      ]);
    });

    it('should handle mixed NodeRefLike array', () => {
      const forwardRef: ForwardRefNode = { id: 'existing' };
      const result = toNodeRefGroup([forwardRef, 'node1:port:n']);
      expect(result).toEqual([
        forwardRef,
        { id: 'node1', port: 'port', compass: 'n' },
      ]);
    });

    it('should throw error for empty array', () => {
      expect(() => toNodeRefGroup([])).toThrow(
        'EdgeTargets must have at least 1 elements.',
      );
    });

    it('should throw error for invalid elements', () => {
      expect(() => toNodeRefGroup([123] as any)).toThrow(
        'The element of Edge target is missing or not satisfied as Edge target.',
      );
    });

    it('should handle complex node references', () => {
      const result = toNodeRefGroup([
        'simple',
        'with:port',
        'with:port:se',
        'empty::',
        'compass::nw',
      ]);

      expect(result).toEqual([
        { id: 'simple', port: undefined },
        { id: 'with', port: 'port' },
        { id: 'with', port: 'port', compass: 'se' },
        { id: 'empty', port: '' },
        { id: 'compass', port: '', compass: 'nw' },
      ]);
    });
  });
});
