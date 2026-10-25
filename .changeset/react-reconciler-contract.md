---
"@ts-graphviz/react": minor
---

The renderer is wired to react-reconciler's React 19 contract (#1752).

- **React 19.3 or later is required.** The renderer moves to react-reconciler 0.34, whose peer range is `react ^19.3.0`, and the peer range narrows from `react >=19` to `^19.3.0`. Each reconciler minor bundles the internals of one React minor.
- **Error callbacks are passed in their right places.** `onUncaughtError`, `onCaughtError` and `onRecoverableError` each reach React. Before, an error boundary inside a rendered tree crashed with `onCaughtError is not a function`, and only `onUncaughtError` was wired.
  - The callbacks now receive `error: unknown`, since a thrown value need not be an `Error`.
  - `render()` (and `renderToDot`) rejects with an uncaught error instead of a generic "No top-level graph found".
- **`render()` resolves once the tree has settled.** The render and the updates effects schedule run synchronously (`updateContainerSync`, `flushSyncWork`, and the discrete priority throughout). Work React schedules on other lanes (transitions started in effects, `useDeferredValue`, suspended data with `use` / `Suspense`) is waited for.
  - A graph or node revealed by such work is in the result.
  - An error it throws rejects `render()`.
  - `timeout` (default 5000 ms) now bounds that wait and no longer wraps every render. A synchronous render does not wait.
- **Host config fixes:**
  - event priorities from `react-reconciler/constants` (discrete throughout, with React's priority still tracked);
  - a real `scheduleMicrotask`;
  - host element types kept as their strings;
  - `prepareUpdate` removed (React 19 doesn't call it);
  - no console output.
