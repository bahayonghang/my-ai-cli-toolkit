#!/usr/bin/env python3
"""
review_metrics.py - Compute quality scores for academic slide files

Analyzes Typst (.typ) and LaTeX (.tex) slide files across 5 dimensions:
- Content Density (10 pts)
- Structure Completeness (10 pts)
- Visual Balance (10 pts)
- Animation Usage (10 pts)
- Compilation (10 pts)

Outputs JSON to stdout.
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path


class SlideAnalyzer:
    """Analyzes academic slide files and computes quality metrics."""

    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.content = file_path.read_text(encoding="utf-8")
        self.engine = self._detect_engine()
        self.slides = []
        self.issues = []

    def _detect_engine(self) -> str:
        """Detect slide engine from file extension."""
        suffix = self.file_path.suffix.lower()
        if suffix == ".typ":
            return "typst"
        elif suffix in [".tex", ".latex"]:
            return "latex"
        else:
            raise ValueError(f"Unsupported file type: {suffix}")

    def parse_slides(self):
        """Parse slides based on engine type."""
        if self.engine == "typst":
            self._parse_typst_slides()
        else:
            self._parse_latex_slides()

    def _parse_typst_slides(self):
        """Parse Typst slides."""
        lines = self.content.split("\n")
        i = 0
        slide_num = 0

        while i < len(lines):
            line = lines[i]

            # Check for title-slide
            if re.search(r"#title-slide\s*\(", line):
                slide_num += 1
                self.slides.append(
                    {"number": slide_num, "title": "Title Slide", "content": line, "start_line": i + 1, "type": "title"}
                )
                i += 1
                continue

            # Check for level 2 heading (== Title) - Touying slides
            heading_match = re.match(r"^==\s+(.+?)(?:\s+<.*?>)?\s*$", line)
            if heading_match:
                slide_num += 1
                slide_start = i
                title = heading_match.group(1).strip()

                # Collect content until next heading or slide
                slide_content = [line]
                i += 1
                while i < len(lines):
                    next_line = lines[i]
                    # Stop at next heading or explicit slide
                    if re.match(r"^==?\s+", next_line) or re.search(r"#(?:title-)?slide\s*[\(\[]", next_line):
                        break
                    slide_content.append(next_line)
                    i += 1

                content_text = "\n".join(slide_content)
                self.slides.append(
                    {
                        "number": slide_num,
                        "title": title,
                        "content": content_text,
                        "start_line": slide_start + 1,
                        "type": self._classify_typst_slide(content_text, title),
                    }
                )
                continue

            # Check for explicit #slide[...] or #slide(params)[...]
            if re.search(r"#slide\s*(?:\([^)]*\))?\s*\[", line):
                slide_num += 1
                slide_start = i
                bracket_count = line.count("[") - line.count("]")
                slide_content = [line]
                i += 1

                # Find matching closing bracket
                while i < len(lines) and bracket_count > 0:
                    line = lines[i]
                    slide_content.append(line)
                    bracket_count += line.count("[") - line.count("]")
                    i += 1

                content_text = "\n".join(slide_content)

                # Extract title from first heading in content
                title_match = re.search(r"(?:^|\n)===?\s+(.+?)(?:\s+<.*?>)?\s*(?:\n|$)", content_text)
                title = title_match.group(1).strip() if title_match else f"Slide {slide_num}"

                self.slides.append(
                    {
                        "number": slide_num,
                        "title": title,
                        "content": content_text,
                        "start_line": slide_start + 1,
                        "type": self._classify_typst_slide(content_text, title),
                    }
                )
                continue

            i += 1

    def _parse_latex_slides(self):
        """Parse LaTeX slides."""
        # Match \begin{frame}...\end{frame} blocks
        frame_pattern = r"\\begin\{frame\}(.*?)\\end\{frame\}"

        for match in re.finditer(frame_pattern, self.content, re.DOTALL):
            content_text = match.group(0)
            start_pos = match.start()
            line_num = self.content[:start_pos].count("\n") + 1

            # Extract title
            title_match = re.search(r"\\frametitle\{([^}]+)\}", content_text)
            if not title_match:
                title_match = re.search(r"\\begin\{frame\}\{([^}]+)\}", content_text)

            title = title_match.group(1).strip() if title_match else f"Slide {len(self.slides) + 1}"

            self.slides.append(
                {
                    "number": len(self.slides) + 1,
                    "title": title,
                    "content": content_text,
                    "start_line": line_num,
                    "type": self._classify_latex_slide(content_text),
                }
            )

    def _classify_typst_slide(self, content: str, title: str = "") -> str:
        """Classify Typst slide type."""
        if re.search(r"#title-slide", content):
            return "title"
        elif re.search(r"#outline|目录|outline", content) or re.search(r"(?i)outline|目录", title):
            return "outline"
        # Check for Q&A/Thank you slides
        qna_pattern = r"(?i)(thank|question|q\s*&\s*a|谢谢|提问)"
        if re.search(qna_pattern, content) or re.search(qna_pattern, title):
            return "qna"
        # Check for summary/conclusion slides
        conclusion_pattern = r"(?i)(summary|conclusion|总结|结论)"
        if re.search(conclusion_pattern, content) or re.search(conclusion_pattern, title):
            return "conclusion"
        else:
            return "content"

    def _classify_latex_slide(self, content: str) -> str:
        """Classify LaTeX slide type."""
        if re.search(r"\\titlepage|\\maketitle", content):
            return "title"
        elif re.search(r"\\tableofcontents", content):
            return "outline"
        elif re.search(r"(?i)(thank|question|q\s*&\s*a)", content):
            return "qna"
        elif re.search(r"(?i)(summary|conclusion)", content):
            return "conclusion"
        else:
            return "content"

    def _count_bullet_points(self, content: str) -> int:
        """Count bullet points in slide content."""
        if self.engine == "typst":
            # Count lines starting with - or +
            return len(re.findall(r"^\s*[-+]\s+", content, re.MULTILINE))
        else:
            # Count \item commands
            return len(re.findall(r"\\item\b", content))

    def _count_words(self, content: str) -> int:
        """Count words/characters in slide content."""
        # Remove code/markup
        if self.engine == "typst":
            text = re.sub(r"#[a-zA-Z_][\w-]*(?:\[.*?\])?(?:\{.*?\})?", "", content)
        else:
            text = re.sub(r"\\[a-zA-Z]+(?:\[.*?\])?(?:\{.*?\})?", "", content)

        # Check if Chinese content
        if re.search(r"[\u4e00-\u9fff]", text):
            # Count Chinese characters
            return len(re.findall(r"[\u4e00-\u9fff]", text))
        else:
            # Count English words
            return len(re.findall(r"\b\w+\b", text))

    def _has_math(self, content: str) -> bool:
        """Check if slide contains math formulas."""
        if self.engine == "typst":
            return bool(re.search(r"\$[^$]+\$", content))
        else:
            return bool(re.search(r"\$[^$]+\$|\\begin\{equation\}|\\begin\{align\}|\\begin\{math\}|\\\[", content))

    def _has_table(self, content: str) -> bool:
        """Check if slide contains tables."""
        if self.engine == "typst":
            return bool(re.search(r"#table\s*\(", content))
        else:
            return bool(re.search(r"\\begin\{table\}|\\begin\{tabular\}", content))

    def _has_figure(self, content: str) -> bool:
        """Check if slide contains figures."""
        if self.engine == "typst":
            return bool(re.search(r"#figure\s*\(|#image\s*\(", content))
        else:
            return bool(re.search(r"\\begin\{figure\}|\\includegraphics", content))

    def _count_animations(self, content: str) -> int:
        """Count animation commands in slide."""
        if self.engine == "typst":
            return len(re.findall(r"#pause|#uncover|#only", content))
        else:
            return len(re.findall(r"\\pause|\\only<|\\uncover<|\\visible<|\\invisible<", content))

    def score_content_density(self) -> dict:
        """Score content density (10 pts)."""
        score = 10
        details = []

        for slide in self.slides:
            if slide["type"] in ["title", "outline", "qna"]:
                continue

            bullet_count = self._count_bullet_points(slide["content"])
            word_count = self._count_words(slide["content"])

            # Check for too many bullet points
            if bullet_count > 6:
                score = max(0, score - 1)
                self.issues.append(
                    {
                        "severity": "error",
                        "slide": slide["title"],
                        "line": slide["start_line"],
                        "message": f"Too many bullet points ({bullet_count} > 6)",
                    }
                )

            # Check for too much text
            is_chinese = re.search(r"[\u4e00-\u9fff]", slide["content"])
            threshold = 120 if is_chinese else 80
            if word_count > threshold:
                score = max(0, score - 1)
                self.issues.append(
                    {
                        "severity": "warning",
                        "slide": slide["title"],
                        "line": slide["start_line"],
                        "message": f"Too much text ({word_count} > {threshold})",
                    }
                )

            # Check for empty slides
            if word_count < 10:
                score = max(0, score - 1)
                self.issues.append(
                    {
                        "severity": "warning",
                        "slide": slide["title"],
                        "line": slide["start_line"],
                        "message": f"Nearly empty slide ({word_count} words)",
                    }
                )

        details.append(f"Analyzed {len(self.slides)} slides")
        return {"score": score, "max": 10, "details": "; ".join(details) if details else "Good content density"}

    def score_structure_completeness(self) -> dict:
        """Score structure completeness (10 pts)."""
        score = 0
        details = []

        # Check for title page (2 pts)
        has_title = any(s["type"] == "title" for s in self.slides)
        if has_title:
            score += 2
            details.append("Has title page")
        else:
            self.issues.append({"severity": "error", "slide": "N/A", "line": 1, "message": "Missing title page"})

        # Check for outline (1 pt)
        has_outline = any(s["type"] == "outline" for s in self.slides)
        if has_outline:
            score += 1
            details.append("Has outline")

        # Check for introduction/background (2 pts)
        has_intro = any(re.search(r"(?i)(introduction|background|motivation)", s["title"]) for s in self.slides)
        if has_intro:
            score += 2
            details.append("Has introduction")

        # Check for core content sections (2 pts)
        content_slides = [s for s in self.slides if s["type"] == "content"]
        if len(content_slides) >= 2:
            score += 2
            details.append(f"Has {len(content_slides)} content slides")

        # Check for conclusion (2 pts)
        has_conclusion = any(s["type"] == "conclusion" for s in self.slides)
        if has_conclusion:
            score += 2
            details.append("Has conclusion")
        else:
            self.issues.append(
                {
                    "severity": "warning",
                    "slide": "N/A",
                    "line": len(self.content.split("\n")),
                    "message": "Missing conclusion/summary slide",
                }
            )

        # Check for Q&A page (1 pt)
        has_qna = any(s["type"] == "qna" for s in self.slides)
        if has_qna:
            score += 1
            details.append("Has Q&A page")

        return {"score": score, "max": 10, "details": "; ".join(details)}

    def score_visual_balance(self) -> dict:
        """Score visual balance (10 pts)."""
        score = 10
        details = []

        # Check for consecutive text-only slides
        consecutive_text = 0
        max_consecutive = 0
        has_any_visual = False

        for slide in self.slides:
            if slide["type"] in ["title", "outline", "qna"]:
                consecutive_text = 0
                continue

            has_visual = (
                self._has_math(slide["content"]) or self._has_table(slide["content"]) or self._has_figure(slide["content"])
            )

            if has_visual:
                has_any_visual = True
                consecutive_text = 0
            else:
                consecutive_text += 1
                max_consecutive = max(max_consecutive, consecutive_text)

                # Check for text-heavy slides
                bullet_count = self._count_bullet_points(slide["content"])
                if bullet_count > 5:
                    score = max(0, score - 1)
                    self.issues.append(
                        {
                            "severity": "warning",
                            "slide": slide["title"],
                            "line": slide["start_line"],
                            "message": f"Text-heavy slide with {bullet_count} bullet points",
                        }
                    )

        if max_consecutive > 3:
            score = max(0, score - 2)
            self.issues.append(
                {
                    "severity": "warning",
                    "slide": "N/A",
                    "line": 0,
                    "message": f"Too many consecutive text-only slides ({max_consecutive})",
                }
            )

        # Check if no visual elements at all
        if not has_any_visual:
            score = max(0, score - 1)
            self.issues.append(
                {"severity": "warning", "slide": "N/A", "line": 0, "message": "No tables, figures, or math formulas found"}
            )

        details.append(f"Max consecutive text slides: {max_consecutive}")
        return {"score": score, "max": 10, "details": "; ".join(details) if details else "Good visual balance"}

    def score_animation_usage(self) -> dict:
        """Score animation usage (10 pts)."""
        score = 10
        details = []

        total_animations = 0
        slides_with_animation = 0
        content_slides = [s for s in self.slides if s["type"] == "content"]

        for slide in content_slides:
            anim_count = self._count_animations(slide["content"])
            total_animations += anim_count

            if anim_count > 0:
                slides_with_animation += 1

            # Check for over-animation
            if anim_count > 3:
                score = max(0, score - 1)
                self.issues.append(
                    {
                        "severity": "warning",
                        "slide": slide["title"],
                        "line": slide["start_line"],
                        "message": f"Over-animated slide ({anim_count} animations)",
                    }
                )

        # Check if no animations at all
        if total_animations == 0:
            score = max(0, score - 2)
            self.issues.append({"severity": "info", "slide": "N/A", "line": 0, "message": "No animations found"})

        # Check animation coverage
        if len(content_slides) > 0:
            coverage = slides_with_animation / len(content_slides)
            if coverage < 0.3:
                score = max(0, score - 2)
                self.issues.append(
                    {
                        "severity": "info",
                        "slide": "N/A",
                        "line": 0,
                        "message": f"Low animation coverage ({coverage:.0%} < 30%)",
                    }
                )
            details.append(f"Animation coverage: {coverage:.0%}")

        details.append(f"Total animations: {total_animations}")
        return {"score": score, "max": 10, "details": "; ".join(details)}

    def score_compilation(self) -> dict:
        """Score compilation success (10 pts)."""
        # Check if compiler is available
        if self.engine == "typst":
            compiler = "typst"
        else:
            compiler = "latexmk"

        if not shutil.which(compiler):
            return {"score": 5, "max": 10, "details": f"{compiler} not available"}

        # Try to compile
        try:
            output_dir = self.file_path.parent / "output"
            output_dir.mkdir(exist_ok=True)

            if self.engine == "typst":
                result = subprocess.run(
                    ["typst", "compile", str(self.file_path), str(output_dir / f"{self.file_path.stem}.pdf")],
                    capture_output=True,
                    timeout=30,
                )
            else:
                result = subprocess.run(
                    [
                        "latexmk",
                        "-xelatex",
                        "-interaction=nonstopmode",
                        f"-output-directory={output_dir}",
                        str(self.file_path),
                    ],
                    capture_output=True,
                    timeout=60,
                )

            if result.returncode == 0:
                return {"score": 10, "max": 10, "details": "Compilation successful"}
            else:
                error_msg = result.stderr.decode("utf-8", errors="ignore")[:200]
                self.issues.append(
                    {"severity": "error", "slide": "N/A", "line": 0, "message": f"Compilation failed: {error_msg}"}
                )
                return {"score": 0, "max": 10, "details": "Compilation failed"}
        except subprocess.TimeoutExpired:
            self.issues.append({"severity": "error", "slide": "N/A", "line": 0, "message": "Compilation timeout"})
            return {"score": 0, "max": 10, "details": "Compilation timeout"}
        except Exception as e:
            return {"score": 0, "max": 10, "details": f"Compilation error: {str(e)}"}

    def analyze(self) -> dict:
        """Run full analysis and return results."""
        self.parse_slides()

        scores = {
            "content_density": self.score_content_density(),
            "structure_completeness": self.score_structure_completeness(),
            "visual_balance": self.score_visual_balance(),
            "animation_usage": self.score_animation_usage(),
            "compilation": self.score_compilation(),
        }

        total_score = sum(s["score"] for s in scores.values())
        max_score = sum(s["max"] for s in scores.values())

        # Calculate grade
        if total_score >= 46:
            grade = "A"
        elif total_score >= 36:
            grade = "B"
        elif total_score >= 26:
            grade = "C"
        else:
            grade = "D"

        return {
            "file": str(self.file_path),
            "engine": self.engine,
            "scores": scores,
            "total_score": total_score,
            "max_score": max_score,
            "grade": grade,
            "issues": self.issues,
        }


def main():
    parser = argparse.ArgumentParser(description="Compute quality scores for academic slide files")
    parser.add_argument("file", type=Path, help="Slide file to analyze (.typ or .tex)")

    args = parser.parse_args()

    if not args.file.exists():
        print(json.dumps({"error": f"File not found: {args.file}"}), file=sys.stderr)
        sys.exit(1)

    try:
        analyzer = SlideAnalyzer(args.file)
        result = analyzer.analyze()
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
