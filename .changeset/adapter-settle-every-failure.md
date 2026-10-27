---
"@ts-graphviz/adapter": patch
---

On Node.js, failures of the `dot` command and of its pipes are handled by `toStream` / `toFile` and reject the returned promise:

- A failure while writing the input (for example when the command stops reading early) stops the command; the rejection carries the exit status and the command's error output, with the write failure as `cause`.
- A failure of the command's output pipes stops the command and rejects; after `toStream` has resolved, a failure of stdout ends the returned stream with that error.
- Stopping the command cannot itself prevent the rejection.

Before, some of these failures were not handled by the adapter.
