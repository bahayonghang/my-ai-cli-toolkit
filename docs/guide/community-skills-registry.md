# External Skills

## Overview

Third-party skills are described by the registry directory `content/community-skills-registry/`.

This registry lives as a sibling of the first-party catalog `content/skills/`, and it is not itself an installable skill directory.

The current model is:

- first-party skills: `content/skills/<category>/<skill-name>/`
- third-party registry index: `content/community-skills-registry/index.toml`
- third-party category fragments: `content/community-skills-registry/categories/<category-id>.toml`
- web management surface: MCS Web and `npx skills`

## Supported install types

The registry currently documents:

- install kind: `skills_cli`
- providers: `vercel`, `playbooks`

## Relationship to MCS

MCS consumes this registry through `mcs-core` and exposes external-skill functionality in the web API.

That means:

- first-party catalog lives in `content/skills/`
- third-party registry lives at `content/community-skills-registry/`
- docs should still describe first-party skill directories and third-party registry data separately

## When to use it

Use external skills when:

- the capability is maintained outside this repository
- installation depends on another package manager or remote repo
- you want to keep third-party lifecycle separate from the first-party catalog

## Registry examples

The current curated taxonomy keeps five top-level categories:

- `engineering`
- `design`
- `research`
- `knowledge`
- `productivity`

Narrower themes such as `python`, `database`, `translation`, `obsidian`, or `video` should usually live in `tags` instead of becoming standalone categories.

```toml
# index.toml
[schema]
version = 2

[[groups]]
id = "engineering"
label = "Engineering"
order = 10

[[categories]]
id = "engineering"
group_id = "engineering"
label = "Engineering"
order = 10
file = "categories/engineering.toml"
```

```toml
# categories/engineering.toml
[[skills]]
id = "find-skills"
name = "find-skills"
tags = ["discovery", "registry", "workflow"]
install = { kind = "skills_cli", provider = "vercel", package_ref = "vercel-labs/skills", skill_flag = "find-skills" }
```

`category_id` is injected by the loader based on the fragment selected in `index.toml`.

The old standalone Python installer/TUI has been retired.
