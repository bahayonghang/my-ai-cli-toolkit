# External Skills

## Overview

Third-party skills are described by the registry directory `content/skills/external-skills/`.

This registry lives alongside the first-party catalog under `content/skills/`, but it is not itself an installable skill directory.

The current model is:

- first-party skills: `content/skills/<category>/<skill-name>/`
- third-party registry index: `content/skills/external-skills/index.toml`
- third-party category fragments: `content/skills/external-skills/categories/<category-id>.toml`
- web management surface: MCS Web `npx skills`

## Supported install types

The registry currently documents:

- install kind: `skills_cli`
- providers: `vercel`, `playbooks`

## Relationship to MCS

MCS consumes this registry through `mcs-core` and exposes external-skill functionality in the web API.

That means:

- first-party catalog lives in `content/skills/`
- third-party registry also lives under `content/skills/`
- docs should still describe first-party skill directories and third-party registry data separately

## When to use it

Use external skills when:

- the capability is maintained outside this repository
- installation depends on another package manager or remote repo
- you want to keep third-party lifecycle separate from the first-party catalog

## Registry examples

```toml
# index.toml
[schema]
version = 2

[[categories]]
id = "frontend"
group_id = "engineering"
label = "Frontend"
order = 10
file = "categories/frontend.toml"
```

```toml
# categories/frontend.toml
[[skills]]
id = "find-skills"
name = "find-skills"
tags = ["discovery", "registry"]
install = { kind = "skills_cli", provider = "vercel", package_ref = "vercel-labs/skills", skill_flag = "find-skills" }
```

`category_id` is injected by the loader based on the fragment selected in `index.toml`.

The old standalone Python installer/TUI has been retired.
