#!/usr/bin/env bash
# Run one fuzz target with Jazzer.js.
#
#   fuzz/run.sh <target> [seconds]      e.g. fuzz/run.sh parse 600
#
# Targets are fuzz/targets/<target>.fuzz.ts, bundled to fuzz/dist by
# `pnpm fuzz:build`. The corpus lives in fuzz/corpus/<target> (seeded from
# test/dot for the DOT targets) and grows while fuzzing; findings are saved
# as fuzz/findings/<target>/crash-*.
set -euo pipefail

target="${1:?usage: fuzz/run.sh <target> [seconds]}"
seconds="${2:-60}"
root="$(cd "$(dirname "$0")/.." && pwd)"
dist="$root/fuzz/dist/$target.fuzz.cjs"
corpus="$root/fuzz/corpus/$target"
findings="$root/fuzz/findings/$target"

if [[ ! -f "$dist" ]]; then
  echo "missing $dist; run 'pnpm fuzz:build' first" >&2
  exit 2
fi
mkdir -p "$corpus" "$findings"
case "$target" in
  parse | model)
    # Seed DOT targets with the sample files used by the snapshot tests.
    cp -n "$root"/test/dot/*.dot "$corpus"/ 2>/dev/null || true
    ;;
esac

cd "$root"
exec pnpm exec jazzer "$dist" "$corpus" \
  --includes fuzz/dist --sync \
  -- \
  -max_total_time="$seconds" \
  -rss_limit_mb=4096 \
  -timeout=10 \
  -dict="$root/fuzz/dot.dict" \
  -artifact_prefix="$findings/"
