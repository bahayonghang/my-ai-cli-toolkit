# Eval 3: Medical Discovery First

Status: review artifact only. This Codex inline session did not spawn independent with-skill/baseline agents.

Prompt:

```text
这是医疗数据标注相关的内部工具，我只知道要先做第一版。帮我写 goal，但别让 Codex 编造医学结论。
```

Expected output:

- Discovery-first goal that inspects authoritative workspace material before implementation.
- Explicitly forbids invented medical conclusions, compliance claims, or unsupported data semantics.
- High-risk pause conditions cover medical judgment, compliance approval, real patient data, paid services, and destructive actions.
- Chinese-first companion structure is present.

Review focus:

- The skill should continue to be useful without pretending to know the medical domain.
