---
"@ts-graphviz/react": minor
---

The renderer is wired to react-reconciler's React 19 contract (#1752).

- **React 19.3 or later is required.** The renderer moves to react-reconciler 0.34, whose peer range is `react ^19.3.0`, and the peer range narrows from `react >=19` to `^19.3.0`. Each reconciler minor bundles the internals of one React minor.
- **Error callbacks are passed in their right places.** `onUncaughtError`, `onCaughtError` and `onRecoverableError` each reach React. Before, an error boundary inside a rendered tree crashed with `onCaughtError is not a function`, and only `onUncaughtError` was wired.
  - The callbacks now receive `error: unknown`, since a thrown value need not be an `Error`.
  - `render()` (and `renderToDot`) rejects with an uncaught error instead of a generic "No top-level graph found".
- **Rendering is synchronous** (`updateContainerSync` and `flushSyncWork`), and every update runs at the discrete priority. Updates that effects schedule (e.g. `useEffect(() => setShown(true))`) therefore finish before `render()` resolves, so a graph or node revealed by an effect is in the result, and an error thrown by such a render rejects `render()`. The `timeout` option of `createRoot` / `renderToDot` is removed. `render()` and `renderToDot()` still return promises.
- **Host config fixes:**
  - event priorities from `react-reconciler/constants` (discrete throughout, with React's priority still tracked);
  - a real `scheduleMicrotask`;
  - host element types kept as their strings;
  - `prepareUpdate` removed (React 19 doesn't call it);
  - no console output.
