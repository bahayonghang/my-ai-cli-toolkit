import re, glob, subprocess


def get_desc(text):
    m = re.match(r"^---\r?\n(.*?)\r?\n---", text, re.S)
    fm = m.group(1) if m else ""
    dm = re.search(r"^description:\s*(.*?)(?=^[A-Za-z_-]+:\s|\Z)", fm, re.S | re.M)
    d = re.sub(r"\s+", " ", dm.group(1).strip()) if dm else ""
    return re.sub(r"^[>|]-?\s*", "", d)


rows = []
for p in sorted(glob.glob("skills/**/SKILL.md", recursive=True)):
    new = get_desc(open(p, encoding="utf-8").read())
    gp = p.replace("\\", "/")
    old_text = subprocess.run(
        ["git", "show", "HEAD:" + gp], capture_output=True
    ).stdout.decode("utf-8", "replace")
    old = get_desc(old_text)
    if old != new:
        rows.append(
            (gp.removeprefix("skills/").removesuffix("/SKILL.md"), len(old), len(new))
        )

print(f"| Skill | Old | New | Saved |")
print(f"|---|---|---|---|")
t_old = t_new = 0
for name, o, n in sorted(rows, key=lambda r: r[1] - r[2], reverse=True):
    print(f"| {name} | {o} | {n} | {o - n} |")
    t_old += o
    t_new += n
print(
    f"\nchanged skills: {len(rows)}, chars {t_old} -> {t_new} (saved {t_old - t_new})"
)
