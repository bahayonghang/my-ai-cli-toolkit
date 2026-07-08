# Unknowns First Prompt Template

Use this prompt when invoking the workflow manually.

```markdown
Before executing the task, please run an Unknowns First diagnosis.

My task/background:

[Describe what I want to do, why it matters, who it affects, and any source material or constraints.]

Please do not start execution yet. First help me clarify:

1. Restate your understanding of my task.
2. Judge my starting point:
   - What have I already made explicit?
   - What do I seem to know implicitly?
   - What might I be assuming or misunderstanding?
   - What am I probably not yet able to judge?
3. Identify four kinds of unknowns:
   - known knowns
   - known unknowns
   - unknown knowns
   - unknown unknowns
4. Judge the current task level.
5. Identify the true expert for this task level.
6. Establish the current success standards from that expert's perspective.
7. Decide whether we need reference materials, examples, prototypes, or HTML interaction before execution.
8. Identify only the key unknowns that may change the result, cause rework, or affect my ability to judge quality.
9. Ask 3-5 focused clarification questions. If there are more, group them as later follow-ups.
10. Stop and wait for my confirmation before executing.

Important rules:

- Treat expert standards as high-quality hypotheses, not final truth.
- Do not ask every possible question. Ask only questions that affect the task level, expert, success standard, deliverable, execution path, or rework risk.
- For simple editing, translation, formatting, or summarization tasks, use lite mode or execute directly if the constraints are already clear.
- If my implicit standard is hard to describe, help me surface it through options, examples, prototypes, or comparisons.
- During execution, record implementation notes if new facts or constraints change the original plan.
- After execution, help me test whether I understand the result well enough to judge it.
```

## Chinese Version

```markdown
在正式执行任务之前，请先运行一次 Unknowns First 诊断。

我的任务 / 背景：

[描述我要做什么、为什么重要、影响谁、已有资料和限制条件。]

请先不要开始执行。请先帮我澄清：

1. 复述你对这个任务的理解。
2. 判断我的起点：
   - 我已经显性说清楚了什么？
   - 我可能隐性知道但没有说出来什么？
   - 我可能有哪些假设或误解？
   - 我目前可能还无法判断什么？
3. 识别四类未知：
   - 我知道自己知道
   - 我知道自己不知道
   - 我不知道自己知道
   - 我不知道自己不知道
4. 判断当前任务层级。
5. 识别这个层级真正的行家是谁。
6. 从这个行家的视角建立当前成功标准。
7. 判断在执行前是否需要参考资料、示例、原型或 HTML 互动。
8. 只识别会改变结果、造成返工、影响判断质量的关键未知。
9. 提出 3-5 个聚焦的澄清问题。如果还有更多问题，请先归为后续追问，不要一次性阻塞。
10. 停下来，等待我确认后再执行。

重要规则：

- 把行家的判断标准当成高质量假设，而不是最终真理。
- 不要问所有可能的问题，只问会影响任务层级、行家选择、成功标准、交付物、执行路径或返工风险的问题。
- 对简单润色、翻译、格式整理、摘要任务，使用轻量模式；如果约束已经清楚，可以直接执行。
- 如果我的隐性标准很难用语言描述，请通过选项、示例、原型或对比帮助我看出来。
- 执行过程中如果出现新事实或新限制，请记录 implementation notes。
- 执行后，请帮我测试我是否真正理解这个结果，并具备判断它的能力。
```
