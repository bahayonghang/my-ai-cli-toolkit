#!/usr/bin/env python3
"""
PR Analyzer - 分析 Pull Request 变更并生成审查摘要

功能：
- 统计变更文件类型和数量
- 识别高风险变更（核心模块、测试文件等）
- 生成审查优先级建议
"""

import json
import re
import sys
from pathlib import Path
from typing import Any


def analyze_file_path(filepath: str) -> dict[str, Any]:
    """分析文件路径，返回文件类型和重要性信息。"""
    path = Path(filepath)
    result = {
        "path": filepath,
        "filename": path.name,
        "extension": path.suffix.lower(),
        "type": "unknown",
        "risk_level": "low",
        "category": "other"
    }
    
    # 根据扩展名识别语言
    ext_map = {
        ".py": "python",
        ".js": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".jsx": "javascript",
        ".vue": "vue",
        ".rs": "rust",
        ".go": "go",
        ".java": "java",
        ".c": "c",
        ".cpp": "cpp",
        ".h": "c",
        ".hpp": "cpp",
        ".css": "css",
        ".scss": "css",
        ".less": "css",
        ".html": "html",
        ".json": "json",
        ".yml": "yaml",
        ".yaml": "yaml",
        ".md": "markdown",
        ".toml": "config",
        ".ini": "config"
    }
    
    result["type"] = ext_map.get(result["extension"], "unknown")
    
    # 识别文件类别
    if "test" in filepath.lower() or "spec" in filepath.lower():
        result["category"] = "test"
    elif "config" in filepath.lower() or filepath.endswith((".json", ".yml", ".yaml", ".toml")):
        result["category"] = "config"
    elif "doc" in filepath.lower() or filepath.endswith(".md"):
        result["category"] = "documentation"
    elif result["type"] in ["python", "javascript", "typescript", "rust", "go", "java"]:
        result["category"] = "source"
    
    # 评估风险等级
    risk_indicators = {
        "high": [
            r"core", r"main", r"index", r"app", r"server",
            r"database", r"db", r"model", r"auth", r"security",
            r"api", r"route", r"middleware"
        ],
        "medium": [
            r"service", r"util", r"helper", r"component",
            r"controller", r"handler"
        ]
    }
    
    path_lower = filepath.lower()
    for level, patterns in risk_indicators.items():
        if any(re.search(p, path_lower) for p in patterns):
            result["risk_level"] = level
            break
    
    return result


def analyze_diff(diff_content: str) -> dict[str, Any]:
    """分析 diff 内容，提取统计信息。"""
    lines = diff_content.split('\n')
    
    stats = {
        "files_changed": 0,
        "additions": 0,
        "deletions": 0,
        "files": []
    }
    
    current_file = None
    
    for line in lines:
        # 识别文件变更
        if line.startswith('diff --git'):
            if current_file:
                stats["files"].append(current_file)
            current_file = {
                "path": "",
                "additions": 0,
                "deletions": 0,
                "is_new": False,
                "is_deleted": False
            }
            stats["files_changed"] += 1
            
        elif line.startswith('--- a/'):
            if current_file:
                current_file["old_path"] = line[6:]
                
        elif line.startswith('+++ b/'):
            if current_file:
                current_file["path"] = line[6:]
                current_file["is_new"] = line[6:] == "/dev/null"
                
        elif line.startswith('--- /dev/null'):
            if current_file:
                current_file["is_new"] = True
                
        elif line.startswith('+++ /dev/null'):
            if current_file:
                current_file["is_deleted"] = True
                
        elif line.startswith('+') and not line.startswith('+++'):
            if current_file:
                current_file["additions"] += 1
            stats["additions"] += 1
            
        elif line.startswith('-') and not line.startswith('---'):
            if current_file:
                current_file["deletions"] += 1
            stats["deletions"] += 1
    
    if current_file:
        stats["files"].append(current_file)
    
    return stats


def generate_summary(stats: dict[str, Any]) -> dict[str, Any]:
    """生成审查摘要和建议。"""
    summary = {
        "overview": {
            "files_changed": stats["files_changed"],
            "additions": stats["additions"],
            "deletions": stats["deletions"],
            "net_change": stats["additions"] - stats["deletions"]
        },
        "risk_assessment": {
            "level": "low",
            "factors": []
        },
        "recommendations": [],
        "file_breakdown": []
    }
    
    # 分析每个文件
    for file_info in stats["files"]:
        file_analysis = analyze_file_path(file_info["path"])
        file_analysis.update({
            "additions": file_info["additions"],
            "deletions": file_info["deletions"],
            "is_new": file_info["is_new"],
            "is_deleted": file_info["is_deleted"]
        })
        summary["file_breakdown"].append(file_analysis)
    
    # 风险评估
    high_risk_files = [f for f in summary["file_breakdown"] if f["risk_level"] == "high"]
    test_files = [f for f in summary["file_breakdown"] if f["category"] == "test"]
    source_files = [f for f in summary["file_breakdown"] if f["category"] == "source"]
    
    if len(stats["files"]) > 20:
        summary["risk_assessment"]["factors"].append("大量文件变更 (>20)")
    
    if stats["additions"] + stats["deletions"] > 500:
        summary["risk_assessment"]["factors"].append("大量代码变更 (>500 行)")
    
    if high_risk_files:
        summary["risk_assessment"]["factors"].append(
            f"涉及 {len(high_risk_files)} 个高风险文件"
        )
    
    if not test_files and source_files:
        summary["risk_assessment"]["factors"].append("缺少测试文件变更")
    
    # 确定总体风险等级
    if len(summary["risk_assessment"]["factors"]) >= 2:
        summary["risk_assessment"]["level"] = "high"
    elif len(summary["risk_assessment"]["factors"]) == 1:
        summary["risk_assessment"]["level"] = "medium"
    
    # 生成建议
    if summary["risk_assessment"]["level"] == "high":
        summary["recommendations"].append(
            "⚠️ 高风险变更：建议分阶段审查，优先关注核心模块"
        )
    
    if not test_files and source_files:
        summary["recommendations"].append(
            "📝 建议：为代码变更添加相应的测试"
        )
    
    if len(stats["files"]) > 10:
        summary["recommendations"].append(
            f"📊 文件较多 ({len(stats['files'])} 个)：建议按模块分组审查"
        )
    
    # 按语言统计
    lang_stats = {}
    for f in summary["file_breakdown"]:
        lang = f["type"]
        if lang not in lang_stats:
            lang_stats[lang] = {"count": 0, "additions": 0, "deletions": 0}
        lang_stats[lang]["count"] += 1
        lang_stats[lang]["additions"] += f["additions"]
        lang_stats[lang]["deletions"] += f["deletions"]
    
    summary["language_stats"] = lang_stats
    
    return summary


def main():
    """主函数：从 stdin 读取 diff 并输出分析结果。"""
    if len(sys.argv) > 1 and sys.argv[1] in ("-h", "--help"):
        print("""PR Analyzer - 分析 PR 变更

用法:
  git diff | python pr-analyzer.py
  python pr-analyzer.py < diff.txt

输出:
  JSON 格式的分析报告，包含文件统计、风险评估和建议
""")
        sys.exit(0)
    
    # 从 stdin 读取 diff
    diff_content = sys.stdin.read()
    
    if not diff_content.strip():
        print(json.dumps({
            "error": "No diff content provided"
        }, indent=2, ensure_ascii=False))
        sys.exit(1)
    
    # 分析 diff
    stats = analyze_diff(diff_content)
    summary = generate_summary(stats)
    
    # 输出 JSON
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
