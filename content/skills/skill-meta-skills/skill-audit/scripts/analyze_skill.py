#!/usr/bin/env python
"""Analyze a Claude Code skill for compliance, token efficiency, and best practices."""

import contextlib
import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.utils import (
    FRONTMATTER_PATTERN,
    estimate_tokens,
    extract_body_refs,
    parse_frontmatter,
)

OFFICIAL_FIELDS = {
    "name", "description", "argument-hint", "disable-model-invocation",
    "user-invocable", "allowed-tools", "model", "context", "agent", "hooks",
    "license", "compatibility", "metadata",
}

# Fields that belong inside `metadata:` block per the official spec.
METADATA_SUBFIELDS = {"category", "tags"}

CJK_PATTERN = re.compile(r"[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]")


def _str_field(fields: dict, key: str, default: str = "") -> str:
    """Get a frontmatter field value as a string (join lists with ', ')."""
    val = fields.get(key, default)
    if isinstance(val, list):
        return ", ".join(val)
    return val  # type: ignore[return-value]


def _check_english_content(content: str) -> bool:
    """Check if content is primarily English (>=70% ASCII in first 2000 chars)."""
    sample = content[:2000]
    if not sample:
        return True
    non_ascii = sum(1 for c in sample if ord(c) > 127)
    return (1 - non_ascii / len(sample)) >= 0.70


def _has_metadata_block(fields: dict) -> bool:
    """Check if metadata field contains at least one sub-key."""
    meta = fields.get("metadata")
    if meta is None:
        return False
    if isinstance(meta, str):
        return bool(meta.strip())
    if isinstance(meta, list):
        return len(meta) > 0
    return bool(meta)


def _license_not_placeholder(fields: dict) -> bool:
    """Check if license value is not a placeholder like Unknown/TBD/N/A."""
    raw = fields.get("license")
    if raw is None:
        return False
    s = str(raw).strip()
    if not s:
        return False
    placeholders = {"unknown", "n/a", "na", "none", "null", "tbd", "todo", "-"}
    return s.lower() not in placeholders


def _has_version_info(fields: dict, body: str) -> bool:
    """Check if frontmatter or body contains version information."""
    for key in ("version", "skill-version", "data-version"):
        if fields.get(key):
            return True
    # Check metadata string for version info
    meta = fields.get("metadata")
    if isinstance(meta, str) and "version" in meta.lower():
        return True
    if isinstance(meta, list) and any("version" in str(item).lower() for item in meta):
        return True
    # Check body for version patterns
    if re.search(r"\bv(?:ersion)?\s*[:\s]\s*\d+(?:\.\d+)*", body, re.IGNORECASE):
        return True
    return bool(re.search(r"(?:^|\s)v\d+(?:\.\d+)+(?:\s|[,.)]|$)", body))


def _compute_score(report: dict, fields: dict, body: str, content: str, skill_dir: Path) -> dict:
    """Compute 3-dimension quality score (24 pts max).

    Format (8): deduct from 8 per format violation.
    Completeness (8): add 1 per completeness item present.
    Writing (8): add 1 per writing quality item satisfied.
    """
    issues = report["issues"]
    structure = report["structure"]

    def _has_issue(
        category: str | None = None,
        message_contains: str | None = None,
        categories: set[str] | None = None,
    ) -> bool:
        for iss in issues:
            cat = iss["category"]
            if category and cat != category:
                if not categories or cat not in categories:
                    continue
            elif categories and cat not in categories:
                continue
            if message_contains and message_contains.lower() not in iss["message"].lower():
                continue
            return True
        return False

    # --- Format (8 pts, deduct from 8) ---
    format_checks = [
        ("SKILL.md exists", structure.get("has_skill_md", False)),
        ("Directory name format", not _has_issue(category="name", message_contains="Invalid")),
        ("No README.md", not _has_issue(category="structure", message_contains="README")),
        (
            "YAML frontmatter present",
            not _has_issue(category="frontmatter", message_contains="not found"),
        ),
        (
            "name matches directory",
            not _has_issue(category="name", message_contains="does not match"),
        ),
        (
            "description field present",
            "description" not in report["frontmatter"].get("missing_required", []),
        ),
        (
            "description under 1024 chars",
            not _has_issue(category="description", message_contains="1024"),
        ),
        (
            "description no XML brackets",
            not _has_issue(categories={"description", "security"}, message_contains="XML"),
        ),
    ]
    format_details = []
    format_score = 8
    for label, passed in format_checks:
        format_details.append({"item": label, "pass": passed})
        if not passed:
            format_score -= 1

    # --- Completeness (8 pts, add from 0) ---
    compat = fields.get("compatibility")
    compat_ok = bool(compat) and (not isinstance(compat, str) or len(compat) <= 500)

    comp_checks = [
        ("license field", "license" in fields),
        ("compatibility field (<=500 chars)", compat_ok),
        ("metadata block", _has_metadata_block(fields)),
        ("scripts/ directory", structure.get("has_scripts", False)),
        ("references/ directory", structure.get("has_references", False)),
        ("assets/ directory", structure.get("has_assets", False)),
        ("body has examples", not _has_issue(category="workflow", message_contains="examples")),
        (
            "body has error handling",
            not _has_issue(category="workflow", message_contains="error handling"),
        ),
    ]
    comp_details = []
    comp_score = 0
    for label, passed in comp_checks:
        comp_details.append({"item": label, "pass": passed})
        if passed:
            comp_score += 1

    # --- Writing (8 pts, add from 0) ---
    desc = _str_field(fields, "description")
    desc_lower = desc.lower() if desc else ""
    vague = bool(re.search(r"\b(helps? with|assists? with|supports? .{0,20}\.)", desc_lower))
    trigger_pat = r"\buse\s+when\b|\btrigger|\bactivate|\binvoke\s+when\b|触发|适用于|当.*时"
    has_trigger = bool(re.search(trigger_pat, desc, re.IGNORECASE)) if desc else False
    tokens_body = report["tokens"].get("skill_md_body", 0)
    has_refs_or_scripts = (
        structure.get("has_references", False) or structure.get("has_scripts", False)
    )
    progressive = tokens_body <= 500 and has_refs_or_scripts

    writing_checks = [
        ("description task boundary", len(desc) >= 40 and not (vague and len(desc) < 80)),
        ("description trigger", has_trigger),
        ("progressive disclosure", progressive),
        ("content primarily English", _check_english_content(content)),
        ("forward ref consistency", not _has_issue(message_contains="Dangling")),
        ("reverse ref consistency", not _has_issue(message_contains="does not reference")),
        ("license not placeholder", _license_not_placeholder(fields)),
        ("version info", _has_version_info(fields, body)),
    ]
    writing_details = []
    writing_score = 0
    for label, passed in writing_checks:
        writing_details.append({"item": label, "pass": passed})
        if passed:
            writing_score += 1

    total = format_score + comp_score + writing_score
    return {
        "format": format_score,
        "completeness": comp_score,
        "writing": writing_score,
        "total": total,
        "max": 24,
        "details": {
            "format": format_details,
            "completeness": comp_details,
            "writing": writing_details,
        },
    }


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
    readme_md = skill_dir / "README.md"
    readme_cn = skill_dir / "README_CN.md"

    has_resources = (skill_dir / "resources").is_dir()
    has_references = (skill_dir / "references").is_dir()
    has_assets = (skill_dir / "assets").is_dir()

    report["structure"] = {
        "has_skill_md": skill_md.exists(),
        "has_scripts": (skill_dir / "scripts").is_dir(),
        "has_resources": has_resources,
        "has_references": has_references,
        "has_assets": has_assets,
        "files": [
            str(p.relative_to(skill_dir))
            for p in skill_dir.rglob("*")
            if p.is_file() and "__pycache__" not in p.parts
        ],
    }

    if readme_md.exists() or readme_cn.exists():
        report["issues"].append({
            "severity": "recommended",
            "category": "structure",
            "message": "README.md found in skill directory",
            "fix": (
                "Remove README.md from the skill folder. "
                "Documentation should be in SKILL.md or references/."
            ),
            "pattern_id": "P14",
        })

    if has_resources:
        report["issues"].append({
            "severity": "recommended",
            "category": "structure",
            "message": "Directory 'resources/' found; should be renamed per official spec",
            "fix": (
                "Rename to 'references/' if content should be auto-loaded into Agent context, "
                "or 'assets/' if files are static templates referenced by path only."
            ),
            "pattern_id": "P15",
        })

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
    skill_name = fields.get("name", "unknown")
    report["skill_name"] = skill_name

    # Check skill name validity
    if isinstance(skill_name, str):
        if not re.match(r"^[a-z0-9-]+$", skill_name):
            report["issues"].append({
                "severity": "critical",
                "category": "name",
                "message": f"Invalid skill name format: '{skill_name}'",
                "fix": "Use kebab-case only. No spaces, underscores, or uppercase letters.",
                "pattern_id": "P13",
            })
        if "claude" in skill_name or "anthropic" in skill_name:
            report["issues"].append({
                "severity": "critical",
                "category": "name",
                "message": f"Skill name contains reserved word: '{skill_name}'",
                "fix": "Remove 'claude' or 'anthropic' from the name as they are reserved.",
                "pattern_id": "P13",
            })
        folder_name = skill_dir.name
        if skill_name != folder_name:
            report["issues"].append({
                "severity": "recommended",
                "category": "name",
                "message": f"Folder name '{folder_name}' does not match skill name '{skill_name}'",
                "fix": f"Rename folder to '{skill_name}' or update name field to '{folder_name}'.",
                "pattern_id": "P13",
            })

    non_standard = [k for k in fields if k not in OFFICIAL_FIELDS and k not in METADATA_SUBFIELDS]
    misplaced_metadata = [k for k in fields if k in METADATA_SUBFIELDS]
    missing = [f for f in ["name", "description"] if f not in fields]
    missing_recommended = [f for f in ["argument-hint", "allowed-tools"] if f not in fields]

    report["frontmatter"] = {
        "fields": fields,
        "non_standard": non_standard,
        "misplaced_metadata": misplaced_metadata,
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
            "fix": f"Remove '{f}' from frontmatter. Move to body or references/ if needed.",
            "pattern_id": "P1",
        })
    for f in misplaced_metadata:
        report["issues"].append({
            "severity": "recommended",
            "category": "frontmatter",
            "message": f"Field '{f}' should be inside 'metadata' block",
            "fix": f"Move '{f}' into the 'metadata:' section of frontmatter.",
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

    # Security: XML brackets in any frontmatter field
    for field_name, field_val in fields.items():
        if field_name == "description":
            continue  # checked separately with specific message
        val_str = field_val if isinstance(field_val, str) else str(field_val)
        if "<" in val_str or ">" in val_str:
            report["issues"].append({
                "severity": "critical",
                "category": "security",
                "message": f"XML brackets in frontmatter field '{field_name}'",
                "fix": f"Remove < > from '{field_name}'. Frontmatter is included in system prompt.",
                "pattern_id": "P12",
            })

    if desc:
        if "<" in desc or ">" in desc:
            report["issues"].append({
                "severity": "critical",
                "category": "description",
                "message": "XML brackets (< >) found in description",
                "fix": "Remove XML brackets from description due to security injection risks.",
                "pattern_id": "P12",
            })

        if len(desc) > 1024:
            report["issues"].append({
                "severity": "critical",
                "category": "description",
                "message": f"Description exceeds 1024 character limit ({len(desc)} chars)",
                "fix": "Shorten description to under 1024 characters.",
                "pattern_id": "P2",
            })

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

    # Compatibility field validation (1-500 chars per official spec)
    compat = _str_field(fields, "compatibility")
    if compat and len(compat) > 500:
        report["issues"].append({
            "severity": "recommended",
            "category": "frontmatter",
            "message": f"compatibility field too long ({len(compat)} chars, max 500)",
            "fix": "Shorten compatibility to under 500 characters.",
        })

    # Token analysis
    tokens_skill_md = estimate_tokens(content)
    tokens_body = estimate_tokens(body)
    tokens_desc = estimate_tokens(desc)
    tokens_resources = 0
    ref_dir = skill_dir / "references"
    if ref_dir.is_dir():
        for f in ref_dir.rglob("*"):
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
            "fix": "Move reference content to references/. Keep only imperative steps.",
            "pattern_id": "P3",
        })
    elif tokens_body > 300:
        report["issues"].append({
            "severity": "recommended",
            "category": "tokens",
            "message": f"SKILL.md body could be trimmed ({tokens_body} tokens, target < 300)",
            "fix": "Review for content that could move to references/.",
            "pattern_id": "P3",
        })

    if tokens_skill_md > 3000:
        report["issues"].append({
            "severity": "critical",
            "category": "tokens",
            "message": f"SKILL.md token budget exceeded ({tokens_skill_md} tokens, limit 3000)",
            "fix": "Reduce SKILL.md content. Move reference materials to references/.",
            "pattern_id": "P3",
        })
    elif tokens_skill_md > 2500:
        report["issues"].append({
            "severity": "recommended",
            "category": "tokens",
            "message": f"SKILL.md tokens approaching limit ({tokens_skill_md} tokens, limit 3000)",
            "fix": "Consider trimming SKILL.md to stay under budget.",
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
    first_person = [r"\bI\'ll\b", r"\bI will\b", r"\bwe should\b", r"我(们)?\s*[会打算要想]"]
    passive_voice = [
        r"\bis\s+\w+ed\b", r"\bare\s+\w+ed\b", r"\bshould be\b",
        r"\bit would\b", r"被.*[处理执行完成]", r"将.*被",
    ]
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
                "fix": "Move to references/BACKGROUND.md.",
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

    # Dimension 9: Recommended sections (examples + troubleshooting)
    if tokens_body > 100:
        has_examples = bool(re.search(
            r"^#{1,3}\s*(Examples?|Usage)", body, re.MULTILINE | re.IGNORECASE,
        )) or bool(re.findall(r"```[\s\S]*?```", body))
        if not has_examples:
            report["issues"].append({
                "severity": "optional",
                "category": "workflow",
                "message": "No examples section found in SKILL.md body",
                "fix": "Add an ## Examples section with common usage scenarios.",
                "pattern_id": "P9",
            })

        has_troubleshooting = bool(re.search(
            r"^#{1,3}\s*(Troubleshoot|Common\s+Issues?|Error\s+Handling)",
            body, re.MULTILINE | re.IGNORECASE,
        ))
        if not has_troubleshooting:
            report["issues"].append({
                "severity": "optional",
                "category": "workflow",
                "message": "No troubleshooting section found in SKILL.md body",
                "fix": "Add a ## Troubleshooting section for common error cases.",
                "pattern_id": "P10",
            })

    # Dimension 11: Reference consistency
    body_refs = extract_body_refs(body)
    for dir_type in ("references", "scripts"):
        dir_path = skill_dir / dir_type
        for stem in sorted(body_refs[dir_type]):
            if dir_path.is_dir():
                candidates = list(dir_path.glob(f"{stem}.*"))
                if not any(p.is_file() for p in candidates):
                    report["issues"].append({
                        "severity": "recommended",
                        "category": "consistency",
                        "message": f"Dangling reference: {dir_type}/{stem}.* not found",
                        "fix": f"Create the missing file in {dir_type}/ or update the reference.",
                        "pattern_id": "P16",
                    })
            else:
                report["issues"].append({
                    "severity": "recommended",
                    "category": "consistency",
                    "message": (
                        f"Dangling reference: {dir_type}/ directory does not exist"
                        f" (body references {dir_type}/{stem})"
                    ),
                    "fix": f"Create {dir_type}/ with the referenced file, or remove the reference.",
                    "pattern_id": "P16",
                })

    for dir_type in ("references", "scripts"):
        dir_path = skill_dir / dir_type
        if dir_path.is_dir():
            existing = [p for p in dir_path.iterdir() if p.is_file()]
            if existing and not body_refs[dir_type]:
                report["issues"].append({
                    "severity": "optional",
                    "category": "consistency",
                    "message": f"{dir_type}/ has files but body does not reference any",
                    "fix": f"Reference at least one file from {dir_type}/ in the SKILL.md body.",
                    "pattern_id": "P16",
                })

    # Dimension 12: Content & metadata completeness
    if not _check_english_content(content):
        report["issues"].append({
            "severity": "recommended",
            "category": "writing",
            "message": "Content is not primarily in English (<70% ASCII in sample)",
            "fix": "Write primary content in English for broader accessibility.",
        })

    if "license" not in fields:
        report["issues"].append({
            "severity": "optional",
            "category": "completeness",
            "message": "No license field in frontmatter",
            "fix": "Add a license field (e.g., license: MIT) to frontmatter.",
        })
    elif not _license_not_placeholder(fields):
        report["issues"].append({
            "severity": "optional",
            "category": "completeness",
            "message": f"License is a placeholder value: '{_str_field(fields, 'license')}'",
            "fix": "Replace placeholder with an actual license (e.g., MIT, Apache-2.0).",
        })

    if not _has_version_info(fields, body):
        report["issues"].append({
            "severity": "optional",
            "category": "completeness",
            "message": "No version information found in frontmatter or body",
            "fix": "Add version info in metadata (e.g., metadata: version: '1.0') or body.",
        })

    if not _has_metadata_block(fields):
        report["issues"].append({
            "severity": "optional",
            "category": "completeness",
            "message": "No metadata block or metadata is empty",
            "fix": "Add metadata block with at least one sub-key (e.g., category, tags, version).",
        })

    # Compute quality score
    report["score"] = _compute_score(report, fields, body, content, skill_dir)

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
