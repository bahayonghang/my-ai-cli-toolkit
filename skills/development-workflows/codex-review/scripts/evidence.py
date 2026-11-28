"""Collect review evidence without checking out a revision or changing the index."""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import stat
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlsplit

SCRIPT_INTERFACE = "internal-module"
REPORT_DIR = "reports/codex-review"
FILE_LIMIT = 1024 * 1024
DIFF = ["diff", "--no-ext-diff", "--no-textconv", "--no-renames", "--no-color", "--ignore-submodules=none",
        "--submodule=short", "--src-prefix=a/", "--dst-prefix=b/", "--unified=12"]


class ReviewError(Exception):
    """An actionable failure safe to show in the report."""


def command(cwd, argv):
    # Keep credentials and file content out of persisted error diagnostics.
    exe = shutil.which(argv[0])
    if not exe:
        raise ReviewError(f"PATH 中没有 {argv[0]}。")
    result = subprocess.run([exe, *argv[1:]], cwd=cwd, stdin=subprocess.DEVNULL,
                            capture_output=True, timeout=180, env={**os.environ, "LC_ALL": "C",
                            "GIT_TERMINAL_PROMPT": "0", "GH_PROMPT_DISABLED": "1"})
    if result.returncode:
        operation = next((arg for arg in argv[1:] if not arg.startswith("-")), "")
        raise ReviewError(f"{argv[0]} {operation} 失败（退出码 {result.returncode}）。")
    return result.stdout


def git(cwd, *args):
    return command(cwd, ["git", "--no-optional-locks", *args])


def paths(raw):
    return sorted({os.fsdecode(name) for name in raw.split(b"\0") if name})


def revision(repo, ref):
    return git(repo, "rev-parse", "--verify", "--end-of-options", ref + "^{commit}").decode().strip()


def merge_base(repo, base, head):
    return git(repo, "merge-base", base, head).decode().strip()


@dataclass
class Scope:
    metadata: dict = field(default_factory=dict)
    items: list = field(default_factory=list)
    skipped: list = field(default_factory=list)

    def add(self, name, layer, raw):
        if len(raw) > FILE_LIMIT:
            self.skipped.append((name, layer, "超过 1 MiB"))
            return
        try:
            content = raw.decode("utf-8-sig")
        except UnicodeDecodeError:
            content = None
        if content is None or "\0" in content or (
            layer not in {"file", "untracked"} and re.search(r"(?m)^Binary files .* differ$", content)
        ):
            self.skipped.append((name, layer, "二进制或非 UTF-8"))
            return
        if any(len(json.dumps(line, ensure_ascii=False).encode("utf-8")) > 48_000
               for line in content.split("\n")):
            self.skipped.append((name, layer, "单行编码后超过 48 KB"))
            return
        self.items.append({"path": name, "layer": layer, "content": content})

    def eligible(self, name, layer):
        if name == REPORT_DIR or name.startswith(REPORT_DIR + "/"):
            return False
        p = Path(name)
        leaf = p.name.lower()
        if (leaf == ".env" or leaf.startswith(".env.") or leaf in {
            ".npmrc", ".netrc", "_netrc", "credentials.json", "id_rsa", "id_ed25519",
        } or p.suffix.lower() in {".pem", ".key", ".p12", ".pfx"}):
            self.skipped.append((name, layer, "凭据类文件名"))
            return False
        return True

    def fingerprint(self):
        digest = hashlib.sha256()
        for record in [self.metadata, *self.items, *self.skipped]:
            digest.update(json.dumps(record, sort_keys=True, ensure_ascii=True).encode())
            digest.update(b"\n")
        return digest.hexdigest()


def read_files(repo, scope, names, layer):
    for name in names:
        if not scope.eligible(name, layer):
            continue
        path = repo / name
        try:
            if path.resolve() != path or path.is_symlink():
                scope.skipped.append((name, layer, "符号链接或目录重定向"))
            elif not stat.S_ISREG(path.stat().st_mode):
                scope.skipped.append((name, layer, "目录、子模块或特殊文件"))
            else:
                with path.open("rb") as source:
                    scope.add(name, layer, source.read(FILE_LIMIT + 1))
        except (OSError, RuntimeError):
            scope.skipped.append((name, layer, "文件不存在或不可读取"))


def patches(repo, scope, layer, *refs):
    names = paths(git(repo, *DIFF, "--name-only", "-z", *refs, "--"))
    for name in names:
        if scope.eligible(name, layer):
            # A literal path alone also matches descendants after a file/directory swap.
            prefix = re.sub(r"([\\*?\[\]])", r"\\\1", name)
            raw = git(repo, *DIFF, *refs, "--", f":(top,literal){name}", f":(top,exclude,glob){prefix}/**")
            if raw:
                scope.add(name, layer, raw)
            else:
                scope.skipped.append((name, layer, "收集期间差异已变化"))


def pr_revisions(repo, scope, target, temp):
    if not re.fullmatch(r"[1-9]\d*|https://[\w.-]+/[\w.-]+/[\w.-]+/pull/[1-9]\d*/?", target):
        raise ReviewError("请提供 PR 编号或完整 GitHub PR URL。")
    raw = command(repo, ["gh", "pr", "view", target, "--json", "url,baseRefOid,headRefOid"])
    data = json.loads(raw)
    url, base, head = data["url"], data["baseRefOid"], data["headRefOid"]
    location = urlsplit(url)
    match = re.fullmatch(r"/([\w.-]+/[\w.-]+)/pull/[1-9]\d*/?", location.path)
    if (location.scheme != "https" or not re.fullmatch(r"[\w.-]+", location.netloc)
            or not match or not all(re.fullmatch(r"[a-f0-9]{40}", sha) for sha in (base, head))):
        raise ReviewError("gh 返回的 PR 地址或版本无效。")
    scope.metadata.update(pr=url, base=base, head=head)
    try:
        return repo, merge_base(repo, base, head), head
    except ReviewError:
        # The base repository exposes fork PR objects. Pin both ends before fetching.
        slug = match[1]
        common = command(repo, ["gh", "api", "--hostname", location.netloc,
                         f"repos/{slug}/compare/{base}...{head}", "--jq",
                         ".merge_base_commit.sha"]).decode().strip()
        if not re.fullmatch(r"[a-f0-9]{40}", common):
            raise ReviewError("GitHub 未返回有效的合并基点。")
        cache = temp / "objects.git"
        git(temp, "init", "--bare", str(cache))
        git(cache, "remote", "add", "origin", f"https://{location.netloc}/{slug}.git")
        git(cache, "fetch", "--no-tags", "--depth=1", "--filter=blob:none",
            "origin", *dict.fromkeys((common, head)))
        return cache, common, head


def collect(repo, scope, mode, target, temp):
    if mode == "pr":
        objects, common, head = pr_revisions(repo, scope, target, temp)
        scope.metadata["merge-base"] = common
        patches(objects, scope, "PR", common, head)
        return
    if mode == "commit":
        head = revision(repo, target)
        headers = git(repo, "cat-file", "-p", head).split(b"\n\n", 1)[0]
        parents = [line[7:].decode("ascii") for line in headers.splitlines() if line.startswith(b"parent ")]
        if parents:
            base = parents[0]
        else:
            # Git recognizes its empty tree even in an unborn/SHA-256 repository.
            base = subprocess.run(["git", "hash-object", "-t", "tree", "--stdin"],
                                  input=b"", cwd=repo, check=True, capture_output=True).stdout.decode().strip()
        scope.metadata.update(base=base, head=head)
        patches(repo, scope, "commit", base, head)
        return
    if mode == "base":
        head, base = revision(repo, "HEAD"), revision(repo, target)
        common = merge_base(repo, base, head)
        scope.metadata.update(base=base, head=head)
        scope.metadata["merge-base"] = common
        patches(repo, scope, "branch", common, head)
        return
    try:
        scope.metadata["HEAD"] = revision(repo, "HEAD")
    except ReviewError:
        scope.metadata["HEAD"] = "unborn"
    if mode == "repo":
        names = paths(git(repo, "ls-files", "-z", "--cached", "--others", "--exclude-standard"))
        read_files(repo, scope, names, "file")
    else:
        index = Path(os.fsdecode(git(repo, "rev-parse", "--git-path", "index")).rstrip("\r\n"))
        index = repo / index
        before = index.read_bytes() if index.exists() else None
        patches(repo, scope, "staged", "--cached")
        patches(repo, scope, "unstaged")
        read_files(repo, scope, paths(git(repo, "ls-files", "-z", "--others", "--exclude-standard")),
                   "untracked")
        after = index.read_bytes() if index.exists() else None
        if before != after:
            scope.skipped.append(("(index)", "worktree", "采集期间 Git 索引发生变化；请重新审查"))
