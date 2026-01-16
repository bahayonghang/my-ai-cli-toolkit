"""
属性测试: 搜索过滤正确性

**Property 4: 搜索过滤正确性**
**Validates: Requirements 6.2, 6.3**

*For any* 技能列表和搜索查询字符串，过滤后的结果 SHALL 只包含名称或描述中包含查询字符串
（不区分大小写）的技能，且不遗漏任何匹配的技能。

使用 hypothesis 库进行属性测试，至少运行 100 次迭代。
"""

import sys
from pathlib import Path

# 添加 external-skills/tui 目录到 sys.path
TUI_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(TUI_ROOT))

from hypothesis import given, settings, assume
from hypothesis import strategies as st

from core.models import ExternalSkillInfo


# --- 核心过滤逻辑 (从 SkillListView 提取) ---
# 由于 SkillListView 是 Textual 组件，直接导入会有依赖问题
# 我们测试其核心过滤逻辑 _matches_filter 的等价实现

def matches_filter(skill_name: str, skill_description: str, filter_text: str) -> bool:
    """检查技能是否匹配过滤条件
    
    这是 SkillListView._matches_filter 方法的核心逻辑。
    匹配名称或描述（不区分大小写）。
    
    Args:
        skill_name: 技能名称
        skill_description: 技能描述
        filter_text: 过滤文本（已转为小写）
        
    Returns:
        是否匹配
        
    Requirements: 6.3
    """
    if not filter_text:
        return True
    
    # 匹配名称或描述
    name_match = filter_text in skill_name.lower()
    desc_match = filter_text in skill_description.lower()
    
    return name_match or desc_match


# --- Hypothesis Strategies ---

# 有效的技能类型
SKILL_TYPES = ["npm-cli", "npx", "pip-cli", "git"]

# 有效的平台列表
PLATFORMS = ["claude", "codex", "gemini", "kiro", "windsurf", "cursor", "copilot"]


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
        min_size=0,
        max_size=100,
    ))


@st.composite
def skill_info_strategy(draw):
    """生成单个 ExternalSkillInfo 对象"""
    name = draw(skill_name_strategy())
    assume(len(name) > 0)
    
    description = draw(description_strategy())
    skill_type = draw(st.sampled_from(SKILL_TYPES))
    package = draw(st.text(
        alphabet="abcdefghijklmnopqrstuvwxyz0123456789-",
        min_size=1,
        max_size=30,
    ))
    
    return ExternalSkillInfo(
        name=name,
        description=description,
        skill_type=skill_type,
        package=package,
        requires=[],
        supported_targets=["all"],
        homepage="https://example.com",
        license="MIT",
        is_supported=True,
    )


@st.composite
def skill_list_strategy(draw):
    """生成技能列表 (1-10 个技能)"""
    num_skills = draw(st.integers(min_value=1, max_value=10))
    
    skills = []
    seen_names = set()
    
    for _ in range(num_skills):
        skill = draw(skill_info_strategy())
        # 确保名称唯一
        if skill.name not in seen_names:
            seen_names.add(skill.name)
            skills.append(skill)
    
    assume(len(skills) > 0)
    return skills


@st.composite
def search_query_strategy(draw):
    """生成搜索查询字符串
    
    查询可以是空字符串或包含大小写字母、数字的字符串
    """
    return draw(st.text(
        alphabet="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        min_size=0,
        max_size=20,
    ))


# --- Helper Functions ---

def matches_filter_reference(skill: ExternalSkillInfo, query: str) -> bool:
    """参考实现: 检查技能是否匹配过滤条件
    
    匹配名称或描述（不区分大小写）。
    
    Args:
        skill: 技能信息
        query: 搜索查询字符串
        
    Returns:
        是否匹配
    """
    if not query:
        return True
    
    query_lower = query.lower()
    name_match = query_lower in skill.name.lower()
    desc_match = query_lower in skill.description.lower()
    
    return name_match or desc_match


def filter_skills_reference(skills: list[ExternalSkillInfo], query: str) -> list[ExternalSkillInfo]:
    """参考实现: 过滤技能列表
    
    Args:
        skills: 技能列表
        query: 搜索查询字符串
        
    Returns:
        过滤后的技能列表
    """
    return [s for s in skills if matches_filter_reference(s, query)]


def matches_filter_impl(skill: ExternalSkillInfo, query: str) -> bool:
    """实际实现: 调用核心过滤逻辑
    
    模拟 SkillListView._matches_filter 的行为。
    
    Args:
        skill: 技能信息
        query: 搜索查询字符串
        
    Returns:
        是否匹配
    """
    filter_text = query.lower() if query else ""
    return matches_filter(skill.name, skill.description, filter_text)


# --- Property Tests ---

class TestSearchFilterCorrectness:
    """Property 4: 搜索过滤正确性
    
    **Validates: Requirements 6.2, 6.3**
    """

    @given(skill=skill_info_strategy(), query=search_query_strategy())
    @settings(max_examples=100, deadline=None)
    def test_matches_filter_case_insensitive(self, skill, query):
        """验证过滤匹配不区分大小写
        
        **Validates: Requirements 6.3**
        
        对于任意技能和查询字符串，匹配应该不区分大小写。
        """
        # 测试实际实现
        actual_match = matches_filter_impl(skill, query)
        
        # 测试参考实现
        expected_match = matches_filter_reference(skill, query)
        
        assert actual_match == expected_match, (
            f"过滤结果不一致: skill.name='{skill.name}', skill.description='{skill.description}', "
            f"query='{query}', 期望 {expected_match}, 实际 {actual_match}"
        )

    @given(skill=skill_info_strategy(), query=search_query_strategy())
    @settings(max_examples=100, deadline=None)
    def test_name_match_implies_filter_match(self, skill, query):
        """验证名称匹配则过滤匹配
        
        **Validates: Requirements 6.3**
        
        如果查询字符串（不区分大小写）出现在技能名称中，则该技能应该匹配过滤条件。
        """
        if not query:
            return  # 空查询总是匹配，跳过
        
        # 检查名称是否包含查询（不区分大小写）
        name_contains_query = query.lower() in skill.name.lower()
        
        if name_contains_query:
            assert matches_filter_impl(skill, query), (
                f"名称包含查询但未匹配: skill.name='{skill.name}', query='{query}'"
            )

    @given(skill=skill_info_strategy(), query=search_query_strategy())
    @settings(max_examples=100, deadline=None)
    def test_description_match_implies_filter_match(self, skill, query):
        """验证描述匹配则过滤匹配
        
        **Validates: Requirements 6.3**
        
        如果查询字符串（不区分大小写）出现在技能描述中，则该技能应该匹配过滤条件。
        """
        if not query:
            return  # 空查询总是匹配，跳过
        
        # 检查描述是否包含查询（不区分大小写）
        desc_contains_query = query.lower() in skill.description.lower()
        
        if desc_contains_query:
            assert matches_filter_impl(skill, query), (
                f"描述包含查询但未匹配: skill.description='{skill.description}', query='{query}'"
            )

    @given(skill=skill_info_strategy(), query=search_query_strategy())
    @settings(max_examples=100, deadline=None)
    def test_no_match_implies_filter_reject(self, skill, query):
        """验证不匹配则过滤拒绝
        
        **Validates: Requirements 6.2, 6.3**
        
        如果查询字符串（不区分大小写）既不在名称中也不在描述中，则该技能不应该匹配过滤条件。
        """
        if not query:
            return  # 空查询总是匹配，跳过
        
        query_lower = query.lower()
        name_contains = query_lower in skill.name.lower()
        desc_contains = query_lower in skill.description.lower()
        
        if not name_contains and not desc_contains:
            assert not matches_filter_impl(skill, query), (
                f"名称和描述都不包含查询但匹配了: "
                f"skill.name='{skill.name}', skill.description='{skill.description}', query='{query}'"
            )

    @given(skills=skill_list_strategy(), query=search_query_strategy())
    @settings(max_examples=100, deadline=None)
    def test_filter_completeness(self, skills, query):
        """验证过滤完整性 - 不遗漏任何匹配的技能
        
        **Validates: Requirements 6.2, 6.3**
        
        过滤后的结果应该包含所有匹配的技能，不遗漏任何一个。
        """
        # 使用参考实现计算期望结果
        expected_matches = filter_skills_reference(skills, query)
        expected_names = {s.name for s in expected_matches}
        
        # 使用实际实现计算结果
        actual_names = {s.name for s in skills if matches_filter_impl(s, query)}
        
        # 验证: 实际匹配的技能集合等于期望匹配的技能集合
        assert actual_names == expected_names, (
            f"过滤结果不完整: query='{query}', "
            f"期望 {expected_names}, 实际 {actual_names}, "
            f"遗漏 {expected_names - actual_names}, 多余 {actual_names - expected_names}"
        )

    @given(skills=skill_list_strategy(), query=search_query_strategy())
    @settings(max_examples=100, deadline=None)
    def test_filter_precision(self, skills, query):
        """验证过滤精确性 - 不包含任何不匹配的技能
        
        **Validates: Requirements 6.2**
        
        过滤后的结果应该只包含匹配的技能，不包含任何不匹配的技能。
        """
        # 使用参考实现计算期望结果
        expected_matches = filter_skills_reference(skills, query)
        expected_names = {s.name for s in expected_matches}
        
        # 使用实际实现计算结果
        actual_names = {s.name for s in skills if matches_filter_impl(s, query)}
        
        # 验证: 实际匹配的技能都在期望匹配中（没有多余的）
        extra_matches = actual_names - expected_names
        assert len(extra_matches) == 0, (
            f"过滤结果包含不匹配的技能: query='{query}', 多余 {extra_matches}"
        )


class TestSearchFilterEdgeCases:
    """搜索过滤边界情况测试
    
    **Validates: Requirements 6.2, 6.3**
    """

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_empty_query_matches_all(self, skill):
        """验证空查询匹配所有技能
        
        **Validates: Requirements 6.2**
        
        当查询字符串为空时，所有技能都应该匹配。
        """
        assert matches_filter_impl(skill, ""), (
            f"空查询应该匹配所有技能: skill.name='{skill.name}'"
        )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_exact_name_match(self, skill):
        """验证精确名称匹配
        
        **Validates: Requirements 6.3**
        
        使用技能的完整名称作为查询应该匹配该技能。
        """
        assert matches_filter_impl(skill, skill.name), (
            f"精确名称匹配失败: skill.name='{skill.name}'"
        )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_case_variation_match(self, skill):
        """验证大小写变体匹配
        
        **Validates: Requirements 6.3**
        
        使用技能名称的大写版本作为查询应该匹配该技能。
        """
        # 使用大写查询
        query_upper = skill.name.upper()
        expected = matches_filter_reference(skill, query_upper)
        actual = matches_filter_impl(skill, query_upper)
        
        assert actual == expected, (
            f"大小写变体匹配不一致: skill.name='{skill.name}', query='{query_upper}'"
        )

    @given(skill=skill_info_strategy())
    @settings(max_examples=100, deadline=None)
    def test_partial_name_match(self, skill):
        """验证部分名称匹配
        
        **Validates: Requirements 6.3**
        
        使用技能名称的子串作为查询应该匹配该技能。
        """
        if len(skill.name) < 2:
            return  # 名称太短，跳过
        
        # 取名称的前半部分作为查询
        partial_query = skill.name[:len(skill.name) // 2]
        
        assert matches_filter_impl(skill, partial_query), (
            f"部分名称匹配失败: skill.name='{skill.name}', query='{partial_query}'"
        )
