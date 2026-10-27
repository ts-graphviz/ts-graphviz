---
"@ts-graphviz/react": major
---

The renderer follows react-reconciler's React 19 contract

- **React 19.3 or later is required.** The renderer uses react-reconciler 0.34, whose peer range is `react ^19.3.0`; the peer range narrows from `react >=19` (0.12) to `^19.3.0`. Each reconciler minor bundles the internals of one React minor.
- **Error callbacks reach React.** `onUncaughtError`, `onCaughtError` and `onRecoverableError` are each passed to React. In 0.12 only `onUncaughtError` was, and an error boundary inside a rendered tree crashed with `onCaughtError is not a function`.
  - The callbacks receive `error: unknown`, since a thrown value need not be an `Error`.
  - `render()` (and `renderToDot`) rejects with an uncaught error instead of a generic "No top-level graph found".
- **`render()` resolves once the tree has settled.** The render and the updates its effects schedule run synchronously. Work React schedules on other lanes (transitions started in effects, `useDeferredValue`, suspended data with `use` / `Suspense`) is waited for: a graph or node revealed by such work is in the result, and an error it throws rejects `render()`.
- **`timeout` is replaced by a per-render `signal`** (AbortSignal): `root.render(element, { signal })` and `renderToDot(element, { signal })` reject with `signal.reason` when it aborts, like the adapter's `signal`; use `AbortSignal.timeout(ms)` for a time limit. Without a signal there is no limit (0.12 defaulted to 5 seconds). A synchronous render does not wait.
- **Renders on one root run one after another**, each with its own result and errors. A render during which the root is unmounted rejects.
- The renderer writes nothing to the console.
