// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  type GraphvizInstance,
  GraphvizProvider,
} from '../../contexts/Graphviz';
import { Graphviz } from '.';

beforeAll(() => {
  let n = 0;
  URL.createObjectURL = vi.fn(() => `blob:test/${n++}`);
  URL.revokeObjectURL = vi.fn();
});

const instance = (layout: GraphvizInstance['layout']): GraphvizInstance => ({
  version: () => '99.0.0',
  layout,
});

function renderWith(load: () => Promise<GraphvizInstance>, dot: string | null) {
  return render(
    <GraphvizProvider load={load}>
      <Graphviz dot={dot} engine="neato" />
    </GraphvizProvider>,
  );
}

describe('Graphviz', () => {
  it('shows a loading state, then the rendered image', async () => {
    const layout = vi.fn(() => '<svg/>');
    renderWith(() => Promise.resolve(instance(layout)), 'digraph { a -> b }');
    expect(screen.getByRole('status').textContent).toContain(
      'Loading Graphviz',
    );
    const img = await screen.findByRole('img', { name: 'Rendered graph' });
    expect(img.getAttribute('src')).toMatch(/^blob:/);
    expect(layout).toHaveBeenCalledWith('digraph { a -> b }', 'svg', 'neato');
  });

  it('shows layout errors', async () => {
    renderWith(
      () =>
        Promise.resolve(
          instance(() => {
            throw new Error('syntax error in line 1');
          }),
        ),
      'digraph {',
    );
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Failed to render graph: syntax error in line 1',
    );
  });

  it('shows a failure to load Graphviz', async () => {
    renderWith(() => Promise.reject(new Error('no wasm')), 'digraph {}');
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Failed to load Graphviz: no wasm',
    );
  });

  it('renders nothing without DOT', async () => {
    const layout = vi.fn(() => '<svg/>');
    const { container } = renderWith(
      () => Promise.resolve(instance(layout)),
      null,
    );
    await vi.waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    expect(container.querySelector('img')).toBeNull();
    expect(layout).not.toHaveBeenCalled();
  });

  it('revokes the object URL of a replaced image', async () => {
    const load = () => Promise.resolve(instance((dot) => `<svg>${dot}</svg>`));
    const { rerender } = renderWith(load, 'graph { a }');
    const first = (await screen.findByRole('img')).getAttribute('src');
    rerender(
      <GraphvizProvider load={load}>
        <Graphviz dot="graph { b }" engine="neato" />
      </GraphvizProvider>,
    );
    await vi.waitFor(() =>
      expect(screen.getByRole('img').getAttribute('src')).not.toBe(first),
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(first);
  });
});
