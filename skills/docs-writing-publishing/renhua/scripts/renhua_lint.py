#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import locale
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True)
class PatternRule:
    category: str
    name: str
    regex: str
    message: str


PATTERNS: tuple[PatternRule, ...] = (
    PatternRule("binary_contrast", "不是...而是", r"不是.{0,40}?而是", "Binary contrast shell; state the claim directly."),
    PatternRule("binary_contrast", "并非...而是", r"并非.{0,40}?而是", "Binary contrast shell; state the claim directly."),
    PatternRule("binary_contrast", "不在于...在于", r"不在于.{0,40}?在于", "Binary contrast shell; name the concrete issue directly."),
    PatternRule("binary_contrast", "不只是", r"不只是", "Binary expansion shell; rewrite as the actual claim."),
    PatternRule("binary_contrast", "不仅", r"不仅", "Binary expansion shell; rewrite as the actual claim."),
    PatternRule("binary_contrast", "与其...不如", r"与其.{0,40}?不如", "Template contrast shell; rewrite from the concrete observation."),
    PatternRule("command_template", "别急着", r"别急着", "Tutorial-hook template; start from the concrete failure or observation."),
    PatternRule("command_template", "先别", r"先别", "Tutorial-hook template; start from the concrete failure or observation."),
    PatternRule("command_template", "别...先", r"别[^。！？\n]{0,16}?先", "Imperative template; avoid generic command openings."),
    PatternRule("command_template", "顺序别反了", r"顺序别反了", "Generic tutorial hook; state the consequence directly."),
    PatternRule("command_template", "别搞反了", r"别搞反了", "Generic tutorial hook; state the consequence directly."),
    PatternRule("command_template", "记住这句话", r"记住这句话", "Slogan-like instruction; remove it."),
    PatternRule("fake_insight", "真正", r"真正", "Fake insight marker; enter the claim or evidence directly."),
    PatternRule("fake_insight", "其实", r"其实", "Fake insight marker; remove it unless it carries a real contrast."),
    PatternRule("fake_insight", "本质上", r"本质上", "Fake insight marker; replace with specific mechanism or evidence."),
    PatternRule("fake_insight", "核心在于", r"核心在于", "Fake insight marker; state the concrete check or cause."),
    PatternRule("fake_insight", "关键在于", r"关键在于", "Fake insight marker; state the concrete check or cause."),
    PatternRule("fake_insight", "说白了", r"说白了", "Conversational shortcut that often hides evidence."),
    PatternRule("fake_insight", "归根结底", r"归根结底", "Abstract summary marker; name the concrete result."),
    PatternRule("fake_insight", "更重要的是", r"更重要的是", "Fake hierarchy marker; state the item directly."),
    PatternRule("fake_insight", "结果有点出乎意料", r"结果有点出乎意料", "Stock suspense phrase; show the result directly."),
    PatternRule("fake_insight", "这说明", r"这说明", "Lecture inference marker; attach the claim to evidence."),
    PatternRule("fake_insight", "这背后", r"这背后", "Vague hidden-mechanism marker; name the mechanism."),
    PatternRule("lecture_colon", "我的结论是：", r"我的结论是[:：]", "Lecture colon; use a plain sentence."),
    PatternRule("lecture_colon", "原因很简单：", r"原因很简单[:：]", "Lecture colon; split or state the reason directly."),
    PatternRule("lecture_colon", "重点是：", r"重点是[:：]", "Lecture colon; use a plain sentence."),
    PatternRule("lecture_colon", "分成三类：", r"分成三类[:：]", "Lecture colon; introduce a concrete inventory only when needed."),
    PatternRule("lecture_colon", "更重要的是：", r"更重要的是[:：]", "Lecture colon; state the item directly."),
    PatternRule("lecture_colon", "abstract setup colon", r"(结果|原因|重点|核心|关键|本质|真正|这说明|这背后)[^。！？\n]{0,18}?[:：]", "Colon-led lecture setup; consider a normal sentence."),
    PatternRule("vague_referent", "东西", r"东西", "Vague referent; replace with exact category."),
    PatternRule("vague_referent", "这件事", r"这件事", "Vague referent; name the concrete action or problem."),
    PatternRule("vague_referent", "这些", r"这些", "Vague referent; name the category if the reader needs it."),
    PatternRule("vague_referent", "一类", r"一类", "Vague category; use the exact category name."),
    PatternRule("vague_referent", "几个方向", r"几个方向", "Vague category; name the concrete output or workflow."),
    PatternRule("time_stance", "我会先", r"我会先", "Future stance may be wrong for completed work."),
    PatternRule("time_stance", "我会用", r"我会用", "Future stance may be wrong for selected or tested tools."),
    PatternRule("vague_comparative", "更适合", r"更适合", "Vague comparative; name the exact use."),
    PatternRule("vague_comparative", "更像", r"更像", "Vague comparative; name the exact comparison."),
    PatternRule("vague_comparative", "更自然", r"更自然", "Vague comparative; explain the concrete improvement."),
    PatternRule("vague_comparative", "更高级", r"更高级", "Vague comparative; avoid empty quality claims."),
    PatternRule("abstract_pressure", "差距会突然变得很难看", r"差距会突然变得很难看", "Abstract pressure; name the visible consequence."),
    PatternRule("abstract_pressure", "差距会被迅速拉开", r"差距会被迅速拉开", "Abstract pressure; name the visible consequence."),
    PatternRule("abstract_pressure", "会成为新的分水岭", r"会成为新的分水岭", "Abstract pressure; name the behavior change."),
    PatternRule("abstract_pressure", "更值得盯的是个人", r"更值得盯的是个人", "Empty focus shift; name the concrete thing to inspect."),
    PatternRule("abstract_pressure", "更值得关注的是", r"更值得关注的是", "Empty focus shift; name the concrete thing to inspect."),
    PatternRule("slogan_ending", "正确但无聊的模型作文", r"正确但无聊的模型作文", "Slogan ending; describe the concrete loss."),
    PatternRule("slogan_ending", "上下文燃料", r"上下文燃料", "Broad metaphor; use concrete information."),
    PatternRule("slogan_ending", "能力飞轮", r"能力飞轮", "Broad metaphor; use concrete information."),
    PatternRule("slogan_ending", "时代分水岭", r"时代分水岭", "Broad metaphor; use concrete information."),
    PatternRule("slogan_ending", "作者痕迹", r"作者痕迹", "Broad metaphor; describe what the reader cannot see."),
    PatternRule("slogan_ending", "把判断盖住", r"把判断盖住", "Broad metaphor; name the specific loss."),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Report residual Renhua banned shells in Chinese AI/tech public-writing drafts.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--file", help="Draft file to inspect. If omitted, read stdin.")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    text, source, input_error = read_input(args.file)
    hits = list(scan_text(text))
    result = {
        "source": source,
        "ok": True,
        "input_error": input_error,
        "hit_count": len(hits),
        "hits_by_category": count_by_category(hits),
        "hits": hits,
    }

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        render_human(result)
    return 0


def read_input(raw_path: str | None) -> tuple[str, str, str | None]:
    if raw_path:
        path = Path(raw_path)
        try:
            return path.read_text(encoding="utf-8-sig"), str(path), None
        except OSError as exc:
            print(f"renhua_lint: could not read {path}: {exc}", file=sys.stderr)
            return "", str(path), str(exc)
        except UnicodeDecodeError as exc:
            print(f"renhua_lint: {path} must be UTF-8 text: {exc}", file=sys.stderr)
            return "", str(path), str(exc)
    raw = sys.stdin.buffer.read()
    return decode_stdin(raw), "stdin", None


def decode_stdin(raw: bytes) -> str:
    try:
        return raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        encoding = sys.stdin.encoding or locale.getpreferredencoding(False)
        return raw.decode(encoding, errors="replace")


def scan_text(text: str) -> Iterable[dict[str, object]]:
    for line_number, line in enumerate(text.splitlines(), start=1):
        for rule in PATTERNS:
            for match in re.finditer(rule.regex, line):
                yield {
                    "line": line_number,
                    "column": match.start() + 1,
                    "category": rule.category,
                    "pattern": rule.name,
                    "match": match.group(0),
                    "excerpt": excerpt(line, match.start(), match.end()),
                    "message": rule.message,
                }


def excerpt(line: str, start: int, end: int, radius: int = 28) -> str:
    left = max(0, start - radius)
    right = min(len(line), end + radius)
    prefix = "..." if left > 0 else ""
    suffix = "..." if right < len(line) else ""
    return prefix + line[left:right].strip() + suffix


def count_by_category(hits: list[dict[str, object]]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for hit in hits:
        category = str(hit["category"])
        counts[category] = counts.get(category, 0) + 1
    return dict(sorted(counts.items()))


def render_human(result: dict[str, object]) -> None:
    print(f"Source: {result['source']}")
    if result["input_error"]:
        print(f"Input warning: {result['input_error']}")
    print(f"Residual pattern hits: {result['hit_count']}")
    hits = result["hits"]
    if not hits:
        print("No Renhua banned shells found.")
        return
    for hit in hits:  # type: ignore[assignment]
        print(
            f"- L{hit['line']}: {hit['category']} / {hit['pattern']} "
            f"-> {hit['match']} | {hit['message']}"
        )
        print(f"  {hit['excerpt']}")


if __name__ == "__main__":
    raise SystemExit(main())
