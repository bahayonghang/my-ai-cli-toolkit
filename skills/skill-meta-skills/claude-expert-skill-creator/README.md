# create-expert-skill

> Transform expert conversations into production-grade Claude Skills. Whith this enhanced "skill-creator" skill you can capture domain knowledge and system-specific ontologies through structured roleplay. It also packages deterministic scripts alongside flexible guidance, and loads expertise progressively, turning AI assistants into specialists.

## Why This Exists

Anthropic released a basic "skill-creator", however, it doesn't utilize the entire range of what's possible within a Skill. This enhanced skill creator makes use of resources, examples, templates, scripts, progressive disclosure and system architecture knowledge to deliver elaborate skills, zipped and ready to upload.

## Why the "Expert" Part Matters

AI assistants struggle in production for two reasons:

1. **Missing domain expertise** — Generic models don't know or aren't primed with your industry's edge cases, terminology, or unwritten rules.
2. **Missing ontology understanding** — They don't grasp your specific data structures, entity relationships, or system constraints

This skill solves both by helping you:
- **Interview experts** (or yourself) to extract implicit domain knowledge
- **Map system ontologies** — company-specific structures, codes, and relationships
- **Separate deterministic work** (validation, parsing, math) from flexible interpretation
- **Load knowledge progressively** — only what's needed, when it's needed

The result: Claude works like a trained specialist who understands both the domain AND your specific systems.

## Installation

### Claude Desktop (Recommended)

The packaged `.zip` file is included in this repository for easy installation:

1. Download `create-expert-skill-v2.2.zip` from this repository
2. Open Claude Desktop → **Settings** → **Capabilities**
3. Under Skills, click **Upload Skill**
4. Drag and drop the `.zip` file (no need to unzip)

### Claude Code

Skills can be installed at user or project level:

**Personal skills** (available in all projects):
```bash
# Unzip and copy to your personal skills directory
unzip create-expert-skill-v2.2.zip -d ~/.claude/skills/
```

**Project skills** (shared with team via git):
```bash
# Unzip into your project's .claude/skills/ directory
unzip create-expert-skill-v2.2.zip -d ./.claude/skills/
git add .claude/skills/create-expert-skill
git commit -m "Add create-expert-skill"
```

Claude Code automatically discovers skills in these locations.

### Claude Agent SDK

For programmatic usage with the Agent SDK:

1. Create skills directory in your project: `.claude/skills/`
2. Unzip the skill into that directory
3. Enable skills in your configuration by adding `"Skill"` to `allowed_tools`

```python
from claude_agent_sdk import query, ClaudeAgentOptions

options = ClaudeAgentOptions(
    allowed_tools=["Skill", "Read", "Write", "Bash"],
    # Skills are auto-discovered from .claude/skills/
)
```

See [Agent Skills in the SDK](https://platform.claude.com/docs/en/agent-sdk/skills) for full documentation.

## Usage

Start a conversation:
> "I want to create a skill for validating LEDES billing files"

Claude guides you through:
```
Assess  → Is this worth creating? (3+ uses, consistent procedure)
Discover → What's the domain expertise? What are the system ontologies?
Design  → What needs scripts vs guidance vs reference material?
Create  → Generate the skill
Refine  → Iterate until complete
Ship    → Package for deployment
```

## How It Works

### Two Knowledge Streams

Production-ready skills require BOTH:

**Domain Expertise** — Industry knowledge that applies universally:
- Standards and their versions (e.g., LEDES 98B vs XML 2.0)
- Professional conventions and edge cases
- Validation rules from specifications

**Ontology Understanding** — System-specific structures:
- Company policies and constraints
- Entity relationships (timekeepers → IDs → rates)
- Data format variations unique to your systems

### Progressive Disclosure Architecture

Skills load knowledge in layers, not all at once:

```
Layer 0 (~25 tokens)   → Description only, always visible
Layer 1 (~500 tokens)  → Core procedures in SKILL.md, loaded when triggered
Layer 2 (~1000+ tokens) → Deep reference in resources/, loaded selectively
```

**Why this matters:** A 2,000-token skill that loads everything wastes context. A layered skill loads 25 tokens until needed, then 500, then more only if required.

### Deterministic Scripts

Anything that can be computed exactly should be:

| Task | Without Script | With Script |
|------|---------------|-------------|
| Validate date format | LLM guesses (sometimes wrong) | `python validate.py` (always right) |
| Sum line items | LLM approximates | Script calculates exactly |
| Check against schema | LLM interprets | Script returns pass/fail |

Scripts run at **zero token cost** — Claude executes them and uses the output.

### Skill Structure

```
my-skill/
├── SKILL.md              # Layer 1: Core procedures (300-500 tokens)
├── scripts/              # Layer 0: Deterministic automation
│   └── validate.py
└── resources/            # Layer 2: Deep reference (loaded selectively)
    ├── schemas/
    └── ADVANCED.md
```

## Token Optimization

| Technique | Before | After | Savings |
|-----------|--------|-------|---------|
| Scripts | 500 tokens explaining logic | `python scripts/validate.py` | ~450 |
| Reference files | Inline schema (200 tokens) | Link to file | ~185 |
| Layer 2 split | Everything in SKILL.md | Split to resources/ | ~750 |

## Packaging

**This skill includes an automated zipping procedure** In most cases, it runs on its own once the expert skill is finished, returning the plug-and-play .zip of the skill directly in conversation. If this doesn't run automatically, simply ask Claude to deliver the packaged skill.

## Files

```
create-expert-skill/
├── SKILL.md                          # Main skill (Layer 1)
├── README.md                         # This file
├── LICENSE                           # MIT
├── create-expert-skill-v2.2.zip      # Ready-to-install package
├── scripts/
│   ├── package_skill.py              # Packaging automation
│   └── README.md
└── resources/
    ├── templates/
    │   └── TEMPLATES.md              # Skill templates (minimal/enhanced/script)
    └── examples/
        └── EXAMPLES.md               # Domain patterns (billing, API, schemas)
```

## Contributing

Found a bug or want to improve the skill?
- Open an issue for bugs or feature requests
- PRs welcome for templates, examples, or documentation

## License

MIT — use freely, modify as needed.

## Author

[Vlad-Alexandru Nicolescu](https://github.com/vnicolescu)

---

**Version:** 2.2
**Tested with:** Claude Desktop
