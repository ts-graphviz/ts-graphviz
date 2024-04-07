import { describe, expect, it } from 'vitest';
import { Edge, JSONCanvas, Node, NodeType } from './schema.js';
import { EdgeEnd, EdgeSide } from './types.js';

describe('Node', () => {
  describe('function assert', () => {
    it.each([
      {
        id: 'id',
        type: 'text',
        text: 'Hello, World!',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        color: '1',
      },
      {
        id: 'id',
        type: 'file',
        file: 'file.txt',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        color: '#000000',
      },
      {
        id: 'id',
        type: 'link',
        url: 'https://example.com',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        color: '6',
      },
      {
        id: 'id',
        type: 'group',
        label: 'Group',
        background: '1',
        backgroundStyle: 'cover',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    ])('should not throw an error for valid $type Node', (node) => {
      expect(() => Node.assert(node)).not.toThrow();
    });

    it.each([
      {
        id: 'id',
        type: 'text',
        text: 1,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        color: '1',
      },
      {
        id: 'id',
        type: 'file',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        color: '#000000',
      },
      {
        id: 'id',
        type: 'link',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        color: '6',
      },
      { id: 'id', type: 'uknown', x: 0, y: 0, width: 100, height: 100 },
    ])('should throw an error for invalid $type Node', (node) => {
      expect(() => Node.assert(node)).toThrowError();
    });
  });
});

describe('Edge', () => {
  describe('function assert', () => {
    it('should not throw an error for valid Edge', () => {
      const validEdge = {
        id: 'edgeId',
        fromNode: 'node1',
        toNode: 'node2',
        fromSide: 'left',
        toSide: 'right',
        fromEnd: 'none',
        toEnd: 'arrow',
        color: '#123456',
        label: 'Edge Label',
      };
      expect(() => Edge.assert(validEdge)).not.toThrow();
    });

    it('should throw an error for invalid Edge', () => {
      const invalidEdge = {
        id: 123,
        fromNode: 'node1',
        toNode: 'node2',
        fromSide: 'left',
        toSide: 'right',
        fromEnd: 'start',
        toEnd: 'end',
        color: '#123456',
        label: 'Edge Label',
      };
      expect(() => Edge.assert(invalidEdge)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge id]`,
      );
    });

    it('should throw an error for invalid edge source', () => {
      const invalidEdge = {
        id: 'edgeId',
        fromNode: 123,
        toNode: 'node2',
        fromSide: 'left',
        toSide: 'right',
        fromEnd: 'start',
        toEnd: 'end',
        color: '#123456',
        label: 'Edge Label',
      };
      expect(() => Edge.assert(invalidEdge)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge source]`,
      );
    });

    it('should throw an error for invalid edge target', () => {
      const invalidEdge = {
        id: 'edgeId',
        fromNode: 'node1',
        toNode: 123,
        fromSide: 'left',
        toSide: 'right',
        fromEnd: 'start',
        toEnd: 'end',
        color: '#123456',
        label: 'Edge Label',
      };
      expect(() => Edge.assert(invalidEdge)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge target]`,
      );
    });

    it('should throw an error for invalid edge fromSide', () => {
      const invalidEdge = {
        id: 'edgeId',
        fromNode: 'node1',
        toNode: 'node2',
        fromSide: 123,
        toSide: 'right',
        fromEnd: 'start',
        toEnd: 'end',
        color: '#123456',
        label: 'Edge Label',
      };
      expect(() => Edge.assert(invalidEdge)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge side: 123]`,
      );
    });

    it('should throw an error for invalid edge toSide', () => {
      const invalidEdge = {
        id: 'edgeId',
        fromNode: 'node1',
        toNode: 'node2',
        fromSide: 'left',
        toSide: 123,
        fromEnd: 'start',
        toEnd: 'end',
        color: '#123456',
        label: 'Edge Label',
      };
      expect(() => Edge.assert(invalidEdge)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge side: 123]`,
      );
    });

    it('should throw an error for invalid edge fromEnd', () => {
      const invalidEdge = {
        id: 'edgeId',
        fromNode: 'node1',
        toNode: 'node2',
        fromSide: 'left',
        toSide: 'right',
        fromEnd: 123,
        toEnd: 'end',
        color: '#123456',
        label: 'Edge Label',
      };
      expect(() => Edge.assert(invalidEdge)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge end: 123]`,
      );
    });

    it('should throw an error for invalid edge toEnd', () => {
      const invalidEdge = {
        id: 'edgeId',
        fromNode: 'node1',
        toNode: 'node2',
        fromSide: 'left',
        toSide: 'right',
        fromEnd: 'start',
        toEnd: 123,
        color: '#123456',
        label: 'Edge Label',
      };
      expect(() => Edge.assert(invalidEdge)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge end: start]`,
      );
    });

    it('should throw an error for invalid edge color', () => {
      const invalidEdge = {
        id: 'edgeId',
        fromNode: 'node1',
        toNode: 'node2',
        fromSide: 'left',
        toSide: 'right',
        fromEnd: 'start',
        toEnd: 'end',
        color: 123,
        label: 'Edge Label',
      };
      expect(() => Edge.assert(invalidEdge)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge end: start]`,
      );
    });

    it('should throw an error for invalid edge label', () => {
      const invalidEdge = {
        id: 'edgeId',
        fromNode: 'node1',
        toNode: 'node2',
        fromSide: 'left',
        toSide: 'right',
        fromEnd: 'start',
        toEnd: 'end',
        color: '#123456',
        label: 123,
      };
      expect(() => Edge.assert(invalidEdge)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge end: start]`,
      );
    });

    it('should throw an error for invalid edge', () => {
      const invalidEdge = 'invalid';
      expect(() => Edge.assert(invalidEdge)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge]`,
      );
    });
  });
});

describe('EdgeSide', () => {
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
});

describe('EdgeEnd', () => {
  describe('function assert', () => {
    it('should not throw an error for valid EdgeEnd', () => {
      expect(() => EdgeEnd.assert('none')).not.toThrow();
      expect(() => EdgeEnd.assert('arrow')).not.toThrow();
    });

    it('should throw an error for invalid EdgeEnd', () => {
      expect(() =>
        EdgeEnd.assert('invalid'),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid edge end: invalid]`,
      );
    });
  });
});

describe('NodeType', () => {
  it('should have valid values', () => {
    expect(NodeType.text).toBe('text');
    expect(NodeType.file).toBe('file');
    expect(NodeType.link).toBe('link');
    expect(NodeType.group).toBe('group');
  });

  describe('function assert', () => {
    it('should not throw an error for valid NodeType', () => {
      expect(() => NodeType.assert('text')).not.toThrow();
      expect(() => NodeType.assert('file')).not.toThrow();
      expect(() => NodeType.assert('link')).not.toThrow();
      expect(() => NodeType.assert('group')).not.toThrow();
    });

    it('should throw an error for invalid NodeType', () => {
      expect(() =>
        NodeType.assert('invalid'),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid NodeType: invalid]`,
      );
    });
  });
});

describe('JSONCanvas', () => {
  describe('function parse', () => {
    it('should parse a JSON string and return a JSONCanvasModel object', () => {
      const json = `{
        "nodes": [
          {
            "id": "node1",
            "type": "text",
            "text": "Hello, World!",
            "x": 0,
            "y": 0,
            "width": 100,
            "height": 100,
            "color": "1"
          },
          {
            "id": "node2",
            "type": "file",
            "file": "file.txt",
            "x": 0,
            "y": 0,
            "width": 100,
            "height": 100,
            "color": "#000000"
          }
        ],
        "edges": [
          {
            "id": "edge1",
            "fromNode": "node1",
            "toNode": "node2",
            "fromSide": "left",
            "toSide": "right",
            "fromEnd": "none",
            "toEnd": "arrow",
            "color": "#123456",
            "label": "Edge Label"
          }
        ]
      }`;
      expect(() => JSONCanvas.parse(json)).not.toThrow();
    });
  });

  describe('function assert', () => {
    it('should not throw an error for valid JSONCanvas', () => {
      const validCanvas = {
        nodes: [
          {
            id: 'node1',
            type: 'text',
            text: 'Hello, World!',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            color: '1',
          },
          {
            id: 'node2',
            type: 'file',
            file: 'file.txt',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            color: '#000000',
          },
        ],
        edges: [
          {
            id: 'edge1',
            fromNode: 'node1',
            toNode: 'node2',
            fromSide: 'left',
            toSide: 'right',
            fromEnd: 'none',
            toEnd: 'arrow',
            color: '#123456',
            label: 'Edge Label',
          },
        ],
      };
      expect(() => JSONCanvas.assert(validCanvas)).not.toThrow();
    });

    it('should throw an error for invalid JSONCanvas', () => {
      const invalidCanvas = {
        nodes: [
          {
            id: 'node1',
            type: 'text',
            text: 'Hello, World!',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            color: '1',
          },
          {
            id: 'node2',
            type: 'file',
            file: 'file.txt',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            color: '#000000',
          },
        ],
        edges: [
          {
            id: 'edge1',
            fromNode: 'node1',
            toNode: 'node2',
            fromSide: 'left',
            toSide: 'right',
            fromEnd: 'none',
            toEnd: 'arrow',
            color: '#123456',
            label: 'Edge Label',
          },
          'invalid',
        ],
      };
      expect(() =>
        JSONCanvas.assert(invalidCanvas),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Invalid edge]`);
    });
  });

  describe('function load', () => {
    it('should return a JSONCanvasModel object', () => {
      const data = {
        nodes: [
          {
            id: 'node1',
            type: 'text',
            text: 'Hello, World!',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            color: '1',
          },
          {
            id: 'node2',
            type: 'file',
            file: 'file.txt',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            color: '#000000',
          },
        ],
        edges: [
          {
            id: 'edge1',
            fromNode: 'node1',
            toNode: 'node2',
            fromSide: 'left',
            toSide: 'right',
            fromEnd: 'none',
            toEnd: 'arrow',
            color: '#123456',
            label: 'Edge Label',
          },
        ],
      };
      expect(() => JSONCanvas.load(data)).not.toThrow();
    });
  });
});
