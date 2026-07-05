---
name: renhua
description: Chinese public-writing editor for AI/tech posts, X/Twitter threads, product notes, model reviews, and public technical essays. Use when the user asks to 去AI味, 改得像本人, 写推特post, 精修中文AI技术文章, or remove AI-flavored shells while preserving facts, judgment, technical terms, lived experience, and author voice. Do not use for academic papers, codebase docs, bid documents, paper reading, or AI-detector evasion.
category: docs-writing-publishing
tags:
  - chinese-writing
  - public-writing
  - ai-tells
  - technical-writing
  - social-posts
  - product-notes
  - model-reviews
version: "1.0.0"
argument-hint: "[text-or-file] [--audit-only]"
allowed-tools: Read, Write, Edit, Bash(python *)
---

# Renhua

Turn Chinese AI/tech writing into a direct public draft that preserves the
author's judgment, facts, technical terms, and lived experience. Remove
AI-flavored structure without flattening the author's voice.

Default output is the revised text only. Add diagnosis only when the user asks
why a sentence feels AI-like or asks for audit-only feedback.

> Paths starting with `<skill-dir>` are relative to this skill's base directory,
> announced when the skill loads. Substitute that literal path; it is not an
> environment variable.

## When to Use

- Chinese AI/tech public writing: posts, X/Twitter threads, technical essays,
  product notes, model reviews, internal notes being polished for publication.
- Requests like `去AI味`, `改得像本人`, `写推特post`, `精修中文AI技术文章`,
  `这段太AI`, `像模型写的`, `顺滑但没作者判断`.
- Audit requests asking why a Chinese AI/tech paragraph feels AI-like.

## When Not to Use

- Academic papers, journal sections, dissertations, abstracts, or norm checks:
  use `humanizer-paper`.
- Codebase-grounded README/API/architecture docs or JSDoc: use
  `document-writer`.
- Tender, bid, procurement, RFP, or proposal documents: use `bidwriter`.
- Paper intake, deep reading, DOI normalization, synthesis, or gap finding: use
  `paper-workbench` or the relevant research skill.
- Detector-evasion framing such as "rewrite generated text so no AI detector
  flags it": refuse that framing and redirect to legitimate authorship work
  such as adding real tests, facts, evidence, and personal judgment.

## Operating Priorities

1. Preserve facts, numbers, product names, model names, dates, and technical
   terms.
2. Preserve the author's stance and uncertainty. Do not make the text more
   neutral just to sound polished.
3. Prefer concrete claims over abstractions. Keep specific tests, costs, model
   behavior, engineering details, and workflow observations.
4. Remove structure shells before polishing words.
5. Do not add new examples, data, quotes, or personal experience.

## Core Workflow

1. Identify the target surface: X/Twitter post, long article, product note,
   model review, or internal note.
2. Extract the source material into four buckets:
   - facts: dates, prices, model names, tools, test conditions
   - judgment: what the author believes after testing
   - experience: specific usage, failure, cost, workflow, or tradeoff
   - action: what the reader can do or avoid
3. Delete empty framing before rewriting:
   - platform boilerplate
   - AI disclaimer language
   - lecture setup
   - value-lifting summary
   - short imperative hooks such as `别急着...先...` or `顺序别反了`
   - conclusions that only repeat the previous paragraph
4. Rewrite with short public-writing paragraphs. For X/Twitter, default to 3-5
   paragraphs unless the user asks for another shape.
5. Scan for banned shells from `references/pattern-rules.md`. If one remains,
   rewrite that sentence again.

## Style Rules

- Use first person when the source includes direct testing or judgment.
- Keep English technical terms that Chinese AI/engineering writers normally use,
  such as Agent, LLM eval, token, cache, API, GPT, Claude, and Codex.
- Use concrete verbs: `测了`, `跑了`, `拉到本地`, `校验通过`, `单测过了`,
  `保留`, `删掉`, `改散`.
- Prefer completed action when reporting completed work, for example
  `这轮我保留了 X，用它处理 Y`.
- Use exact category nouns. Prefer `六类用途`, `三种输出形态`, `两个校验问题`
  over `几种东西`, `几个方向`.
- Keep mild roughness if it carries the author's voice.
- Do not use emoji, hashtags, Markdown tables, or numbered lists in public posts
  unless the user asks.
- Avoid ending with an instruction to the reader. End on a concrete judgment or
  result.

## Pattern Rules

Read `references/pattern-rules.md` before rewriting or auditing. It contains the
full hard-ban catalog and examples for binary contrast shells, command-template
openings, fake insight markers, lecture colon, vague referents, wrong time
stance, vague comparatives, abstract-pressure endings, and slogan endings.

## Residual-Pattern Reporter

For long drafts or when you need evidence for the final scan, run the reporter.
It reports coordinates only; it never rewrites text and is not an AI detector.

```powershell
python "<skill-dir>/scripts/renhua_lint.py" --file "<draft.txt>" --json
```

If the text is not in a file, omit `--file` and pass it on stdin.

## Audit Mode

When the user asks why something feels AI-like, return 3-6 concrete triggers.
Each trigger must quote the phrase and name the pattern.

Use this format:

```text
1. 「...」：二元对比壳。直接说后半句承载的判断。
2. 「...」：伪洞察标记。删掉提示词，从事实起句。
3. 「...」：冒号讲义腔。改成普通句子或拆段。
```

Do not rewrite in audit-only mode unless the user asks for a revision after the
diagnosis.

## Output Contract

- Normal rewrite: return the revised text only.
- Audit-only: return the trigger list only.
- Rewrite plus explanation, when explicitly requested: return revised text first,
  then a short change summary.
