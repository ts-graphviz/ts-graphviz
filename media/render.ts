import { toBlob } from '@ts-graphviz/adapter';
import type { RootGraphModel } from '@ts-graphviz/common';
import { optimize } from 'svgo';
import { toDot } from 'ts-graphviz';

/** A media example: media/<name>.dot.ts or media/<name>.dot.tsx. */
export interface MediaModule {
  default: RootGraphModel;
  meta?: {
    /** More paths (relative to the repository root) to write the SVG to. */
    exportTo?: string[];
  };
}

/** The DOT of an example, as media/<name>.dot keeps it. */
export function mediaDot(module: MediaModule): string {
  return `${toDot(module.default)}\n`;
}

/**
 * The SVG of an example's DOT, rendered by Graphviz `dot` and optimized.
 */
export async function mediaSvg(dot: string): Promise<string> {
  const blob = await toBlob(dot, { format: 'svg' });
  return optimize(await blob.text()).data;
}
