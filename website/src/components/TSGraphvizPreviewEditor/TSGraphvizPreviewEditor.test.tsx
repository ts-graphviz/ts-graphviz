// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockMatchMedia } from '../../../test/mocks/match-media';
import { GraphvizProvider } from '../../contexts/Graphviz';
import { PLAYGROUND_MODULES } from '../../playground/runtime/modules';
import type {
  RunRequest,
  RunResponse,
} from '../../playground/runtime/protocol';
import { runScript } from '../../playground/runtime/run-script';
import type { WorkerLike } from '../../playground/runtime/runner';
import { ScriptRunnerProvider } from '../../playground/runtime/ScriptRunnerContext';
import TSGraphvizPreviewEditor from '.';

/** Runs scripts synchronously on request, like worker.ts would. */
class InlineWorker implements WorkerLike {
  static instances: InlineWorker[] = [];
  onmessage: WorkerLike['onmessage'] = null;
  onerror: WorkerLike['onerror'] = null;
  queue: RunRequest[] = [];
  constructor() {
    InlineWorker.instances.push(this);
  }
  postMessage(message: RunRequest) {
    this.queue.push(message);
  }
  terminate() {}
  /** Answer every queued request. */
  flush() {
    for (const request of this.queue.splice(0)) {
      const data: RunResponse = {
        id: request.id,
        ...runScript(request.source, PLAYGROUND_MODULES),
      };
      this.onmessage?.({ data } as MessageEvent<RunResponse>);
    }
  }
}

const options = { createWorker: () => new InlineWorker(), timeoutMs: 1000 };
const graphviz = () =>
  Promise.resolve({
    version: () => '99.0.0',
    layout: (dot: string) => `<svg>${dot}</svg>`,
  });

async function flush() {
  await act(async () => {
    for (const worker of InlineWorker.instances) worker.flush();
  });
}

function renderPlayground(script: string) {
  return render(
    <ScriptRunnerProvider options={options}>
      <GraphvizProvider load={graphviz}>
        <TSGraphvizPreviewEditor script={script} />
      </GraphvizProvider>
    </ScriptRunnerProvider>,
  );
}

const resultRegion = () => screen.getByRole('region', { name: 'Result' });

beforeAll(() => {
  URL.createObjectURL = () => 'blob:test';
  URL.revokeObjectURL = () => {};
});
beforeEach(() => {
  InlineWorker.instances = [];
  mockMatchMedia(['(pointer: coarse)']);
});

describe('TSGraphvizPreviewEditor', () => {
  it('runs the script on load and shows the graph', async () => {
    renderPlayground("'digraph { a -> b }'");
    expect(within(resultRegion()).getByRole('status').textContent).toContain(
      'Running',
    );
    await flush();
    expect(await within(resultRegion()).findByRole('img')).toBeTruthy();
    expect(resultRegion().textContent).toContain('Graphviz 99.0.0');

    fireEvent.click(within(resultRegion()).getByRole('tab', { name: 'DOT' }));
    expect(within(resultRegion()).getByText('digraph { a -> b }')).toBeTruthy();
  });

  it('runs the edited script on Run', async () => {
    renderPlayground("'digraph { a }'");
    await flush();
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: "import { graph } from 'ts-graphviz'; graph('Edited');",
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(resultRegion().getAttribute('aria-busy')).toBe('true');
    await flush();
    fireEvent.click(within(resultRegion()).getByRole('tab', { name: 'DOT' }));
    expect(resultRegion().textContent).toContain('graph "Edited" {');
  });

  it('shows script errors', async () => {
    renderPlayground("throw new RangeError('out of range');");
    await flush();
    const alert = within(resultRegion()).getByRole('alert');
    expect(alert.textContent).toContain('RangeError');
    expect(alert.textContent).toContain('out of range');
  });

  it('shows only the result of the latest run', async () => {
    renderPlayground("'digraph { first }'");
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: "'digraph { second }'" } });
    // The initial run is still pending; Run starts a newer one.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    });
    await flush();
    fireEvent.click(within(resultRegion()).getByRole('tab', { name: 'DOT' }));
    expect(resultRegion().textContent).toContain('second');
    expect(resultRegion().textContent).not.toContain('first');
  });

  it('runs on Ctrl+Enter in the editor', async () => {
    renderPlayground("'digraph { a }'");
    await flush();
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: "'digraph { keyboard }'" } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    await flush();
    fireEvent.click(within(resultRegion()).getByRole('tab', { name: 'DOT' }));
    expect(resultRegion().textContent).toContain('keyboard');
  });

  it('lays out with the chosen engine', async () => {
    const layout = vi.fn((dot: string) => `<svg>${dot}</svg>`);
    render(
      <ScriptRunnerProvider options={options}>
        <GraphvizProvider
          load={() => Promise.resolve({ version: () => '1', layout })}
        >
          <TSGraphvizPreviewEditor script="'digraph { a }'" />
        </GraphvizProvider>
      </ScriptRunnerProvider>,
    );
    await flush();
    await within(resultRegion()).findByRole('img');
    fireEvent.change(within(resultRegion()).getByLabelText('Layout engine'), {
      target: { value: 'circo' },
    });
    expect(layout).toHaveBeenLastCalledWith('digraph { a }', 'svg', 'circo');
  });
});
