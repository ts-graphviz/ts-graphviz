---
"@ts-graphviz/react": major
---

The renderer follows react-reconciler's React 19 contract

- **React `^19.3.0` is required** (React 19.3 or a later 19.x release). The renderer uses react-reconciler 0.34, whose peer range is `react ^19.3.0`; the peer range narrows from `react >=19` (0.12) to `^19.3.0`. Each reconciler minor bundles the internals of one React minor.
- **Error callbacks reach React.** `onUncaughtError`, `onCaughtError` and `onRecoverableError` are each passed to React. In 0.12 only `onUncaughtError` was, and an error boundary inside a rendered tree crashed with `onCaughtError is not a function`.
  - The callbacks receive `error: unknown`, since a thrown value need not be an `Error`.
- **`fromElement(element, options?)` converts an element once**, and replaces `renderToDot`. It renders the element, waits until React has no work left for it (the updates effects schedule, transitions, deferred values, data read with `use`), and resolves with the models: one `Dot` model holding the root graphs, or the `container` it was given. `toDot(await fromElement(element))` gives the text `renderToDot(element)` gave. The tree is unmounted when the models are ready, so its effects clean up.
  - It rejects with the error no error boundary caught (0.12: a generic "No top-level graph found"), with the error a model class threw, or with `signal.reason`; whenever it rejects, what it added is taken out of the container again.
  - `timeout` is replaced by `signal` (AbortSignal), like the adapter's: use `AbortSignal.timeout(ms)` for a time limit. Without a signal there is no limit (0.12 defaulted to 5 seconds).
  - Without a container the element may have several root graphs; anything else at the top level is a `TypeError`.
  - What a conversion added to a container is the container's own afterwards: a later conversion or root on the same container adds to it. Each root replaces only what it added itself.
- **`createRoot` follows a root of React.** `root.render(element)` returns nothing and does not wait (0.12: a promise): React renders shortly after, and the result comes through the callbacks.
  - `onRenderComplete(models)` is called after React committed the tree, once for the commits of one turn, and not for a render that ended in an uncaught error.
  - Errors come through `onUncaughtError`, `onCaughtError` and `onRecoverableError` only. After an uncaught error the root has no models, and can render again. An error one of the callbacks throws is thrown again outside the render.
  - `render()` takes no options: `timeout` is gone, and `signal` belongs to `fromElement`. It throws only on an unmounted root.
  - `unmount()` cleans the tree's effects up and takes its models out of the container; what a cleanup throws goes to `onUncaughtError`.
  - Without a container the root holds every root graph of the top level; 0.12 threw for more than one.
  - A root works with `act()` of React: the render and its effects are flushed before `act()` returns, and an uncaught error is thrown by `act()`.
- **The renderer is a secondary renderer** (`isPrimaryRenderer: false`), so it can run next to React DOM, also while React DOM renders: the two no longer read each other's context values. Context does not cross from one renderer to the other.
- When the renderer itself fails (an error thrown out of React's work, not by a component), every root is told through `onUncaughtError` and starts a new tree on its next `render()`; a `fromElement` that was waiting rejects, or starts again up to `retries` times (by default 0).
- The renderer writes nothing to the console.
