/// <reference lib="webworker" />
import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { layout } from './layout';
import { PLAYGROUND_MODULES } from './modules';
import type { WorkerRequest, WorkerResponse } from './protocol';
import { runScript, toRunError } from './run-script';

// Runs Playground scripts and Graphviz layouts off the main thread, so a
// script that never ends or a graph too large to lay out can be stopped by
// terminating the worker (see ScriptRunner).
const scope = self as unknown as DedicatedWorkerGlobalScope;

let graphviz: Promise<Graphviz> | undefined;

scope.onmessage = async ({ data }: MessageEvent<WorkerRequest>) => {
  let response: WorkerResponse;
  if (data.type === 'run') {
    response = { id: data.id, ...runScript(data.source, PLAYGROUND_MODULES) };
  } else {
    try {
      graphviz ??= Graphviz.load();
      response = {
        id: data.id,
        ...layout(await graphviz, data.dot, data.engine),
      };
    } catch (error) {
      graphviz = undefined;
      response = { id: data.id, ok: false, error: toRunError(error) };
    }
  }
  scope.postMessage(response);
};
