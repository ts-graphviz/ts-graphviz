#!/usr/bin/env bash
# Minimize a finding to the smallest input that still fails.
#
#   fuzz/minimize.sh <target> <crash-file>    -> <crash-file>.min
set -euo pipefail

target="${1:?usage: fuzz/minimize.sh <target> <crash-file>}"
crash="${2:?usage: fuzz/minimize.sh <target> <crash-file>}"
root="$(cd "$(dirname "$0")/.." && pwd)"

cd "$root"
pnpm exec jazzer "fuzz/dist/$target.fuzz.cjs" "$crash" \
  --includes fuzz/dist --sync \
  -- -minimize_crash=1 -runs=50000 -exact_artifact_path="$crash.min" \
  >/dev/null 2>&1 || true
echo "$crash.min ($(wc -c < "$crash.min") bytes)"
