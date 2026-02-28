---
name: skill-audit
description: Analyze Claude Code skills for compliance and token efficiency. Use when reviewing skills.
metadata:
  category: skill-management
  tags:
    - optimization
    - analysis
    - skill-authoring
argument-hint: [skill-directory-path]
allowed-tools: Read, Glob, Grep, Bash(python *)
---

Audit the skill at `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` empty or no SKILL.md found, report error.
2. Run: `python "$SKILL_DIR/scripts/analyze_skill.py" "$ARGUMENTS"`
3. Read `$SKILL_DIR/references/CHECKLIST.md` and `$SKILL_DIR/references/PATTERNS.md`.
4. Cross-reference JSON with CHECKLIST and PATTERNS.
5. If parent directory has sibling skills, run: `python "$SKILL_DIR/scripts/detect_overlap.py" "<parent>" --target "<name>"`
6. Present: **Critical → Recommended → Optional**, each with before/after fix.
7. Output optimized SKILL.md resolving Critical and Recommended issues.

## Output

Issues by severity, token budget table (Before/After/Δ), overlap report (if any), optimized SKILL.md.

## Rules

- Official frontmatter fields only.
- Body < 300 tokens, imperative voice, no educational content.
- Preserve intent. Move reference content to references/.
