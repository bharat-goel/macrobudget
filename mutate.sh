#!/usr/bin/env bash
# Cobra canary: each mutant breaks exactly one documented rule.
# A rule that survives BOTH suites is a rule the benchmark cannot measure.
set -u
cd "$(dirname "$0")"

run() { node --test "test/$1/*.test.js" >/dev/null 2>&1 && echo "SURVIVED" || echo "caught"; }

apply() {
  rm -rf src; mkdir src; cp ref/*.js src/
  case "$1" in
    round_half_up)
      perl -0pi -e 's/export function roundHalfEven\(x\) \{.*?\n\}/export function roundHalfEven(x) {\n  return Math.round(x);\n}/s' src/scale.js ;;
    kcal_from_macros)
      perl -0pi -e 's/kcal: at\(label\.kcal\),/kcal: at(label.proteinCg * 4 \/ 100 + label.carbsCg * 4 \/ 100 + label.fatCg * 9 \/ 100),/' src/scale.js ;;
    net_carbs_per_entry)
      perl -0pi -e 's/for \(const k of Object\.keys\(consumed\)\) consumed\[k\] \+= scaled\[k\];/for (const k of Object.keys(consumed)) consumed[k] += scaled[k];\n    net += Math.max(0, scaled.carbsCg - scaled.fiberCg);/' src/daily.js
      perl -0pi -e 's/const consumed = \{/let net = 0;\n  const consumed = {/' src/daily.js
      perl -0pi -e 's/consumed\.netCarbsCg = Math\.max\(0, consumed\.carbsCg - consumed\.fiberCg\);/consumed.netCarbsCg = net;/' src/daily.js ;;
    clamp_remaining)
      perl -0pi -e 's/targets\.(\w+) - consumed\.(\w+)/Math.max(0, targets.$1 - consumed.$2)/g' src/daily.js ;;
    carbs_vs_total)
      perl -0pi -e 's/carbsCg: targets\.carbsCg - consumed\.netCarbsCg/carbsCg: targets.carbsCg - consumed.carbsCg/' src/daily.js ;;
    wrong_error_kind)
      perl -0pi -e 's/RangeError/SyntaxError/g' src/quantity.js ;;
    no_trim)
      perl -0pi -e 's/const s = spec\.trim\(\);/const s = spec;/' src/quantity.js ;;
    serv_null_ok)
      perl -0pi -e 's/if \(servingGrams === null\) throw new RangeError\("label declares no serving size"\);/if (servingGrams === null) return check(Number(m[1]) * 100);/' src/quantity.js ;;
  esac
}

printf "%-22s %-10s %-10s\n" MUTANT VISIBLE HELD-OUT
for m in round_half_up kcal_from_macros net_carbs_per_entry clamp_remaining carbs_vs_total wrong_error_kind no_trim serv_null_ok; do
  apply "$m"
  printf "%-22s %-10s %-10s\n" "$m" "$(run visible)" "$(run hidden)"
done
rm -rf src; mkdir src; cp ref/*.js src/
