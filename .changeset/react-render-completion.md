---
"@ts-graphviz/react": patch
---

Each root now uses its own reconciler, and the initial rendering is flushed synchronously, so `renderToDot` and `root.render` can block the caller until it completes. An error that escapes this flush rejects the promise they return.

`timeout` is checked once the synchronous flush has completed: a render that took longer rejects with the same `Rendering timeout` error as before. It does not interrupt rendering.

Root option handling is aligned with the reconciler interface.
