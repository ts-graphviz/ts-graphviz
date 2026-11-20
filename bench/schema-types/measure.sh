#!/bin/bash
# Measures one type check of the checkout in the current directory and
# writes one Markdown table row to $2. $1 names the check:
#   native | ts6: the root type check (`pnpm typecheck`) with that compiler;
#   consumer: `pnpm check:consumer-types` (TS 5.0 to 7.0 on the packed
#   packages), wall time only.
set -u
check=$1
out=$2
label=${LABEL:?}
log="$check.log"
case "$check" in
  native) cmd=(node node_modules/@typescript/native/bin/tsc --noEmit --strict --skipLibCheck --extendedDiagnostics) ;;
  ts6) cmd=(node node_modules/typescript/bin/tsc --noEmit --strict --skipLibCheck --extendedDiagnostics) ;;
  consumer) cmd=(pnpm check:consumer-types) ;;
  *) echo "unknown check $check" >&2; exit 2 ;;
esac
start=$(date +%s.%N)
/usr/bin/time -v -o time.txt timeout 900 "${cmd[@]}" >"$log" 2>&1
status=$?
end=$(date +%s.%N)
wall=$(awk -v s="$start" -v e="$end" 'BEGIN { printf "%.1fs", e - s }')
rss=$(awk -F': ' '/Maximum resident set size/ { printf "%.0f MB", $2 / 1024 }' time.txt)
field() { grep -m1 -E "^$1:" "$log" | sed -E 's/^[^:]+:[[:space:]]*//'; }
echo "| $label | $check | $([ "$status" = 0 ] && echo ok || echo "exit $status") | $wall | $rss | $(field 'Check time') | $(field 'Memory used') | $(field 'Instantiations') |" >"$out"
