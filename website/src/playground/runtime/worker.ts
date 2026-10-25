/// <reference lib="webworker" />
import { PLAYGROUND_MODULES } from './modules';
import type { RunRequest, RunResponse } from './protocol';
import { runScript } from './run-script';

// Runs Playground scripts off the main thread, so a script that never ends
// can be stopped by terminating the worker (see ScriptRunner).
const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.onmessage = ({ data }: MessageEvent<RunRequest>) => {
  const response: RunResponse = {
    id: data.id,
    ...runScript(data.source, PLAYGROUND_MODULES),
  };
  scope.postMessage(response);
};
