#!/usr/bin/env python3
"""
Rule Tester - 测试代码审查规则的有效性

功能：
- 验证规则是否能正确检测问题
- 测试规则的误报率
- 生成规则测试报告
"""

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable


@dataclass
class TestCase:
    """规则测试用例。"""
    name: str
    code: str
    should_detect: bool  # 是否应该被检测
    expected_message: str = ""  # 期望的检测消息（部分匹配）
    language: str = ""


@dataclass
class Rule:
    """代码审查规则。"""
    id: str
    name: str
    description: str
    severity: str
    category: str
    languages: list[str]
    pattern: str  # 正则表达式模式
    message_template: str


class RuleTester:
    """规则测试器。"""
    
    def __init__(self):
        self.rules: list[Rule] = []
        self.test_cases: list[TestCase] = []
        self.results: list[dict[str, Any]] = []
    
    def load_builtin_rules(self) -> None:
        """加载内置规则。"""
        self.rules = [
            # Python 规则
            Rule(
                id="PY001",
                name="Bare Except",
                description="不要使用裸 except 语句",
                severity="high",
                category="correctness",
                languages=["python"],
                pattern=r"except\s*:",
                message_template="不要使用裸 except 语句，请捕获具体异常"
            ),
            Rule(
                id="PY002",
                name="Mutable Default Argument",
                description="不要使用可变默认参数",
                severity="high",
                category="correctness",
                languages=["python"],
                pattern=r"def\s+\w+\s*\([^)]*=\s*(\[\s*\]|\{\s*\})",
                message_template="不要使用可变默认参数（list/dict），请使用 None"
            ),
            
            # JavaScript/TypeScript 规则
            Rule(
                id="JS001",
                name="Console Log",
                description="生产代码中不应有 console.log",
                severity="low",
                category="readability",
                languages=["javascript", "typescript"],
                pattern=r"console\.(log|debug|warn|error)\s*\(",
                message_template="生产代码中不应有 console.log，请使用日志库"
            ),
            Rule(
                id="JS002",
                name="Eval Usage",
                description="避免使用 eval",
                severity="critical",
                category="security",
                languages=["javascript", "typescript"],
                pattern=r"\beval\s*\(",
                message_template="避免使用 eval，存在安全风险"
            ),
            
            # React 规则
            Rule(
                id="REACT001",
                name="Missing Key Prop",
                description="列表渲染需要 key 属性",
                severity="high",
                category="correctness",
                languages=["javascript", "typescript"],
                pattern=r"\.map\s*\(\s*\([^)]*\)\s*=>\s*<[^>]+>(?!.*key=)",
                message_template="列表渲染元素需要 key 属性"
            ),
            
            # Go 规则
            Rule(
                id="GO001",
                name="Ignored Error",
                description="不要忽略错误返回值",
                severity="high",
                category="correctness",
                languages=["go"],
                pattern=r"_,\s*_\s*:=",
                message_template="不要忽略错误返回值，请处理错误"
            ),
            
            # Rust 规则
            Rule(
                id="RUST001",
                name="Unwrap Usage",
                description="谨慎使用 unwrap",
                severity="medium",
                category="correctness",
                languages=["rust"],
                pattern=r"\.unwrap\s*\(\s*\)",
                message_template="谨慎使用 unwrap，考虑使用 ? 或 match 处理错误"
            ),
            
            # Java 规则
            Rule(
                id="JAVA001",
                name="Raw Exception",
                description="不要抛出原始 Exception",
                severity="medium",
                category="correctness",
                languages=["java"],
                pattern=r"throw\s+new\s+Exception",
                message_template="不要抛出原始 Exception，请使用具体异常类型"
            ),
            
            # 通用规则
            Rule(
                id="GEN001",
                name="TODO Comment",
                description="代码中包含 TODO 注释",
                severity="info",
                category="readability",
                languages=["*"],
                pattern=r"TODO|FIXME|XXX|HACK",
                message_template="代码中包含 TODO/FIXME，请跟踪处理"
            ),
            Rule(
                id="GEN002",
                name="Hardcoded Secret",
                description="可能的硬编码密钥",
                severity="critical",
                category="security",
                languages=["*"],
                pattern=r"(password|secret|key|token)\s*=\s*[\"'][^\"']{8,}[\"']",
                message_template="可能的硬编码密钥，请使用配置或密钥管理服务"
            ),
        ]
    
    def add_test_case(self, test_case: TestCase) -> None:
        """添加测试用例。"""
        self.test_cases.append(test_case)
    
    def load_builtin_test_cases(self) -> None:
        """加载内置测试用例。"""
        self.test_cases = [
            # Python 测试用例
            TestCase(
                name="PY001 - 裸 except 应该被检测",
                code="try:\n    pass\nexcept:\n    pass",
                should_detect=True,
                expected_message="裸 except",
                language="python"
            ),
            TestCase(
                name="PY001 - 具体 except 不应被检测",
                code="try:\n    pass\nexcept ValueError:\n    pass",
                should_detect=False,
                language="python"
            ),
            TestCase(
                name="PY002 - 可变默认参数应该被检测",
                code="def func(items=[]):\n    pass",
                should_detect=True,
                expected_message="可变默认参数",
                language="python"
            ),
            
            # JavaScript 测试用例
            TestCase(
                name="JS001 - console.log 应该被检测",
                code="console.log('debug');",
                should_detect=True,
                expected_message="console.log",
                language="javascript"
            ),
            TestCase(
                name="JS002 - eval 应该被检测",
                code="eval('alert(1)');",
                should_detect=True,
                expected_message="eval",
                language="javascript"
            ),
            
            # Go 测试用例
            TestCase(
                name="GO001 - 忽略错误应该被检测",
                code="_, _ := someFunction()",
                should_detect=True,
                expected_message="忽略错误",
                language="go"
            ),
            
            # Rust 测试用例
            TestCase(
                name="RUST001 - unwrap 应该被检测",
                code="let x = result.unwrap();",
                should_detect=True,
                expected_message="unwrap",
                language="rust"
            ),
            
            # 通用测试用例
            TestCase(
                name="GEN001 - TODO 应该被检测",
                code="// TODO: fix this",
                should_detect=True,
                expected_message="TODO",
                language="*"
            ),
        ]
    
    def run_tests(self) -> dict[str, Any]:
        """运行所有测试。"""
        self.results = []
        
        for test_case in self.test_cases:
            result = self._run_single_test(test_case)
            self.results.append(result)
        
        return self._generate_summary()
    
    def _run_single_test(self, test_case: TestCase) -> dict[str, Any]:
        """运行单个测试用例。"""
        # 找到适用的规则
        applicable_rules = [
            r for r in self.rules 
            if test_case.language in r.languages or "*" in r.languages
        ]
        
        detections = []
        for rule in applicable_rules:
            if re.search(rule.pattern, test_case.code, re.IGNORECASE):
                detections.append({
                    "rule_id": rule.id,
                    "rule_name": rule.name,
                    "message": rule.message_template
                })
        
        detected = len(detections) > 0
        
        # 判断测试结果
        if test_case.should_detect:
            passed = detected
            status = "PASS" if passed else "FAIL"
            reason = "" if passed else "期望检测到问题但未检测到"
        else:
            passed = not detected
            status = "PASS" if passed else "FAIL"
            reason = "" if passed else "不应检测到问题但检测到了"
        
        return {
            "name": test_case.name,
            "language": test_case.language,
            "expected_detection": test_case.should_detect,
            "actual_detection": detected,
            "detections": detections,
            "passed": passed,
            "status": status,
            "reason": reason
        }
    
    def _generate_summary(self) -> dict[str, Any]:
        """生成测试摘要。"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r["passed"])
        failed = total - passed
        
        # 按语言统计
        by_language = {}
        for result in self.results:
            lang = result["language"]
            if lang not in by_language:
                by_language[lang] = {"total": 0, "passed": 0, "failed": 0}
            by_language[lang]["total"] += 1
            if result["passed"]:
                by_language[lang]["passed"] += 1
            else:
                by_language[lang]["failed"] += 1
        
        # 失败的测试
        failed_tests = [r for r in self.results if not r["passed"]]
        
        return {
            "total_tests": total,
            "passed": passed,
            "failed": failed,
            "pass_rate": f"{passed/total*100:.1f}%" if total > 0 else "N/A",
            "by_language": by_language,
            "failed_tests": failed_tests,
            "all_results": self.results
        }
    
    def test_rule_on_code(self, rule_id: str, code: str) -> dict[str, Any]:
        """在指定代码上测试特定规则。"""
        rule = next((r for r in self.rules if r.id == rule_id), None)
        if not rule:
            return {"error": f"Rule {rule_id} not found"}
        
        match = re.search(rule.pattern, code, re.IGNORECASE)
        
        return {
            "rule_id": rule.id,
            "rule_name": rule.name,
            "pattern": rule.pattern,
            "code_sample": code[:200],
            "matched": match is not None,
            "match_details": match.group(0) if match else None
        }


def main():
    """主函数。"""
    if len(sys.argv) > 1 and sys.argv[1] in ("-h", "--help"):
        print("""Rule Tester - 测试代码审查规则

用法:
  python rule-tester.py                    # 运行所有内置测试
  python rule-tester.py --list-rules       # 列出所有规则
  python rule-tester.py --test-rule RULE   # 测试特定规则

输出:
  JSON 格式的测试结果
""")
        sys.exit(0)
    
    tester = RuleTester()
    tester.load_builtin_rules()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--list-rules":
        # 列出所有规则
        rules_info = [
            {
                "id": r.id,
                "name": r.name,
                "severity": r.severity,
                "category": r.category,
                "languages": r.languages
            }
            for r in tester.rules
        ]
        print(json.dumps({"rules": rules_info}, indent=2, ensure_ascii=False))
        sys.exit(0)
    
    if len(sys.argv) > 2 and sys.argv[1] == "--test-rule":
        # 测试特定规则
        rule_id = sys.argv[2]
        code = sys.stdin.read()
        result = tester.test_rule_on_code(rule_id, code)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(0)
    
    # 运行所有测试
    tester.load_builtin_test_cases()
    summary = tester.run_tests()
    
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    
    # 输出简要报告
    print("\n" + "="*50, file=sys.stderr)
    print(f"测试结果: {summary['passed']}/{summary['total_tests']} 通过", file=sys.stderr)
    print(f"通过率: {summary['pass_rate']}", file=sys.stderr)
    
    if summary['failed'] > 0:
        print(f"\n失败的测试:", file=sys.stderr)
        for test in summary['failed_tests']:
            print(f"  - {test['name']}: {test['reason']}", file=sys.stderr)


if __name__ == "__main__":
    main()
