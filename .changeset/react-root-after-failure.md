---
"@ts-graphviz/react": patch
---

A root created with `createRoot` keeps working after a render whose synchronous flush throws. The root continues with a new reconciler, and other renders in progress on it are rejected with the same error. Before, later renders on that root did not complete and were rejected with a `Rendering timeout` error.

The tree that the root held before the failure is dropped without being unmounted, so the cleanups of its effects do not run, and it no longer contributes models to the root. With the `container` option, models that this tree or the failed render added to the container stay in it: render into a new container after such a failure.
