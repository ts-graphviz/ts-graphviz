import { renderHTMLLike } from '@ts-graphviz/react';
import {
  type ArrowType,
  type AttributesObject,
  type NodeAttributesObject,
  type PortPos,
  digraph,
  toDot as toDot_,
} from 'ts-graphviz';
import type { JSONCanvas } from './schema.js';
import { CanvasColor, EdgeEnd, EdgeSide } from './types.js';

function inchesToPixels(inches: number, dpi = 96) {
  return inches * dpi;
}

function toDotColors(
  color?: CanvasColor,
): AttributesObject<'color' | 'fillcolor'> {
  if (typeof color === 'string') {
    if (color.startsWith('#')) {
      return {
        // color: color,
        color: color,
      };
    }
    switch (color) {
      case CanvasColor.red:
        return {
          color: 'red',
        };
      case CanvasColor.orange:
        return {
          color: 'orange',
        };
      case CanvasColor.yellow:
        return {
          color: 'yellow',
        };
      case CanvasColor.green:
        return {
          color: 'green',
        };
      case CanvasColor.cyan:
        return {
          color: 'cyan',
        };
      case CanvasColor.purple:
        return {
          color: 'purple',
        };
    }
  }
  return {
    // color: 'black',
    color: 'gray',
  };
}

function toDotPortPos(side: EdgeSide): PortPos {
  switch (side) {
    case EdgeSide.top:
      return 's';
    case EdgeSide.bottom:
      return 'n';
    case EdgeSide.left:
      return 'e';
    case EdgeSide.right:
      return 'w';
  }
}

function toDotEdgeShape(end: EdgeEnd): ArrowType {
  switch (end) {
    case EdgeEnd.none:
      return 'none';
    case EdgeEnd.arrow:
      return 'normal';
  }
}

interface Options {
  theme?: 'dark' | 'light';
}

export function toDot(
  jsoncanvas: JSONCanvas,
  { theme = 'dark' }: Options = {},
) {
  const dpi = 300;
  const fontsize = 5;
  return toDot_(
    digraph((g) => {
      g.set('dpi', dpi);
      g.set('layout', 'neato');
      // g.set('inputscale', dpi);
      g.set('notranslate', true);
      g.set('fontsize', fontsize);
      g.set('splines', 'curved');
      g.set('labeljust', 'l');
      g.set('labelloc', 't');
      g.graph({
        bgcolor: theme === 'light' ? '#ffffff' : '#55555555',
        labeljust: 'l',
        fontsize,
      });
      g.node({
        style: 'filled,bold,rounded',
        shape: 'box',
        label: '',
        labelloc: 't',
        penwidth: 0.5,
        fontcolor: theme === 'light' ? 'black' : 'white',
        fillcolor: '#00000011',
        fontsize,
        // color: 'black',
        // pin: true,
      });
      g.edge({
        weight: 0,
        fontsize,
      });
      const { x: MIN_X, y: MIN_Y } = jsoncanvas.nodes.reduce(
        (node, acc) => {
          return {
            x: Math.min(acc.x, node.x),
            y: Math.min(acc.y, node.y),
          };
        },
        { x: 0, y: 0 },
      );
      console.log({ MIN_X, MIN_Y });
      for (const node of jsoncanvas.nodes) {
        const attributes: NodeAttributesObject = {
          pos: `${(node.x - MIN_X) / dpi},${-(node.y - MIN_Y) / dpi}!`,
          fixedsize: true,
          width: node.width / dpi,
          height: node.height / dpi,
          ...toDotColors(node.color),
        };
        switch (node.type) {
          case 'text':
            g.node(node.id, {
              ...attributes,
              label: renderHTMLLike(
                <dot:table width={node.width / dpi} height={node.height / dpi}>
                  <dot:tr>
                    <dot:td align="LEFT">
                      {node.text.split('\n').map((line) => (
                        <>
                          {line}
                          <dot:br />
                        </>
                      ))}
                    </dot:td>
                  </dot:tr>
                </dot:table>,
              ),
              // label: `\\l${node.text.split('\n').join('\n\\l')}`,
            });
            break;
          case 'file':
            g.node(node.id, {
              xlp: `${node.x - MIN_X},${-(node.y - MIN_Y)}`,
              xlabel: node.file.split('/').pop(),
              ...attributes,
            });
            break;
          case 'link':
            g.node(node.id, {
              href: node.url,
              ...attributes,
            });
            break;
          case 'group':
            g.node(node.id, {
              xlabel: node.label,
              z: -1,
              ...attributes,
            });
            break;
        }
      }
      for (const edge of jsoncanvas.edges) {
        g.edge([edge.fromNode, edge.toNode], {
          label: edge.label,
          // fontsize: 5,
          fontcolor: theme === 'light' ? 'black' : 'white',
          headport: edge.fromSide ? toDotPortPos(edge.fromSide) : undefined,
          arrowhead: edge.fromEnd ? toDotEdgeShape(edge.fromEnd) : undefined,
          tailport: edge.toSide ? toDotPortPos(edge.toSide) : undefined,
          arrowtail: edge.toEnd ? toDotEdgeShape(edge.toEnd) : undefined,
          arrowsize: 0.5,
          penwidth: 0.8,
          // weight: 0,
          ...toDotColors(edge.color),
        });
      }
    }),
  );
}
