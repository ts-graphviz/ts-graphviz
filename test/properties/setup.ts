import fc from 'fast-check';

// Shared fast-check configuration for the property-based tests.
//
// - FC_SEED=<number>   reproduce a failing run (the seed is printed on failure)
// - FC_NUM_RUNS=<n>    run more (or fewer) cases, e.g. a longer run in CI
fc.configureGlobal({
  seed: process.env.FC_SEED ? Number(process.env.FC_SEED) : undefined,
  numRuns: process.env.FC_NUM_RUNS ? Number(process.env.FC_NUM_RUNS) : 200,
  interruptAfterTimeLimit: 60_000,
  markInterruptAsFailure: true,
});
