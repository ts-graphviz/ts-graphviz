/** What a run of a Playground script ended with. */
export type RunResult =
  | { ok: true; dot: string }
  | { ok: false; error: RunError };

export interface RunError {
  name: string;
  message: string;
}

/** Main thread → worker. */
export interface RunRequest {
  id: number;
  source: string;
}

/** Worker → main thread. */
export type RunResponse = RunResult & { id: number };
