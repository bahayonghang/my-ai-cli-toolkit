#!/usr/bin/env python
"""Analyze a Claude Code skill for compliance, token efficiency, and best practices."""

import contextlib
import json
import os
import re
import sys
from pathlib import Path

OFFICIAL_FIELDS = {
    "name", "description", "argument-hint", "disable-model-invocation",
    "user-invocable", "allowed-tools", "model", "context", "agent", "hooks",
    "category", "tags",
}

FRONTMATTER_PATTERN = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)
CJK_PATTERN = re.compile(r"[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]")


def estimate_tokens(text: str) -> int:
    """Estimate tokens with CJK-aware weighting (~4 chars/token English, ~2 chars/token CJK)."""
    if not text:
        return 0
    cjk = sum(
        1 for c in text
        if '\u4e00' <= c <= '\u9fff'
        or '\u3040' <= c <= '\u30ff'
        or '\uac00' <= c <= '\ud7af'
    )
    ascii_chars = len(text) - cjk
    return max(1, -(ascii_chars // -4) + -(cjk // -2)) if (ascii_chars or cjk) else 0


def parse_frontmatter(content: str):
    """Extract YAML frontmatter as key-value pairs with multi-line and list support."""
    m = FRONTMATTER_PATTERN.match(content)
    if not m:
        return {}, content.strip()
    fm_text = m.group(1)
    body = content[m.end():].strip()
    fields: dict[str, str | list[str]] = {}
    current_key: str | None = None
    for line in fm_text.split("\n"):
        if re.match(r"^\S.*:", line):
            key, val = line.split(":", 1)
            k = key.strip()
            current_key = k
            fields[k] = val.strip()
        elif current_key and line.startswith(("  ", "\t")):
            stripped = line.strip()
            if stripped.startswith("- "):
                item = stripped[2:].strip()
                existing = fields[current_key]
                if isinstance(existing, list):
                    existing.append(item)
                else:
                    fields[current_key] = [item]
            else:
                existing = fields[current_key]
                if isinstance(existing, str):
                    fields[current_key] = existing + " " + stripped
    return fields, body


def _str_field(fields: dict, key: str, default: str = "") -> str:
    """Get a frontmatter field value as a string (join lists with ', ')."""
    val = fields.get(key, default)
    if isinstance(val, list):
        return ", ".join(val)
    return val  # type: ignore[return-value]


def analyze(skill_path: str) -> dict:
    skill_dir = Path(skill_path)
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
        "files": [
            str(p.relative_to(skill_dir))
            for p in skill_dir.rglob("*")
            if p.is_file() and "__pycache__" not in p.parts
        ],
    }

    if not skill_md.exists():
        report["issues"].append({
            "severity": "critical",
            "category": "structure",
            "message": "SKILL.md not found",
            "fix": "Create SKILL.md with frontmatter and instructions.",
        })
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
        report["issues"].append({
            "severity": "critical",
            "category": "frontmatter",
            "message": "Frontmatter block not found",
            "fix": "Add YAML frontmatter with at least name and description.",
        })

    for f in non_standard:
        report["issues"].append({
            "severity": "critical",
            "category": "frontmatter",
            "message": f"Non-standard field: '{f}'",
            "fix": f"Remove '{f}' from frontmatter. Move to body or resources/ if needed.",
            "pattern_id": "P1",
        })
    for f in missing:
        report["issues"].append({
            "severity": "critical",
            "category": "frontmatter",
            "message": f"Missing required field: '{f}'",
            "fix": f"Add '{f}' to frontmatter.",
        })
    _recommended_field_pattern = {"argument-hint": "P7", "allowed-tools": "P8"}
    for f in missing_recommended:
        issue: dict = {
            "severity": "recommended",
            "category": "frontmatter",
            "message": f"Missing recommended field: '{f}'",
            "fix": f"Add '{f}' to frontmatter.",
        }
        if f in _recommended_field_pattern:
            issue["pattern_id"] = _recommended_field_pattern[f]
        report["issues"].append(issue)

    # Description analysis
    desc = _str_field(fields, "description")
    desc_is_cjk_no_space = bool(CJK_PATTERN.search(desc)) and not bool(re.search(r"\s", desc))
    if desc:
        if desc_is_cjk_no_space:
            desc_length = estimate_tokens(desc)
            unit = "tokens"
        else:
            desc_length = len(desc.split())
            unit = "words"

        if desc_length > 40:
            report["issues"].append({
                "severity": "critical",
                "category": "description",
                "message": f"Description too long ({desc_length} {unit}, target 10-30)",
                "fix": "Rewrite using: <Action> <Object>. Use when <Trigger>.",
                "pattern_id": "P2",
            })
        elif desc_length > 30:
            report["issues"].append({
                "severity": "recommended",
                "category": "description",
                "message": f"Description slightly long ({desc_length} {unit}, target 10-30)",
                "fix": "Consider trimming to under 30 words.",
                "pattern_id": "P2",
            })

        # Check for trigger condition in description
        trigger_pat = r"\buse\s+when\b|\btrigger|\bactivate|\binvoke\s+when\b|触发|适用于|当.*时"
        if not re.search(trigger_pat, desc, re.IGNORECASE):
            report["issues"].append({
                "severity": "recommended",
                "category": "description",
                "message": "Description missing trigger condition",
                "fix": "Add 'Use when <trigger>.' to description for discoverability.",
                "pattern_id": "P2",
            })

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
        report["issues"].append({
            "severity": "critical",
            "category": "tokens",
            "message": f"SKILL.md body too large ({tokens_body} tokens, target < 300)",
            "fix": "Move reference content to resources/. Keep only imperative steps.",
            "pattern_id": "P3",
        })
    elif tokens_body > 300:
        report["issues"].append({
            "severity": "recommended",
            "category": "tokens",
            "message": f"SKILL.md body could be trimmed ({tokens_body} tokens, target < 300)",
            "fix": "Review for content that could move to resources/.",
            "pattern_id": "P3",
        })

    total_tokens = tokens_skill_md + tokens_resources
    if total_tokens > 3000:
        report["issues"].append({
            "severity": "critical",
            "category": "tokens",
            "message": f"Total token budget exceeded ({total_tokens} tokens, limit 3000)",
            "fix": "Reduce SKILL.md body and resources content.",
            "pattern_id": "P3",
        })
    elif total_tokens > 2500:
        report["issues"].append({
            "severity": "recommended",
            "category": "tokens",
            "message": f"Total tokens approaching limit ({total_tokens} tokens, limit 3000)",
            "fix": "Consider trimming resources or body to stay under budget.",
            "pattern_id": "P3",
        })

    # Feature utilization
    context_value = _str_field(fields, "context")
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

    _feat_pattern = {"arguments": "P7", "allowed_tools": "P8", "argument_hint": "P7"}
    check_feats = ("arguments", "allowed_tools", "argument_hint")
    unused = [k for k, v in report["features"].items() if not v and k in check_feats]
    for feat in unused:
        issue = {
            "severity": "recommended",
            "category": "features",
            "message": f"Unused official feature: {feat}",
            "fix": f"Consider adding {feat} support.",
        }
        if feat in _feat_pattern:
            issue["pattern_id"] = _feat_pattern[feat]
        report["issues"].append(issue)

    # Check $SKILL_DIR usage when scripts/ exists
    if report["structure"]["has_scripts"] and not report["features"]["skill_dir"]:
        report["issues"].append({
            "severity": "recommended",
            "category": "features",
            "message": "scripts/ directory exists but $SKILL_DIR not used in SKILL.md",
            "fix": "Reference scripts via $SKILL_DIR/scripts/ for portability.",
            "pattern_id": "P6",
        })

    # Voice quality checks
    first_person = [r"\bI\'ll\b", r"\bI will\b", r"\bwe should\b"]
    passive_voice = [r"\bis\s+\w+ed\b", r"\bare\s+\w+ed\b", r"\bshould be\b", r"\bit would\b"]
    for pat in first_person:
        if re.search(pat, body, re.IGNORECASE):
            report["issues"].append({
                "severity": "recommended",
                "category": "clarity",
                'message': f'First-person voice detected: pattern {pat!r}',
                'fix': 'Rewrite as imperative: Do X instead of I\'ll do X.',
                "pattern_id": "P5",
            })
            break
    for pat in passive_voice:
        if re.search(pat, body, re.IGNORECASE):
            report["issues"].append({
                "severity": "recommended",
                "category": "clarity",
                'message': f'Passive voice detected: pattern {pat!r}',
                'fix': 'Rewrite as imperative: Analyze X instead of X is analyzed.',
                "pattern_id": "P5",
            })
            break


    edu_patterns = [r"##\s*(Why|Background|Understanding|Introduction)", r"(?i)\bwhy\s+\w+\s+fail"]
    for pat in edu_patterns:
        if re.search(pat, body):
            report["issues"].append({
                "severity": "recommended",
                "category": "layering",
                "message": "Educational/background content detected in SKILL.md",
                "fix": "Move to resources/BACKGROUND.md.",
                "pattern_id": "P4",
            })
            break

    # Dimension 7: Script utilization (structured JSON output)
    scripts_dir = skill_dir / "scripts"
    if scripts_dir.is_dir():
        has_json_output = False
        for py_file in scripts_dir.rglob("*.py"):
            with contextlib.suppress(Exception):
                src = py_file.read_text(encoding="utf-8")
                if "json.dumps" in src or "json.dump" in src:
                    has_json_output = True
                    break
        if not has_json_output:
            report["issues"].append({
                "severity": "optional",
                "category": "utilization",
                "message": "Scripts do not produce structured JSON output",
                "fix": "Add json.dumps/json.dump to scripts for machine-readable output.",
                "pattern_id": "P9",
            })

    # Dimension 8: Workflow completeness (numbered steps + error handling)
    has_numbered_steps = bool(re.search(r"^\d+\.", body, re.MULTILINE))
    error_pat = r"Error|if.*(?:empty|missing|invalid)"
    has_error_handling = bool(re.search(error_pat, body, re.IGNORECASE))
    if not has_numbered_steps:
        report["issues"].append({
            "severity": "optional",
            "category": "workflow",
            "message": "No numbered steps found in SKILL.md body",
            "fix": "Add numbered steps (1. 2. 3.) for clear workflow sequence.",
            "pattern_id": "P9",
        })
    if not has_error_handling:
        report["issues"].append({
            "severity": "optional",
            "category": "workflow",
            "message": "No error handling guidance found in SKILL.md body",
            "fix": "Add precondition checks and error messages for invalid inputs.",
            "pattern_id": "P10",
        })

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
