# External Skills

## Overview

Third-party skills are described by the registry file `content/skills/external-skills.toml`.

This registry lives alongside the first-party catalog under `content/skills/`, but it is not itself an installable skill directory.

The current model is:

- first-party skills: `content/skills/<category>/<skill-name>/`
- third-party registry: `content/skills/external-skills.toml`
- web management surface: MCS Web `npx skills`

## Supported install types

The registry currently documents flows for:

- `npm-cli`
- `npx`
- `pip-cli`
- `git`
- `vercel`

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
[schema]
version = 2

[[skills]]
id = "find-skills"
name = "find-skills"
category_id = "frontend"

[skills.install]
kind = "skills_cli"
provider = "vercel"
package_ref = "vercel-labs/skills"
skill_flag = "find-skills"
```

The old standalone Python installer/TUI has been retired.
