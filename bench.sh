#!/usr/bin/env bash
# Does ARCHITECTURE.md do real work? Same tasks, same gate, doc vs no doc.
# Third arm (2026-11-09): INTERFACE.md -- contract only, no behavioural rules.
#
# Each module is measured independently: src/ is seeded with the reference
# implementation of the OTHER modules, the target module is deleted, and gemma
# writes it. daily.js therefore still has to import and use the real quantity.js
# and scale.js -- the cross-module contract is preserved, but a failure upstream
# cannot cascade and corrupt the downstream measurement.
set -u
ROOT=$(cd "$(dirname "$0")" && pwd) || exit 1
cd "$ROOT" || exit 1
[ -d "$ROOT/ref" ] || { echo "no ref/ in $ROOT; refusing to touch src/" >&2; exit 1; }
reset_src() { rm -rf "${ROOT:?}/src" && mkdir "$ROOT/src" && cp "$ROOT"/ref/*.js "$ROOT/src/"; }
REPS=${REPS:-3}
MODEL=${QTASK_MODEL:-google/gemma-4-12b-qat}
OUT=results/$(date +%Y%m%dT%H%M%S)
mkdir -p "$OUT"

seed() { # seed src/ with ref, minus the target module
  reset_src || exit 1; rm -f "src/$1.js"
}

task_for() {
  case "$1" in
    quantity) echo "Implement src/quantity.js so that test/visible/quantity.test.js passes." ;;
    scale)    echo "Implement src/scale.js so that test/visible/scale.test.js passes." ;;
    daily)    echo "Implement src/daily.js so that test/visible/daily.test.js passes. It must import from ./quantity.js and ./scale.js." ;;
  esac
}

ARMS=${ARMS:-with-arch interface no-arch}
for arm in $ARMS; do
  for mod in ${MODS:-quantity scale daily}; do
    for rep in $(seq 1 "$REPS"); do
      seed "$mod"
      tdir=test/visible; [ "$arm" = interface-named ] && tdir=test/visible-named
      ctx=(--context "$tdir/$mod.test.js")
      [ "$arm" = with-arch ] && ctx=(--context ARCHITECTURE.md "${ctx[@]}")
      case "$arm" in interface|interface-named) ctx=(--context INTERFACE.md "${ctx[@]}") ;; esac

      log="$OUT/$arm.$mod.$rep.log"
      start=$(date +%s)
      qtask --task "$(task_for "$mod")" \
            --file "src/$mod.js" \
            --check "node --test '$tdir/$mod.test.js'" \
            "${ctx[@]}" \
            --retries 2 --max-tokens 2000 --cwd . --model "$MODEL" >"$log" 2>&1
      vis=$?
      dur=$(( $(date +%s) - start ))

      hid=skip
      if [ $vis -eq 0 ]; then
        node --test "test/hidden/$mod.hidden.test.js" >"$OUT/$arm.$mod.$rep.hidden.log" 2>&1 \
          && hid=pass || hid=FAIL
        cp "src/$mod.js" "$OUT/$arm.$mod.$rep.js"
      else
        [ -f "src/$mod.js.qtask-rej" ] && cp "src/$mod.js.qtask-rej" "$OUT/$arm.$mod.$rep.rej.js"
      fi
      att=$(grep -c 'asking' "$log")
      v=$([ $vis -eq 0 ] && echo pass || echo FAIL)

      echo "$arm,$mod,$rep,$v,$hid,$att,$dur" | tee -a "$OUT/raw.csv"
    done
  done
done

reset_src || exit 1
echo "--- results in $OUT ---"
