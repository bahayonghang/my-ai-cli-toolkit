"""
单元测试：错误消息模板
测试 ERROR_MESSAGES 和 format_error() 函数
"""
import sys
from pathlib import Path

import pytest

# 添加父目录到 sys.path 以便导入 install 模块
sys.path.insert(0, str(Path(__file__).parent.parent))

from install import ERROR_MESSAGES, format_error


class TestErrorMessages:
    """测试 ERROR_MESSAGES 字典"""

    def test_all_error_keys_exist(self):
        """测试所有预期的错误键都存在"""
        expected_keys = {
            "path_not_exist",
            "path_not_dir",
            "permission_denied",
            "kiro_requires_project",
            "skill_not_found",
            "invalid_target",
            "path_access_error",
            "source_dir_not_found",
            "prompt_update_not_supported",
            "prompt_file_not_found",
        }

        assert set(ERROR_MESSAGES.keys()) == expected_keys

    def test_all_messages_are_strings(self):
        """测试所有错误消息都是字符串"""
        for key, message in ERROR_MESSAGES.items():
            assert isinstance(message, str), f"{key} should be a string"

    def test_all_messages_non_empty(self):
        """测试所有错误消息都非空"""
        for key, message in ERROR_MESSAGES.items():
            assert len(message.strip()) > 0, f"{key} should not be empty"

    def test_messages_contain_suggestions(self):
        """测试关键错误消息包含建议"""
        messages_with_suggestions = [
            "path_not_exist",
            "path_not_dir",
            "permission_denied",
            "path_access_error",
        ]

        for key in messages_with_suggestions:
            message = ERROR_MESSAGES[key]
            assert "Suggestion" in message or "suggestion" in message.lower(), \
                f"{key} should contain a suggestion"


class TestFormatError:
    """测试 format_error() 函数"""

    def test_format_path_not_exist(self):
        """测试格式化 path_not_exist 错误"""
        result = format_error("path_not_exist", path="./nonexistent")

        assert "does not exist" in result
        assert "./nonexistent" in result
        assert "Suggestion" in result

    def test_format_path_not_dir(self):
        """测试格式化 path_not_dir 错误"""
        result = format_error("path_not_dir", path="/some/file.txt")

        assert "not a directory" in result
        assert "/some/file.txt" in result
        assert "Suggestion" in result

    def test_format_permission_denied(self):
        """测试格式化 permission_denied 错误"""
        result = format_error("permission_denied", path="/readonly/path")

        assert "Permission denied" in result
        assert "/readonly/path" in result
        assert "Suggestion" in result

    def test_format_kiro_requires_project(self):
        """测试格式化 kiro_requires_project 错误"""
        result = format_error("kiro_requires_project")

        assert "--kiro" in result
        assert "--project" in result
        assert "Usage" in result

    def test_format_skill_not_found(self):
        """测试格式化 skill_not_found 错误"""
        result = format_error(
            "skill_not_found",
            skill="unknown-skill",
            available="skill1, skill2, skill3"
        )

        assert "not found" in result
        assert "unknown-skill" in result
        assert "skill1, skill2, skill3" in result

    def test_format_invalid_target(self):
        """测试格式化 invalid_target 错误"""
        result = format_error(
            "invalid_target",
            target="invalid",
            available="claude, codex, gemini, qwen"
        )

        assert "Invalid target" in result
        assert "invalid" in result
        assert "claude" in result
        assert "codex" in result

    def test_format_path_access_error(self):
        """测试格式化 path_access_error 错误"""
        result = format_error(
            "path_access_error",
            path="/some/path",
            error="Some error message"
        )

        assert "Cannot access" in result
        assert "/some/path" in result
        assert "Some error message" in result
        assert "Suggestion" in result

    def test_format_unknown_error_key(self):
        """测试格式化未知错误键"""
        result = format_error("unknown_error_key")

        assert "Unknown error" in result
        assert "unknown_error_key" in result

    def test_format_missing_parameter(self):
        """测试缺少必需参数时的行为"""
        result = format_error("path_not_exist")  # 缺少 path 参数

        assert "Error formatting message" in result or "path" in result.lower()

    def test_format_extra_parameters_ignored(self):
        """测试额外参数被忽略"""
        result = format_error(
            "path_not_exist",
            path="./test",
            extra_param="ignored"
        )

        # 应该正常格式化，忽略额外参数
        assert "does not exist" in result
        assert "./test" in result


class TestErrorMessageIntegration:
    """测试错误消息与实际函数的集成"""

    def test_validate_project_path_uses_format_error(self):
        """测试 validate_project_path 使用 format_error"""
        from install import validate_project_path

        valid, error = validate_project_path("./nonexistent_path_12345")

        # 应该包含格式化后的错误消息
        assert error is not None
        assert "does not exist" in error
        assert "Suggestion" in error

    def test_kiro_validation_uses_format_error(self):
        """测试 SkillManager kiro validation 使用 format_error"""
        from install import SkillManager

        with pytest.raises(ValueError) as exc_info:
            SkillManager("claude", use_kiro=True)

        error_message = str(exc_info.value).lower()
        # 检查错误消息包含关键信息
        assert "kiro" in error_message
        assert "project" in error_message


class TestErrorMessageConsistency:
    """测试错误消息的一致性"""

    def test_all_path_errors_mention_path(self):
        """测试所有路径相关错误都提到路径"""
        path_error_keys = [
            "path_not_exist",
            "path_not_dir",
            "permission_denied",
            "path_access_error",
        ]

        for key in path_error_keys:
            message = ERROR_MESSAGES[key]
            assert "{path}" in message, f"{key} should contain {{path}} placeholder"

    def test_error_messages_use_consistent_format(self):
        """测试错误消息使用一致的格式"""
        # 检查建议部分的格式一致性
        messages_with_suggestions = [
            "path_not_exist",
            "path_not_dir",
            "permission_denied",
            "path_access_error",
        ]

        for key in messages_with_suggestions:
            message = ERROR_MESSAGES[key]
            # 建议应该在新行上
            assert "\nSuggestion:" in message, \
                f"{key} should have 'Suggestion:' on a new line"

    def test_usage_examples_are_valid(self):
        """测试使用示例的有效性"""
        message = ERROR_MESSAGES["kiro_requires_project"]

        # 应该包含有效的使用示例
        assert "python install.py" in message
        assert "<skill>" in message or "skill" in message.lower()
        assert "<path>" in message or "path" in message.lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
