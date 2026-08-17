import json
import subprocess

repos = [
    "kndoshn/git-worktree-skill",
    "chen-gdp/git-worktrees-skill",
    "HamStudy/git-worktree-skill",
    "Lxxyx/git-worktree-skills",
    "everyinc/compound-engineering-plugin",
    "alirezarezvani/claude-skills",
    "kuderr/git-wt",
    "civitai/civitai",
]

for repo in repos:
    print(f"===== {repo} =====")
    r = subprocess.run(
        ["gh", "api", f"repos/{repo}"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if r.returncode != 0:
        print("repo fail", r.stderr[:200])
        continue
    meta = json.loads(r.stdout)
    branch = meta.get("default_branch")
    print(
        "branch",
        branch,
        "stars",
        meta.get("stargazers_count"),
        "desc",
        (meta.get("description") or "")[:120],
    )
    t = subprocess.run(
        ["gh", "api", f"repos/{repo}/git/trees/{branch}?recursive=1"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if t.returncode != 0:
        print("tree fail", t.stderr[:200])
        continue
    tree = json.loads(t.stdout)
    matches = [
        x["path"]
        for x in tree.get("tree", [])
        if "SKILL" in x["path"].upper()
        or "worktree" in x["path"].lower()
        or x["path"].endswith(".md")
    ]
    for path in matches[:50]:
        print(" ", path)
    print(" matching", len(matches), "truncated", tree.get("truncated"))
