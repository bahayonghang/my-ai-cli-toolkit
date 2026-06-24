# AI tells, re-gated for academic register

This is the analysis kernel. It is the 33-pattern taxonomy from
[Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
(WikiProject AI Cleanup), **re-gated for academic prose**. The Wikipedia list
was written for general/encyclopedic text. In an English journal article or a
Chinese doctoral dissertation, several of its defaults are *backwards*: deleting
them damages compliant academic language.

Each pattern carries one of three gates:

- **保留 (keep)** — still an AI tell in academic register; apply as written.
- **校准 (calibrate)** — conditional; do not apply blindly. Gate by section or
  by whether the construction is doing real academic work.
- **禁用 (disable)** — harmful in academic register; turn off or reverse.

Read this with the active norm pack (`en-journal.md` or `zh-dissertation.md`).
The norm pack decides the per-section behavior; this file decides the per-tell
gate and gives academic before/after rewrites.

The conflict table lives in the task design; the per-pattern detail is here.

---

## Part 1 — The 33 patterns, re-gated

### 1. Undue emphasis on significance, legacy, broader trends — 保留

Still a hard tell. Academic variants: "makes a significant contribution to",
"plays a crucial/pivotal role in", "marks a paradigm shift in", "推动了……的
发展", "具有重要的理论与现实意义". Anchor to the specific result, not the
imagined importance.

- Before (EN): *This work makes a significant contribution to the field and
  marks a pivotal moment in the evolution of graph learning.*
- After (EN): *This work reduces message-passing cost from O(E) to O(V log V) on
  the three benchmark graphs in Table 2.*
- Before (ZH): *本研究填补了该领域的空白，对推动学科发展具有重要意义。*
- After (ZH): *本研究在 XX 数据集上将误检率从 12.3% 降至 4.1%（见表 3）。*

### 2. Undue emphasis on notability and media coverage — 保留

Rare in papers, but appears as "widely cited", "has attracted considerable
attention", "备受关注". Replace with the specific evidence (a count, a named
study) or cut.

- Before: *This method has attracted considerable attention in the community.*
- After: *Three follow-up studies [12, 18, 24] adopt this loss without
  modification.*

### 3. Superficial -ing analyses (fake depth) — 保留

Trailing "-ing" participles that assert significance without evidence:
"highlighting the importance of", "underscoring its role", "thereby ensuring",
"从而体现了……". Cut the participle or convert it to a claim with support.

- Before (EN): *We add a gating layer, highlighting the model's capacity to
  adapt, reflecting the broader trend toward modularity.*
- After (EN): *We add a gating layer. It improves out-of-distribution accuracy
  by 2.4 points (Table 4).*
- Before (ZH): *引入注意力机制，凸显了模型的适应能力，体现了模块化的发展趋势。*
- After (ZH): *引入注意力机制后，跨域准确率提升 2.4 个百分点（表 4）。*

### 4. Promotional / advertisement-like language — 保留

"novel", "powerful", "state-of-the-art" (as decoration), "groundbreaking",
"vibrant", "强大的", "先进的", "卓越的". Keep "novel/SOTA" only as a precise,
defended claim, not as varnish.

- Before: *We propose a powerful and groundbreaking framework that achieves
  remarkable performance.*
- After: *We propose a framework that matches the prior best F1 (0.91) with 40%
  fewer parameters.*

### 5. Vague attributions and weasel words — 反转 / 校准

In general prose the fix is to delete the unsourced claim. In academic prose the
fix is the **opposite**: supply the real `(author, year)` / `[n]` citation. This
also feeds the new **ghost citation** tell (Part 2). Delete only if no source
exists *and* the claim is not load-bearing.

- Before (EN): *Experts argue that transformers generalize better than RNNs.*
- After (EN): *Vaswani et al. (2017) and Devlin et al. (2019) report stronger
  transfer than recurrent baselines on GLUE.*
- Before (ZH): *有研究表明该方法优于传统模型。*
- After (ZH): *文献 [7] 在同一基准上报告其 AUC 较传统模型高 0.06。*

### 6. Outline-like "Challenges and Future Prospects" sections — 校准

The boilerplate "Despite its … faces several challenges … continues to thrive"
shape is a tell and must go. But academic writing has a **mandated** future-work
/ limitations structure (see §25). Replace the formulaic shell with specific,
grounded limitations and concrete next steps — do not delete the section.

- Before: *Despite challenges typical of the field, the approach continues to
  show great promise for future work.*
- After: *The method assumes i.i.d. samples; performance on the temporally
  correlated split (Table 6) drops 8 points, which motivates the sequence model
  in Section 7.*

### 7. Overused "AI vocabulary" words — 保留

delve, intricate, tapestry, testament, underscore, leverage (as filler),
pivotal, realm, nuanced, robust (as decoration), 赋能, 抓手, 维度 (as filler),
深入, 助力. These are high-frequency post-2023 markers; they co-occur. Prefer the
plain academic verb.

- Before: *We delve into the intricate interplay between the modules, leveraging
  a robust pipeline.*
- After: *We analyze how the modules interact, using the pipeline in Figure 1.*

### 8. Copula avoidance (avoiding is/are) — 保留

"serves as", "stands as", "represents", "boasts", "充当", "扮演……的角色".
Restore the plain copula where it is clearer.

- Before: *Attention serves as the core mechanism and boasts strong scalability.*
- After: *Attention is the core mechanism. It scales to sequences of length 4k.*

### 9. Negative parallelisms and tailing negations — 保留

"not only … but also", "it is not merely X, it is Y", clipped "no guessing"
tails. Overused for rhetorical lift. Write the real clause.

- Before: *This is not merely an optimization; it is a rethinking of the loss.*
- After: *This changes the loss function (Equation 3), not only its weights.*

### 10. Rule of three overuse — 保留

Forced triples to sound comprehensive: "fast, accurate, and scalable";
"高效、准确、可扩展". Keep a triple only when all three members are real and
independently supported.

- Before: *The model is efficient, robust, and generalizable.*
- After: *The model trains in 4 GPU-hours and holds accuracy within 1 point
  across the three domains in Table 5.*

### 11. Elegant variation (synonym cycling) — 保留并升级 (keep + upgrade)

In general prose this is merely an AI tell. In academic prose it **also violates
the norm of full-text terminology consistency** (GB term unification; consistent
notation in journals). Upgrade to a **hard rule**: one concept, one name,
throughout. This is the inverse of "vary your wording". See the new
**terminology drift** tell (Part 2) and the norm packs.

- Before (EN): *The protagonist model … the main network … the central
  architecture … the proposed system …* (all the same thing)
- After (EN): *the proposed model* (one canonical name everywhere)
- Before (ZH): *卷积神经网络……该深度网络……此卷积模型……* (同一对象)
- After (ZH): *卷积神经网络（CNN）……（全文统一称 CNN）*

### 12. False ranges — 保留

"from X to Y" where X and Y are not on a real scale: "from theory to practice,
from data to deployment", "从理论到实践，从数据到落地". State the actual span.

- Before: *Our study spans from the foundations of optimization to the frontiers
  of deployment.*
- After: *We evaluate SGD, Adam, and LAMB on the same schedule (Section 4).*

### 13. Passive voice and subjectless fragments — 校准 (section-gated)

In general prose, prefer active. In academic prose, **gate by section**. Methods
and experimental procedure conventionally use agentless passive ("samples were
collected", "样本经……处理"); do **not** force these to active. In
Introduction / Discussion, agentless passive that hides who did what can become
active for clarity. See the section gate in the norm packs.

- Methods, keep passive: *The dataset was split 70/15/15 by patient ID.*
- Discussion, may activate: *(general-prose draft)* "It is observed that
  accuracy degrades." → *(academic)* "We observe accuracy degrading on the
  out-of-domain split."

### 14. Em dashes and en dashes — 校准 (not a hard cut)

The general skill deletes every `—` and `–`. **Do not** hard-cut in academic
mode. Instead:

- Follow the target journal / institution style for the em dash `—`.
- **Keep** the en dash `–` in numeric ranges and compound modifiers:
  `1990–2000`, `pp. 12–18`, `dose–response`, `Bose–Einstein`.
- In Chinese, follow GB/T 15834 punctuation (range with 浪纹连接号 "～" or
  规范的连接号; not an ASCII hyphen).
- Still flag the AI *habit* of spaced ` — ` and double `--` parenthetical
  asides; rewrite those as a comma, colon, or restructured clause.

- Before: *The model — trained on 8 GPUs — reaches the dose-response range of
  10-100 mg.* (aside dashes are a tell; the range dash is wrong as a hyphen)
- After: *The model, trained on 8 GPUs, reaches the dose–response range of
  10–100 mg.*

### 15. Overuse of boldface — 保留

Mechanical bolding of phrases mid-paragraph. Academic body text rarely bolds;
keep bold only where the venue uses it (e.g. defined terms, run-in theorem
labels). Strip decorative bold.

- Before: *We use **batch normalization** and **dropout** to **regularize** the
  network.*
- After: *We use batch normalization and dropout to regularize the network.*

### 16. Inline-header vertical lists — 校准

"**Header:** sentence" bullet lists. Acceptable in a structured contributions
list; a tell when it replaces real prose in the body. Convert padded lists to
argued paragraphs; keep a genuine itemized contributions list.

- Before: *- **Accuracy:** Accuracy is improved. - **Speed:** Speed is improved.*
- After: *The method improves top-1 accuracy by 2.4 points (Table 4) and halves
  inference latency (Table 5).*

### 17. Title case in headings — 校准 (per style)

Heading case is **not** universally wrong in academia — it is style-dependent.
Many venues require Title Case headings; others use sentence case; Chinese
dissertations follow the school template. Do not flatten case blindly; conform
to the target style.

- Sentence-case venue: `## Strategic negotiations and global partnerships`
- Title-case venue: `## Strategic Negotiations and Global Partnerships`
- Decision: match the active style in the norm pack; do not impose one.

### 18. Emojis — 保留

No emojis in journal or dissertation text or headings. Remove all.

- Before: *## Results 🚀*
- After: *## Results*

### 19. Curly quotation marks — 校准 (per style)

In general prose the skill straightens curly quotes. In academic typesetting
curly quotes (and Chinese 全角引号 "" '') are frequently **required**. Conform to
the target style and GB punctuation for Chinese; do not straighten blindly.
Still treat curly quotes as a *clustered* tell, never a standalone verdict.

- EN per style: keep `"the proposed loss"` if the venue uses curly quotes.
- ZH per GB/T 15834: use 全角引号 "……"，不要混用直引号。

### 20. Collaborative communication artifacts — 保留

"I hope this helps", "Certainly!", "Would you like…", "希望对你有帮助", "如果
需要我可以继续". Chat correspondence pasted into a manuscript. Delete entirely.

- Before: *Below is the related work. Let me know if you'd like more detail!*
- After: *(start the related-work prose directly)*

### 21. Knowledge-cutoff disclaimers and speculative gap-filling — 保留

"As of my last update", "while specific details are limited", "据现有资料". A
paper must not contain model cutoff disclaimers or invented filler for missing
facts. State what is unknown, or cite a source; never dress a guess as a finding.

- Before: *While details are scarce, the dataset was likely collected around
  2019.*
- After: *The dataset collection date is not reported in [5]; we treat it as
  unknown.*

### 22. Sycophantic / servile tone — 保留

"Great question!", "You're absolutely right", "这是一个很好的问题". Never in a
manuscript. Remove.

### 23. Filler phrases — 保留

"in order to" → "to"; "due to the fact that" → "because"; "it is important to
note that" → (cut); "值得注意的是" / "众所周知" → (cut or make specific). These
add no information.

- Before: *It is important to note that the data shows a clear trend.*
- After: *The data show a clear upward trend (Figure 3).*

### 24. Excessive hedging — 校准 (calibrate, do not delete)

This is the single most-inverted pattern. **Hedging is the core of academic
epistemic stance.** "suggests", "may indicate", "appears to", "可能", "在一定
程度上" are correct scholarly calibration, not filler. The fix is two-directional:

- Remove only **stacked** hedges: "could possibly potentially be argued that" →
  "may"; "或许可能在一定程度上" → "可能".
- **Add** a hedge where an AI draft is over-confident about an unproven claim:
  "X causes Y" → "X is associated with Y" when only correlation is shown.

- Before (over-stacked): *It could potentially possibly be argued that the
  policy might have some effect.*
- After: *The policy may affect outcomes.*
- Before (over-confident AI): *Pre-training causes the gains.*
- After: *Pre-training is associated with the gains; we did not run the ablation
  needed to establish causation.*

### 25. Generic positive conclusions — 校准 (structure, not delete)

Cut the empty uplift ("the future is bright", "前景广阔, 未来可期"). But the
conclusion is a **mandated structure**, not free space: contributions +
limitations + future work (especially for a dissertation). Replace varnish with
that structure, grounded in the paper.

- Before: *In conclusion, the future looks bright and exciting times lie ahead.*
- After: *We contribute X and Y. The main limitation is the single-site dataset;
  future work should validate on multi-site data (Section 8).*

### 26. Hyphenated word-pair overuse — 校准

"data-driven", "real-time", "decision-making", "端到端". Keep hyphens in
**attributive** position (a high-quality report); drop them in predicate
position (the report is high quality) per the target style guide. This is a
style/grammar tell, not an academic violation.

- Before: *The method is data-driven and the pipeline is end-to-end.*
- After: *The method is data driven and the pipeline is end to end.* (attributive
  uses keep the hyphen: *a data-driven method*)

### 27. Persuasive authority tropes — 保留

"the real question is", "at its core", "fundamentally", "what really matters",
"从本质上讲", "归根结底". They pretend to cut to a deeper truth, then restate an
ordinary point. State the point plainly.

- Before: *At its core, what really matters is the inductive bias.*
- After: *The inductive bias drives most of the gain; removing it costs 5 points
  (Table 7).*

### 28. Signposting and announcements — 保留

"let's dive in", "here's what you need to know", "now let's look at",
"接下来我们将探讨", "下面让我们来看". LLM meta-commentary. Just present the
content. (Genuine, terse roadmap sentences in an Introduction are fine and are
*not* this tell.)

- Before: *Let's dive into how the encoder works. Here's what you need to know.*
- After: *The encoder maps tokens to 512-dim embeddings, then applies six
  attention blocks (Figure 2).*

### 29. Fragmented headers (one-line restatement after a heading) — 保留

A heading followed by a generic one-liner that just restates it. Delete the
warm-up line; start the real content.

- Before: *## Method\n\nThis section describes the method.\n\nWe build on …*
- After: *## Method\n\nWe build on …*

### 30. Diff-anchored writing — 校准

Prose that narrates a change ("this was added to replace…", "相比之前的方法,
我们改为…") instead of describing the thing. A tell in the body. **But** related
work and explicit comparisons legitimately contrast with prior methods — keep
those. Convert incidental change-narration to a standalone description.

- Before: *We changed the previous O(n²) loop to a hash map.*
- After: *Lookups use a hash map (O(1)).* (a real comparison to prior work stays:
  *unlike [9], which scans all pairs, …*)

### 31. Manufactured punchlines and staccato drama — 保留

Every sentence engineered to land; runs of short fragments for drama. "Then the
model arrived. No priors. No symmetry. The rules were gone." Inappropriate in
academic register. Use measured, connected prose.

- Before: *Then attention arrived. No recurrence. No locality. Everything
  changed.*
- After: *Attention replaced recurrence, removing the locality assumption of
  convolutional encoders.*

### 32. Aphorism formulas — 保留

"X is the Y of Z", "X becomes a trap", "the language of", "……的本质是……",
"……是一把双刃剑". Sounds profound, adds no precision. State the concrete claim.

- Before: *Attention is the grammar of modern deep learning.*
- After: *Attention lets each token weight every other token directly.*

### 33. Conversational rhetorical openers — 保留

"Honestly?", "Look,", "Here's the thing", "说实话", "其实吧". Fake-candid hooks.
Never in a manuscript. State the claim.

- Before: *Is the gain real? Honestly? It depends on the split.*
- After: *Whether the gain holds depends on the train/test split (Table 6).*

---

## Part 2 — New academic-specific tells

These are not in the Wikipedia list. They are the tells that journal editors,
reviewers, and Chinese AIGC detectors flag most in academic text.

### A. Ghost citation

Claims of evidence with **no author–year / numbered citation**: "studies show",
"research proves", "it is well established that", "研究表明", "大量文献指出".
One of the strongest reviewer signals. Fix: supply the specific citation, or
lower the claim strength to a hedge if no source exists. (This is the receiving
end of re-gated §5.)

- Before (EN): *Studies show that deeper networks generalize better.*
- After (EN): *He et al. (2016) report lower test error as depth increases up to
  152 layers on ImageNet.*
- Before (ZH): *研究表明，预训练能显著提升下游任务表现。*
- After (ZH): *文献 [3] 在 8 个下游任务上报告预训练带来平均 4.2% 的提升。*

### B. Hollow generalities (泛泛而谈)

Sweeping assertions with no data, method, or citation behind them — the core hit
of Chinese AIGC detectors and a frequent journal-desk rejection reason. Fix:
anchor every general claim to a specific number, method, dataset, or reference,
or cut it.

- Before (EN): *Deep learning has transformed many fields and shows great
  potential.*
- After (EN): *On the three benchmarks in Table 2, the deep model lowers error
  by 6–11% over the linear baseline.*
- Before (ZH): *人工智能技术在各个领域得到了广泛应用并取得了显著成效。*
- After (ZH): *在 XX 任务上，本方法较基线将 F1 从 0.78 提升至 0.86（表 2）。*

### C. Terminology drift (术语漂移)

The same concept appears under several names across the manuscript. Violates
full-text term unification (GB; journal notation consistency) and reads as
machine paraphrase. This is §11 escalated to a hard academic rule. Fix: pick a
canonical term (and symbol), define it once, use it everywhere; the lint script
surfaces candidate variants but the human/model decides canonicality.

- Before (EN): *the proposed model … our network … the system … the framework*
  (one object, four names)
- After (EN): *the proposed model* (everywhere, after one definition)
- Before (ZH): *自适应模块……该自适应单元……此适配组件……*
- After (ZH): *自适应模块（全文统一）*

### D. Low burstiness / over-long sentences

AI text has unusually uniform sentence length and low variance (burstiness).
Chinese AIGC detectors specifically flag mean sentence length **> 28 字** and
stacks of "几字 + 逗号" short clauses ("首先，", "其次，", "综上，"). Fix: vary
sentence length deliberately; split over-long sentences; break monotonous
parallel clause stacks. (The lint script measures sentence count, mean length,
stdev, and over-long ratio.)

- Before (ZH): *首先，我们设计了模块；其次，我们训练了模型；再次，我们评估了
  性能；最后，我们分析了结果。*
- After (ZH): *我们设计了自适应模块并在 XX 上训练。评估显示准确率提升 2.4 个
  百分点；误差分析见 4.3 节。*
- EN note: avoid a paragraph where every sentence is 18–22 words; mix short
  claims with longer supported ones.

### E. Templated paragraph structure (模板化段落)

Every paragraph has the identical "topic sentence + three supports + mini
summary" skeleton. Uniform structure across a whole section is a generation
artifact. Fix: organize paragraphs by the actual argument; let some be a single
strong claim with one citation, others a longer derivation. Do not impose one
shape.

- Before: each of six paragraphs opens with a thesis, lists exactly three points,
  and ends with "总之/in summary".
- After: vary — one paragraph states a result and its one caveat; another walks
  through a derivation; another contrasts two cited methods.

---

## Detection discipline (carried over)

- Judge by **clusters**, not single tells. One em dash, one curly quote, or one
  "however" is not a verdict. Stacked tells plus hollow generalities plus uniform
  cadence is the confession.
- **Do not flag** legitimate academic prose: formal register, precise hedging,
  section-appropriate passive, consistent terminology, dense citations, and
  domain vocabulary are signs of *good* academic writing, not AI.
- The AI tell is a **moving target**: "delve" is fading post-2025; em-dash rates
  dropped after GPT-5.1. Never convict on one fading feature.
- Real academic AI text is usually **local** — human-written manuscript with
  AI-inserted passages. Prefer locating and fixing specific spans over re-judging
  the whole document.
