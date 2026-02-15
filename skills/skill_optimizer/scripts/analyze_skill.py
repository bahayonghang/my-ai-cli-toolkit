#!/usr/bin/env python
"""Analyze a Claude Code skill for compliance, token efficiency, and best practices."""

import contextlib
import json
import os
import re
import sys
from pathlib import Path

OFFICIAL_FIELDS = {
    "name",
    "description",
    "argument-hint",
    "disable-model-invocation",
    "user-invocable",
    "allowed-tools",
    "model",
    "context",
    "agent",
    "hooks",
    "category",
    "tags",
}

FRONTMATTER_PATTERN = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)
CJK_PATTERN = re.compile(r"[\u4e00-\u9fff\u3040-\u30ff]")


def estimate_tokens(text: str) -> int:
    """Estimate tokens with CJK-aware weighting (~4 chars/token English, ~2 chars/token CJK)."""
    cjk = sum(1 for c in text if "一" <= c <= "鿿" or "　" <= c <= "ヿ")
    ascii_chars = len(text) - cjk
    return ascii_chars // 4 + cjk // 2


def parse_frontmatter(content: str):
    """Extract YAML frontmatter as key-value pairs with multi-line support."""
    m = FRONTMATTER_PATTERN.match(content)
    if not m:
        return {}, content.strip()
    fm_text = m.group(1)
    body = content[m.end() :].strip()
    fields = {}
    current_key = None
    for line in fm_text.split("\n"):
        if re.match(r"^\S.*:", line):
            key, val = line.split(":", 1)
            current_key = key.strip()
            fields[current_key] = val.strip()
        elif current_key and line.startswith(("  ", "\t")):
            fields[current_key] += " " + line.strip()
    return fields, body


def analyze(skill_path: str) -> dict:
    skill_dir = Path(skill_path)
    openai_yaml = skill_dir / "agents" / "openai.yaml"
    report = {
        "skill_path": str(skill_dir),
        "skill_name": None,
        "structure": {},
        "frontmatter": {},
        "tokens": {},
        "features": {},
        "issues": [],
    }

    # Structure scan
    skill_md = skill_dir / "SKILL.md"
    report["structure"] = {
        "has_skill_md": skill_md.exists(),
        "has_scripts": (skill_dir / "scripts").is_dir(),
        "has_resources": (skill_dir / "resources").is_dir(),
        "has_openai_yaml": openai_yaml.is_file(),
        "files": [str(p.relative_to(skill_dir)) for p in skill_dir.rglob("*") if p.is_file()],
    }

    if not skill_md.exists():
        report["issues"].append(
            {
                "severity": "critical",
                "category": "structure",
                "message": "SKILL.md not found",
                "fix": "Create SKILL.md with frontmatter and instructions.",
            }
        )
        print(json.dumps(report, indent=2))
        return report

    content = skill_md.read_text(encoding="utf-8")

    # Frontmatter analysis
    fields, body = parse_frontmatter(content)
    has_frontmatter = bool(FRONTMATTER_PATTERN.match(content))
    report["skill_name"] = fields.get("name", "unknown")
    non_standard = [k for k in fields if k not in OFFICIAL_FIELDS]
    missing = [f for f in ["name", "description"] if f not in fields]
    missing_recommended = [f for f in ["argument-hint", "allowed-tools"] if f not in fields]

    report["frontmatter"] = {
        "fields": fields,
        "non_standard": non_standard,
        "missing_required": missing,
        "missing_recommended": missing_recommended,
    }

    if not has_frontmatter:
        report["issues"].append(
            {
                "severity": "critical",
                "category": "frontmatter",
                "message": "Frontmatter block not found",
                "fix": "Add YAML frontmatter with at least name and description.",
            }
        )

    for f in non_standard:
        report["issues"].append(
            {
                "severity": "critical",
                "category": "frontmatter",
                "message": f"Non-standard field: '{f}'",
                "fix": f"Remove '{f}' from frontmatter. Move to body or resources/ if needed.",
            }
        )
    for f in missing:
        report["issues"].append(
            {
                "severity": "critical",
                "category": "frontmatter",
                "message": f"Missing required field: '{f}'",
                "fix": f"Add '{f}' to frontmatter.",
            }
        )
    for f in missing_recommended:
        report["issues"].append(
            {
                "severity": "recommended",
                "category": "frontmatter",
                "message": f"Missing recommended field: '{f}'",
                "fix": f"Add '{f}' to frontmatter.",
            }
        )

    # Description analysis
    desc = fields.get("description", "")
    desc_is_cjk_no_space = bool(CJK_PATTERN.search(desc)) and not bool(re.search(r"\s", desc))
    if desc:
        if desc_is_cjk_no_space:
            desc_length = estimate_tokens(desc)
            unit = "tokens"
        else:
            desc_length = len(desc.split())
            unit = "words"

        if desc_length > 40:
            report["issues"].append(
                {
                    "severity": "critical",
                    "category": "description",
                    "message": f"Description too long ({desc_length} {unit}, target 10-30)",
                    "fix": "Rewrite using: <Action> <Object>. Use when <Trigger>.",
                }
            )
        elif desc_length > 30:
            report["issues"].append(
                {
                    "severity": "recommended",
                    "category": "description",
                    "message": f"Description slightly long ({desc_length} {unit}, target 10-30)",
                    "fix": "Consider trimming to under 30 words.",
                }
            )

    # Token analysis
    tokens_skill_md = estimate_tokens(content)
    tokens_body = estimate_tokens(body)
    tokens_desc = estimate_tokens(desc)
    tokens_resources = 0
    res_dir = skill_dir / "resources"
    if res_dir.is_dir():
        for f in res_dir.rglob("*"):
            if f.is_file():
                with contextlib.suppress(Exception):
                    tokens_resources += estimate_tokens(f.read_text(encoding="utf-8"))

    report["tokens"] = {
        "description": tokens_desc,
        "skill_md_total": tokens_skill_md,
        "skill_md_body": tokens_body,
        "resources": tokens_resources,
        "total": tokens_skill_md + tokens_resources,
    }

    if tokens_body > 500:
        report["issues"].append(
            {
                "severity": "critical",
                "category": "tokens",
                "message": f"SKILL.md body too large ({tokens_body} tokens, target < 300)",
                "fix": "Move reference content to resources/. Keep only imperative steps.",
            }
        )
    elif tokens_body > 300:
        report["issues"].append(
            {
                "severity": "recommended",
                "category": "tokens",
                "message": f"SKILL.md body could be trimmed ({tokens_body} tokens, target < 300)",
                "fix": "Review for content that could move to resources/.",
            }
        )

    # Feature utilization
    context_value = fields.get("context", "")
    report["features"] = {
        "arguments": bool(re.search(r"\$ARGUMENTS", content)),
        "dynamic_context": bool(re.search(r"!`[^`]+`", content)),
        "context_fork": bool(re.search(r"\bfork\b", context_value)),
        "allowed_tools": "allowed-tools" in fields,
        "argument_hint": "argument-hint" in fields,
        "disable_model_invocation": "disable-model-invocation" in fields,
        "hooks": "hooks" in fields,
        "skill_dir": bool(re.search(r"\$SKILL_DIR", content)),
    }

    check_feats = ("arguments", "allowed_tools", "argument_hint")
    unused = [k for k, v in report["features"].items() if not v and k in check_feats]
    for feat in unused:
        report["issues"].append(
            {
                "severity": "recommended",
                "category": "features",
                "message": f"Unused official feature: {feat}",
                "fix": f"Consider adding {feat} support.",
            }
        )

    if not report["structure"]["has_openai_yaml"]:
        report["issues"].append(
            {
                "severity": "recommended",
                "category": "structure",
                "message": "Missing recommended metadata file: 'agents/openai.yaml'",
                "fix": "Add agents/openai.yaml with interface.display_name, interface.short_description, and interface.default_prompt.",
            }
        )

    # Voice quality checks
    first_person = [r"\bI\'ll\b", r"\bI will\b", r"\bwe should\b"]
    passive_voice = [r"\bis\s+\w+ed\b", r"\bare\s+\w+ed\b", r"\bshould be\b", r"\bit would\b"]
    for pat in first_person:
        if re.search(pat, body, re.IGNORECASE):
            report["issues"].append(
                {
                    "severity": "recommended",
                    "category": "clarity",
                    "message": f"First-person voice detected: pattern {pat!r}",
                    "fix": "Rewrite as imperative: Do X instead of I'll do X.",
                }
            )
            break
    for pat in passive_voice:
        if re.search(pat, body, re.IGNORECASE):
            report["issues"].append(
                {
                    "severity": "recommended",
                    "category": "clarity",
                    "message": f"Passive voice detected: pattern {pat!r}",
                    "fix": "Rewrite as imperative: Analyze X instead of X is analyzed.",
                }
            )
            break

    edu_patterns = [r"##\s*(Why|Background|Understanding|Introduction)", r"(?i)\bwhy\s+\w+\s+fail"]
    for pat in edu_patterns:
        if re.search(pat, body):
            report["issues"].append(
                {
                    "severity": "recommended",
                    "category": "layering",
                    "message": "Educational/background content detected in SKILL.md",
                    "fix": "Move to resources/BACKGROUND.md.",
                }
            )
            break

    # Sort issues by severity
    severity_order = {"critical": 0, "recommended": 1, "optional": 2}
    report["issues"].sort(key=lambda x: severity_order.get(x["severity"], 9))

    return report


def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze_skill.py <skill-directory-path>", file=sys.stderr)
        sys.exit(1)

    skill_path = sys.argv[1]
    if not os.path.isdir(skill_path):
        print(f"Error: '{skill_path}' is not a directory.", file=sys.stderr)
        sys.exit(1)

    report = analyze(skill_path)
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
