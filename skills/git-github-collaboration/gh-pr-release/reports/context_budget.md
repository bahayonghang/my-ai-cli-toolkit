# Context Budget

- Explicit default budget: `1000` initial-load tokens
- Estimated initial load: `994`
- SKILL.md body: `744`
- Deferred resource tokens: `28675` of the `120000` warning threshold
- Largest deferred resource: `scripts` at `16806` tokens
- Large deferred resource directories: `0`
- Unused resource directories: `0`
- Resource governance: `not-required`
- Quality density: `135.8`

Evidence command:

```powershell
python C:\Users\lyh\.skillsmanage\skills\yao-meta\scripts\resource_boundary_check.py skills\git-github-collaboration\gh-pr-release --max-initial-tokens 1000
```

The explicit 1000-token gate passed with no failures or warnings on 2026-07-21.
