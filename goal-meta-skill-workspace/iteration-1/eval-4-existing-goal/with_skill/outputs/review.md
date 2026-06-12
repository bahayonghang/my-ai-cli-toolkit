# Eval 4: Existing Goal Management

Status: review artifact only. This Codex inline session did not spawn independent with-skill/baseline agents.

Prompt:

```text
我已经在 Codex 里开了一个 goal，现在想暂停它，别帮我重新写目标。
```

Expected output:

- Minimal answer with `/goal pause`.
- Does not draft a replacement `/goal <objective>`.
- May mention `/goal`, `/goal resume`, or `/goal clear` only as related management commands.

Review focus:

- The skill should distinguish drafting a new goal from managing an active one.
