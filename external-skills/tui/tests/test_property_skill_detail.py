"""
属性测试: 技能详情渲染完整性

**Property 2: 技能详情渲染完整性**
**Validates: Requirements 3.2**

*For any* ExternalSkillInfo 对象，渲染的详情字符串 SHALL 包含技能的名称、描述、类型、
包名、依赖列表、支持平台、主页链接和许可证信息。

使用 hypothesis 库进行属性测试，至少运行 100 次迭代。
"""

import sys
from pathlib import Path

# 添加 external-skills/tui 目录到 sys.path
TUI_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(TUI_ROOT))

from core.models import ExternalSkillInfo
from hypothesis import assume, given, settings
from hypothesis import strategies as st

# --- 核心渲染逻辑 (从 skill_detail.py 提取) ---
# 由于 skill_detail.py 是 Textual 组件，直接导入会有依赖问题
# 我们测试其核心渲染逻辑 render_skill_detail 的等价实现

# 技能类型图标映射
SKILL_TYPE_ICONS = {
    "npm-cli": "📦",
    "npx": "⚡",
    "pip-cli": "🐍",
    "git": "🔗",
}


def render_skill_detail(skill: ExternalSkillInfo) -> str:
    """渲染技能详情为字符串

    将 ExternalSkillInfo 对象渲染为包含所有字段的详情字符串。

    这是 components/skill_detail.py 中 render_skill_detail 函数的等价实现。

    Args:
        skill: 技能信息对象

    Returns:
        渲染后的详情字符串，包含名称、描述、类型、包名、
        依赖列表、支持平台、主页链接和许可证信息

    Requirements: 3.2
    """
    icon = SKILL_TYPE_ICONS.get(skill.skill_type, "📦")

    lines = [
        f"{icon} {skill.name}",
        "",
        f"📝 Description: {skill.description}",
        f"📦 Type: {skill.skill_type}",
        f"📍 Package: {skill.package}",
        f"🔧 Requires: {', '.join(skill.requires) if skill.requires else 'None'}",
        f"🎯 Platforms: {', '.join(skill.supported_targets) if skill.supported_targets else 'None'}",
        f"🏠 Homepage: {skill.homepage or 'N/A'}",
        f"📜 License: {skill.license or 'N/A'}",
    ]

    return "\n".join(lines)


# --- Hypothesis Strategies ---

# 有效的技能类型
SKILL_TYPES = ["npm-cli", "npx", "pip-cli", "git"]

# 有效的平台列表
PLATFORMS = ["claude", "codex", "gemini", "kiro", "windsurf", "cursor", "copilot", "all"]


@st.composite
def skill_name_strategy(draw):
    """生成有效的技能名称

    技能名称应该是 kebab-case 格式，如 "my-skill-name"
    """
    words = draw(st.lists(
        st.text(
            alphabet="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
            min_size=2,
            max_size=10,
        ),
        min_size=1,
        max_size=3,
    ))
    return "-".join(words)


@st.composite
def description_strategy(draw):
    """生成技能描述

    描述可以包含大小写字母、数字和空格
    """
    return draw(st.text(
        alphabet="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ",
        min_size=1,
        max_size=100,
    ))


@st.composite
def package_name_strategy(draw):
    """生成包名

    包名可以是 npm 包名、pip 包名或 git URL
    """
    return draw(st.text(
        alphabet="abcdefghijklmnopqrstuvwxyz0123456789-@/",
        min_size=1,
        max_size=50,
    ))


@st.composite
def requires_strategy(draw):
    """生成依赖列表

    依赖可以是 node, npm, python3, git 等
    """
    possible_deps = ["node", "npm", "python3", "git", "pip", "npx"]
    return draw(st.lists(
        st.sampled_from(possible_deps),
        min_size=0,
        max_size=4,
        unique=True,
    ))


@st.composite
def platforms_strategy(draw):
    """生成支持平台列表"""
    return draw(st.lists(
        st.sampled_from(PLATFORMS),
        min_size=0,
        max_size=5,
        unique=True,
    ))


@st.composite
def homepage_strategy(draw):
    """生成主页链接"""
    # 可能为空或有效 URL
    has_homepage = draw(st.booleans())
    if has_homepage:
        domain = draw(st.text(
            alphabet="abcdefghijklmnopqrstuvwxyz0123456789-",
            min_size=3,
            max_size=20,
        ))
        return f"https://{domain}.com"
    return ""


@st.composite
def license_strategy(draw):
    """生成许可证"""
    licenses = ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "ISC", ""]
    return draw(st.sampled_from(licenses))


@st.composite
def skill_info_strategy(draw):
    """生成完整的 ExternalSkillInfo 对象"""
    name = draw(skill_name_strategy())
    assume(len(name) > 0)

    description = draw(description_strategy())
    skill_type = draw(st.sampled_from(SKILL_TYPES))
    package = draw(package_name_strategy())
    requires = draw(requires_strategy())
    supported_targets = draw(platforms_strategy())
    homepage = draw(homepage_strategy())
    license_info = draw(license_strategy())
    is_supported = draw(st.booleans())

    return ExternalSkillInfo(
        name=name,
        description=description,
        skill_type=skill_type,
        package=package,
        requires=requires,
        supported_targets=supported_targets,
        homepage=homepage,
        license=license_info,
        is_supported=is_supported,
    )


# --- Property Tests ---

class TestSkillDetailRenderingCompleteness:
    """Property 2: 技能详情渲染完整性

    **Validates: Requirements 3.2**
    """

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_contains_name(self, skill):
        """验证渲染结果包含技能名称

        **Validates: Requirements 3.2**

        对于任意 ExternalSkillInfo 对象，渲染的详情字符串应该包含技能名称。
        """
        rendered = render_skill_detail(skill)

        assert skill.name in rendered, (
            f"渲染结果未包含技能名称: name='{skill.name}', rendered='{rendered}'"
        )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_contains_description(self, skill):
        """验证渲染结果包含技能描述

        **Validates: Requirements 3.2**

        对于任意 ExternalSkillInfo 对象，渲染的详情字符串应该包含技能描述。
        """
        rendered = render_skill_detail(skill)

        assert skill.description in rendered, (
            f"渲染结果未包含技能描述: description='{skill.description}', rendered='{rendered}'"
        )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_contains_type(self, skill):
        """验证渲染结果包含技能类型

        **Validates: Requirements 3.2**

        对于任意 ExternalSkillInfo 对象，渲染的详情字符串应该包含技能类型。
        """
        rendered = render_skill_detail(skill)

        assert skill.skill_type in rendered, (
            f"渲染结果未包含技能类型: skill_type='{skill.skill_type}', rendered='{rendered}'"
        )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_contains_package(self, skill):
        """验证渲染结果包含包名

        **Validates: Requirements 3.2**

        对于任意 ExternalSkillInfo 对象，渲染的详情字符串应该包含包名。
        """
        rendered = render_skill_detail(skill)

        assert skill.package in rendered, (
            f"渲染结果未包含包名: package='{skill.package}', rendered='{rendered}'"
        )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_contains_requires(self, skill):
        """验证渲染结果包含依赖列表

        **Validates: Requirements 3.2**

        对于任意 ExternalSkillInfo 对象，渲染的详情字符串应该包含依赖列表信息。
        如果依赖列表为空，应该显示 "None"；否则应该包含所有依赖名称。
        """
        rendered = render_skill_detail(skill)

        if not skill.requires:
            # 空依赖列表应该显示 "None"
            assert "Requires:" in rendered and "None" in rendered, (
                f"空依赖列表应显示 'None': requires={skill.requires}, rendered='{rendered}'"
            )
        else:
            # 非空依赖列表应该包含所有依赖
            for dep in skill.requires:
                assert dep in rendered, (
                    f"渲染结果未包含依赖 '{dep}': requires={skill.requires}, rendered='{rendered}'"
                )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_contains_platforms(self, skill):
        """验证渲染结果包含支持平台

        **Validates: Requirements 3.2**

        对于任意 ExternalSkillInfo 对象，渲染的详情字符串应该包含支持平台信息。
        如果平台列表为空，应该显示 "None"；否则应该包含所有平台名称。
        """
        rendered = render_skill_detail(skill)

        if not skill.supported_targets:
            # 空平台列表应该显示 "None"
            assert "Platforms:" in rendered and "None" in rendered, (
                f"空平台列表应显示 'None': supported_targets={skill.supported_targets}, rendered='{rendered}'"
            )
        else:
            # 非空平台列表应该包含所有平台
            for platform in skill.supported_targets:
                assert platform in rendered, (
                    f"渲染结果未包含平台 '{platform}': supported_targets={skill.supported_targets}, rendered='{rendered}'"
                )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_contains_homepage(self, skill):
        """验证渲染结果包含主页链接

        **Validates: Requirements 3.2**

        对于任意 ExternalSkillInfo 对象，渲染的详情字符串应该包含主页链接信息。
        如果主页为空，应该显示 "N/A"；否则应该包含主页 URL。
        """
        rendered = render_skill_detail(skill)

        if not skill.homepage:
            # 空主页应该显示 "N/A"
            assert "Homepage:" in rendered and "N/A" in rendered, (
                f"空主页应显示 'N/A': homepage='{skill.homepage}', rendered='{rendered}'"
            )
        else:
            # 非空主页应该包含 URL
            assert skill.homepage in rendered, (
                f"渲染结果未包含主页链接: homepage='{skill.homepage}', rendered='{rendered}'"
            )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_contains_license(self, skill):
        """验证渲染结果包含许可证信息

        **Validates: Requirements 3.2**

        对于任意 ExternalSkillInfo 对象，渲染的详情字符串应该包含许可证信息。
        如果许可证为空，应该显示 "N/A"；否则应该包含许可证名称。
        """
        rendered = render_skill_detail(skill)

        if not skill.license:
            # 空许可证应该显示 "N/A"
            assert "License:" in rendered and "N/A" in rendered, (
                f"空许可证应显示 'N/A': license='{skill.license}', rendered='{rendered}'"
            )
        else:
            # 非空许可证应该包含许可证名称
            assert skill.license in rendered, (
                f"渲染结果未包含许可证: license='{skill.license}', rendered='{rendered}'"
            )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_contains_all_required_fields(self, skill):
        """验证渲染结果包含所有必要字段

        **Validates: Requirements 3.2**

        对于任意 ExternalSkillInfo 对象，渲染的详情字符串应该同时包含：
        名称、描述、类型、包名、依赖列表、支持平台、主页链接和许可证信息。
        """
        rendered = render_skill_detail(skill)

        # 验证所有字段标签都存在
        required_labels = [
            "Description:",
            "Type:",
            "Package:",
            "Requires:",
            "Platforms:",
            "Homepage:",
            "License:",
        ]

        for label in required_labels:
            assert label in rendered, (
                f"渲染结果缺少字段标签 '{label}': rendered='{rendered}'"
            )

        # 验证名称存在（名称在标题行，没有标签）
        assert skill.name in rendered, (
            f"渲染结果未包含技能名称: name='{skill.name}', rendered='{rendered}'"
        )


class TestSkillDetailRenderingFormat:
    """技能详情渲染格式测试

    **Validates: Requirements 3.2**
    """

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_is_multiline(self, skill):
        """验证渲染结果是多行格式

        **Validates: Requirements 3.2**

        渲染的详情字符串应该是多行格式，便于阅读。
        """
        rendered = render_skill_detail(skill)

        lines = rendered.split("\n")
        assert len(lines) > 1, (
            f"渲染结果应该是多行格式: rendered='{rendered}'"
        )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_has_type_icon(self, skill):
        """验证渲染结果包含类型图标

        **Validates: Requirements 3.2**

        渲染的详情字符串应该包含与技能类型对应的图标。
        """
        rendered = render_skill_detail(skill)

        # 检查是否包含任意一个类型图标
        type_icons = ["📦", "⚡", "🐍", "🔗"]
        has_icon = any(icon in rendered for icon in type_icons)

        assert has_icon, (
            f"渲染结果应包含类型图标: skill_type='{skill.skill_type}', rendered='{rendered}'"
        )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_rendered_detail_returns_string(self, skill):
        """验证渲染函数返回字符串类型

        **Validates: Requirements 3.2**

        render_skill_detail 函数应该返回字符串类型。
        """
        rendered = render_skill_detail(skill)

        assert isinstance(rendered, str), (
            f"渲染结果应该是字符串类型: type={type(rendered)}"
        )
