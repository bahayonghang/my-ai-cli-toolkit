#!/usr/bin/env python3
"""
Issue Aggregator - 聚合和分类代码审查中发现的问题

功能：
- 解析审查输出中的问题
- 按严重程度和类型分类
- 去重和统计
- 生成结构化报告
"""

import json
import re
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any


@dataclass
class Issue:
    """表示一个代码审查问题。"""
    severity: str  # critical, high, medium, low, info
    category: str  # correctness, security, performance, readability, testing, architecture
    message: str
    file_path: str = ""
    line_number: int = 0
    rule_id: str = ""
    suggestion: str = ""
    
    def to_dict(self) -> dict[str, Any]:
        return {
            "severity": self.severity,
            "category": self.category,
            "message": self.message,
            "file_path": self.file_path,
            "line_number": self.line_number,
            "rule_id": self.rule_id,
            "suggestion": self.suggestion
        }


class IssueAggregator:
    """聚合和分类代码审查问题。"""
    
    SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"]
    
    CATEGORY_DESCRIPTIONS = {
        "correctness": "正确性问题 - 可能导致错误行为或崩溃",
        "security": "安全问题 - 潜在的安全漏洞",
        "performance": "性能问题 - 可能影响运行效率",
        "readability": "可读性问题 - 代码清晰度和维护性",
        "testing": "测试问题 - 测试覆盖率和质量",
        "architecture": "架构问题 - 设计模式和结构"
    }
    
    def __init__(self):
        self.issues: list[Issue] = []
        self._dedup_cache: set[str] = set()
    
    def add_issue(self, issue: Issue) -> bool:
        """添加问题，如果重复则返回 False。"""
        # 生成去重键
        dup_key = f"{issue.file_path}:{issue.line_number}:{issue.message[:50]}"
        
        if dup_key in self._dedup_cache:
            return False
        
        self._dedup_cache.add(dup_key)
        self.issues.append(issue)
        return True
    
    def parse_from_text(self, text: str, source_format: str = "auto") -> None:
        """从文本解析问题。"""
        if source_format == "auto":
            # 尝试检测格式
            if "##" in text and ("❌" in text or "✅" in text):
                self._parse_markdown_format(text)
            else:
                self._parse_plain_text(text)
        elif source_format == "markdown":
            self._parse_markdown_format(text)
        else:
            self._parse_plain_text(text)
    
    def _parse_markdown_format(self, text: str) -> None:
        """解析 Markdown 格式的审查输出。"""
        # 匹配问题模式：❌ 或 ⚠️ 开头的行
        issue_pattern = r'[❌⚠️🔴🟠🟡](.+?)(?=\n[❌✅⚠️🔴🟠🟡]|\n##|\Z)'
        
        for match in re.finditer(issue_pattern, text, re.DOTALL):
            content = match.group(1).strip()
            
            # 检测严重程度
            severity = "medium"
            if "❌" in match.group(0) or "🔴" in match.group(0):
                severity = "high"
            elif "⚠️" in match.group(0) or "🟠" in match.group(0):
                severity = "medium"
            elif "🟡" in match.group(0):
                severity = "low"
            
            # 检测类别
            category = self._detect_category(content)
            
            # 提取文件路径和行号
            file_path, line_number = self._extract_location(content)
            
            issue = Issue(
                severity=severity,
                category=category,
                message=content[:200],  # 限制长度
                file_path=file_path,
                line_number=line_number
            )
            self.add_issue(issue)
    
    def _parse_plain_text(self, text: str) -> None:
        """解析纯文本格式的问题。"""
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # 检测关键词
            severity = self._detect_severity_from_keywords(line)
            category = self._detect_category(line)
            
            # 如果看起来像一个有效的问题描述
            if len(line) > 20 and any(kw in line.lower() for kw in [
                "error", "warning", "issue", "problem", "should", "recommend",
                "错误", "警告", "问题", "建议"
            ]):
                file_path, line_number = self._extract_location(line)
                
                issue = Issue(
                    severity=severity,
                    category=category,
                    message=line,
                    file_path=file_path,
                    line_number=line_number
                )
                self.add_issue(issue)
    
    def _detect_category(self, text: str) -> str:
        """从文本内容检测问题类别。"""
        text_lower = text.lower()
        
        category_keywords = {
            "security": ["security", "vulnerability", "injection", "xss", "csrf", 
                        "auth", "password", "encrypt", "sanitize", "安全", "漏洞"],
            "performance": ["performance", "slow", "memory leak", "inefficient",
                           "optimize", "cache", "性能", "优化", "内存泄漏"],
            "correctness": ["bug", "error", "exception", "null", "undefined",
                           "race condition", "死锁", "竞态", "空指针"],
            "readability": ["naming", "comment", "format", "style", "readable",
                           "命名", "注释", "格式", "可读性"],
            "testing": ["test", "coverage", "mock", "assert", "测试", "覆盖率"],
            "architecture": ["architecture", "design", "pattern", "coupling",
                            "架构", "设计模式", "耦合"]
        }
        
        for category, keywords in category_keywords.items():
            if any(kw in text_lower for kw in keywords):
                return category
        
        return "correctness"  # 默认类别
    
    def _detect_severity_from_keywords(self, text: str) -> str:
        """从关键词检测严重程度。"""
        text_lower = text.lower()
        
        critical_keywords = ["critical", "crash", "security vulnerability", 
                            "data loss", "严重", "崩溃", "安全漏洞"]
        high_keywords = ["error", "bug", "exception", "memory leak", "race",
                        "错误", "缺陷", "内存泄漏", "竞态"]
        low_keywords = ["nit", "minor", "style", "format", "建议", "格式"]
        
        if any(kw in text_lower for kw in critical_keywords):
            return "critical"
        elif any(kw in text_lower for kw in high_keywords):
            return "high"
        elif any(kw in text_lower for kw in low_keywords):
            return "low"
        
        return "medium"
    
    def _extract_location(self, text: str) -> tuple[str, int]:
        """从文本中提取文件路径和行号。"""
        # 匹配文件路径模式
        file_patterns = [
            r'([\w/\\.-]+\.(py|js|ts|tsx|jsx|vue|rs|go|java|c|cpp|h|hpp|css|scss))[:\s]+(\d+)',
            r'文件[:\s]+([\w/\\.-]+)[:\s]+(?:行[:\s]+)?(\d+)',
        ]
        
        for pattern in file_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                file_path = match.group(1)
                line_number = int(match.group(2)) if match.group(2).isdigit() else 0
                return file_path, line_number
        
        return "", 0
    
    def get_summary(self) -> dict[str, Any]:
        """生成问题汇总报告。"""
        # 按严重程度统计
        severity_counts = defaultdict(int)
        category_counts = defaultdict(int)
        
        for issue in self.issues:
            severity_counts[issue.severity] += 1
            category_counts[issue.category] += 1
        
        # 排序后的统计
        severity_stats = {
            sev: severity_counts[sev] 
            for sev in self.SEVERITY_ORDER 
            if severity_counts[sev] > 0
        }
        
        # 按类别分组的问题
        issues_by_category = defaultdict(list)
        for issue in self.issues:
            issues_by_category[issue.category].append(issue.to_dict())
        
        # 生成建议
        recommendations = []
        
        if severity_counts["critical"] > 0:
            recommendations.append(
                f"🔴 发现 {severity_counts['critical']} 个严重问题，需要立即修复"
            )
        
        if severity_counts["high"] > 3:
            recommendations.append(
                f"⚠️ 发现 {severity_counts['high']} 个高优先级问题，建议优先处理"
            )
        
        if category_counts["testing"] == 0 and len(self.issues) > 5:
            recommendations.append(
                "📝 未检测到测试相关问题，建议检查测试覆盖率"
            )
        
        if category_counts["security"] > 0:
            recommendations.append(
                f"🔒 发现 {category_counts['security']} 个安全问题，建议安全审查"
            )
        
        return {
            "total_issues": len(self.issues),
            "severity_distribution": severity_stats,
            "category_distribution": dict(category_counts),
            "issues_by_category": dict(issues_by_category),
            "recommendations": recommendations,
            "top_issues": [
                issue.to_dict() 
                for issue in sorted(
                    self.issues,
                    key=lambda x: (self.SEVERITY_ORDER.index(x.severity), x.category)
                )[:10]  # 前 10 个问题
            ]
        }
    
    def generate_markdown_report(self) -> str:
        """生成 Markdown 格式的报告。"""
        summary = self.get_summary()
        
        lines = [
            "# 代码审查问题报告",
            "",
            "## 概览",
            "",
            f"- **总问题数**: {summary['total_issues']}",
            "- **严重程度分布**:",
        ]
        
        for sev, count in summary['severity_distribution'].items():
            emoji = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢", "info": "🔵"}.get(sev, "⚪")
            lines.append(f"  - {emoji} {sev}: {count}")
        
        lines.extend(["", "## 按类别分布", ""])
        
        for cat, count in summary['category_distribution'].items():
            desc = self.CATEGORY_DESCRIPTIONS.get(cat, cat)
            lines.append(f"- **{cat}** ({count}): {desc}")
        
        if summary['recommendations']:
            lines.extend(["", "## 建议", ""])
            for rec in summary['recommendations']:
                lines.append(f"- {rec}")
        
        if summary['top_issues']:
            lines.extend(["", "## 优先处理的问题", ""])
            for i, issue in enumerate(summary['top_issues'][:5], 1):
                emoji = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢", "info": "🔵"}.get(issue['severity'], "⚪")
                lines.append(f"{i}. {emoji} [{issue['category']}] {issue['message'][:80]}...")
                if issue['file_path']:
                    lines.append(f"   - 位置: {issue['file_path']}{':' + str(issue['line_number']) if issue['line_number'] else ''}")
        
        return '\n'.join(lines)


def main():
    """主函数。"""
    if len(sys.argv) > 1 and sys.argv[1] in ("-h", "--help"):
        print("""Issue Aggregator - 聚合代码审查问题

用法:
  cat review_output.txt | python issue-aggregator.py
  python issue-aggregator.py < review_output.txt

输出:
  JSON 格式的问题汇总报告
""")
        sys.exit(0)
    
    # 从 stdin 读取审查输出
    content = sys.stdin.read()
    
    if not content.strip():
        print(json.dumps({
            "error": "No content provided"
        }, indent=2, ensure_ascii=False))
        sys.exit(1)
    
    # 聚合问题
    aggregator = IssueAggregator()
    aggregator.parse_from_text(content)
    
    # 输出 JSON 汇总
    summary = aggregator.get_summary()
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
