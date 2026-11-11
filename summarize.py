import csv, statistics, sys, glob
path = sys.argv[1] if len(sys.argv) > 1 else sorted(glob.glob("results/*/raw.csv"))[-1]
rows = list(csv.reader(open(path)))
print(f"reading {path}\n")
print(f"{'ARM':<17}{'MODULE':<11}{'VISIBLE':<10}{'HELD-OUT':<10}{'ATTEMPTS':<10}{'MEDIAN_S':<9}")
for arm in ("with-arch", "interface", "interface-named", "no-arch"):
    for mod in ("quantity", "scale", "daily"):
        c = [r for r in rows if r[0] == arm and r[1] == mod]
        if not c: continue
        v = sum(r[3] == "pass" for r in c); h = sum(r[4] == "pass" for r in c)
        at = statistics.mean(int(r[5]) for r in c)
        med = statistics.median(int(r[6]) for r in c)
        print(f"{arm:<17}{mod:<11}{f'{v}/{len(c)}':<10}{f'{h}/{len(c)}':<10}{at:<10.1f}{med:<9.0f}")
print()
for arm in ("with-arch", "interface", "interface-named", "no-arch"):
    c = [r for r in rows if r[0] == arm]
    v = sum(r[3] == "pass" for r in c); h = sum(r[4] == "pass" for r in c)
    t = sum(int(r[6]) for r in c)
    print(f"  {arm:<17} visible {v}/{len(c)}   held-out {h}/{len(c)}   "
          f"held-out|visible {h}/{v}   wall {t//60}m{t%60}s")
