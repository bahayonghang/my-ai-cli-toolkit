"""
属性测试: 技能列表加载完整性

**Property 1: 技能列表加载完整性**
**Validates: Requirements 2.1, 2.2**

*For any* registry.toml 配置文件，加载后返回的技能列表 SHALL 包含配置文件中定义的所有技能，
且每个技能的名称、类型、描述、依赖列表和支持平台都与配置文件中的定义一致。

使用 hypothesis 库进行属性测试，至少运行 100 次迭代。
"""

import sys
import tempfile
from pathlib import Path

# 添加 external-skills/tui 目录到 sys.path
TUI_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(TUI_ROOT))

from hypothesis import given, settings, assume
from hypothesis import strategies as st

from core.manager import ExternalSkillManager
from core.models import ExternalSkillInfo


# --- Hypothesis Strategies ---

# 有效的技能类型
SKILL_TYPES = ["npm-cli", "npx", "pip-cli", "git"]

# 有效的平台列表
PLATFORMS = ["claude", "codex", "gemini", "kiro", "windsurf", "cursor", "copilot"]

# 有效的依赖列表
DEPENDENCIES = ["node", "npm", "npx", "python3", "pip", "git"]


@st.composite
def skill_name_strategy(draw):
    """生成有效的技能名称
    
    技能名称应该是 kebab-case 格式，如 "my-skill-name"
    """
    # 生成 1-3 个单词组成的名称
    words = draw(st.lists(
        st.text(
            alphabet="abcdefghijklmnopqrstuvwxyz",
            min_size=2,
            max_size=10,
        ),
        min_size=1,
        max_size=3,
    ))
    return "-".join(words)


@st.composite
def skill_data_strategy(draw):
    """生成单个技能的配置数据"""
    name = draw(skill_name_strategy())
    
    # 确保名称不为空
    assume(len(name) > 0)
    
    # 生成简单的描述（避免特殊字符导致 TOML 解析问题）
    description = draw(st.text(
        alphabet="abcdefghijklmnopqrstuvwxyz0123456789 ",
        min_size=0,
        max_size=50,
    ))
    
    skill_type = draw(st.sampled_from(SKILL_TYPES))
    
    # 生成简单的包名（避免特殊字符）
    package = draw(st.text(
        alphabet="abcdefghijklmnopqrstuvwxyz0123456789-",
        min_size=1,
        max_size=30,
    ))
    
    # 生成依赖列表 (0-3 个依赖)
    requires = draw(st.lists(
        st.sampled_from(DEPENDENCIES),
        min_size=0,
        max_size=3,
        unique=True,
    ))
    
    # 生成支持的平台列表 (1-5 个平台，或者 "all")
    use_all = draw(st.booleans())
    if use_all:
        supported_targets = ["all"]
    else:
        supported_targets = draw(st.lists(
            st.sampled_from(PLATFORMS),
            min_size=1,
            max_size=5,
            unique=True,
        ))
    
    # 生成简单的 homepage URL
    domain = draw(st.text(
        alphabet="abcdefghijklmnopqrstuvwxyz",
        min_size=3,
        max_size=10,
    ))
    homepage = f"https://{domain}.com" if domain else "https://example.com"
    
    license_name = draw(st.sampled_from(["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", ""]))
    
    return {
        "name": name,
        "description": description,
        "type": skill_type,
        "package": package,
        "requires": requires,
        "supported_targets": supported_targets,
        "homepage": homepage,
        "license": license_name,
    }


@st.composite
def registry_config_strategy(draw):
    """生成完整的 registry 配置
    
    生成 1-5 个技能的配置
    """
    num_skills = draw(st.integers(min_value=1, max_value=5))
    
    skills = {}
    for _ in range(num_skills):
        skill_data = draw(skill_data_strategy())
        name = skill_data["name"]
        
        # 确保技能名称唯一
        if name in skills:
            continue
        
        skills[name] = skill_data
    
    # 确保至少有一个技能
    assume(len(skills) > 0)
    
    return skills


def generate_toml_content(skills_config: dict) -> str:
    """将技能配置转换为 TOML 格式字符串"""
    lines = ["# Generated registry.toml for testing", ""]
    
    for name, data in skills_config.items():
        lines.append(f"[skills.{name}]")
        lines.append(f'description = "{data["description"]}"')
        lines.append(f'type = "{data["type"]}"')
        lines.append(f'package = "{data["package"]}"')
        
        # requires 列表
        requires_str = ", ".join(f'"{r}"' for r in data["requires"])
        lines.append(f"requires = [{requires_str}]")
        
        # supported_targets 列表
        targets_str = ", ".join(f'"{t}"' for t in data["supported_targets"])
        lines.append(f"supported_targets = [{targets_str}]")
        
        lines.append(f'homepage = "{data["homepage"]}"')
        lines.append(f'license = "{data["license"]}"')
        lines.append("")
    
    return "\n".join(lines)


def create_temp_registry(skills_config: dict) -> Path:
    """创建临时 registry.toml 文件并返回路径"""
    toml_content = generate_toml_content(skills_config)
    
    # 创建临时文件
    fd, path = tempfile.mkstemp(suffix=".toml", prefix="registry_")
    with open(fd, "w", encoding="utf-8") as f:
        f.write(toml_content)
    
    return Path(path)


# --- Property Tests ---

class TestSkillsLoadingCompleteness:
    """Property 1: 技能列表加载完整性
    
    **Validates: Requirements 2.1, 2.2**
    """

    @given(skills_config=registry_config_strategy(), platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_all_skills_loaded(self, skills_config, platform):
        """验证所有配置的技能都被加载
        
        **Validates: Requirements 2.1**
        
        对于任意 registry.toml 配置，加载后返回的技能列表应包含配置文件中定义的所有技能。
        """
        registry_file = create_temp_registry(skills_config)
        try:
            # 加载技能
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)
            loaded_skills = manager.get_skills()
            
            # 验证: 加载的技能数量等于配置的技能数量
            assert len(loaded_skills) == len(skills_config), (
                f"期望加载 {len(skills_config)} 个技能，实际加载 {len(loaded_skills)} 个"
            )
            
            # 验证: 所有配置的技能名称都在加载结果中
            loaded_names = {s.name for s in loaded_skills}
            config_names = set(skills_config.keys())
            assert loaded_names == config_names, (
                f"技能名称不匹配: 期望 {config_names}, 实际 {loaded_names}"
            )
        finally:
            # 清理临时文件
            registry_file.unlink(missing_ok=True)

    @given(skills_config=registry_config_strategy(), platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_skill_fields_match_config(self, skills_config, platform):
        """验证每个技能的所有字段与配置一致
        
        **Validates: Requirements 2.2**
        
        验证名称、类型、描述、依赖列表和支持平台都与配置文件中的定义一致。
        """
        registry_file = create_temp_registry(skills_config)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)
            loaded_skills = manager.get_skills()
            
            # 构建加载结果的字典
            loaded_dict = {s.name: s for s in loaded_skills}
            
            for name, config in skills_config.items():
                assert name in loaded_dict, f"技能 {name} 未被加载"
                
                skill = loaded_dict[name]
                
                # 验证名称
                assert skill.name == name, (
                    f"技能名称不匹配: 期望 {name}, 实际 {skill.name}"
                )
                
                # 验证类型
                assert skill.skill_type == config["type"], (
                    f"技能 {name} 类型不匹配: 期望 {config['type']}, 实际 {skill.skill_type}"
                )
                
                # 验证描述
                assert skill.description == config["description"], (
                    f"技能 {name} 描述不匹配: 期望 '{config['description']}', 实际 '{skill.description}'"
                )
                
                # 验证依赖列表
                assert skill.requires == config["requires"], (
                    f"技能 {name} 依赖列表不匹配: 期望 {config['requires']}, 实际 {skill.requires}"
                )
                
                # 验证支持平台
                assert skill.supported_targets == config["supported_targets"], (
                    f"技能 {name} 支持平台不匹配: 期望 {config['supported_targets']}, 实际 {skill.supported_targets}"
                )
        finally:
            registry_file.unlink(missing_ok=True)

    @given(skills_config=registry_config_strategy(), platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_is_supported_correctness(self, skills_config, platform):
        """验证 is_supported 标志的正确性
        
        **Validates: Requirements 2.2**
        
        当 supported_targets 包含 "all" 或当前平台时，is_supported 应为 True。
        """
        registry_file = create_temp_registry(skills_config)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)
            loaded_skills = manager.get_skills()
            
            for skill in loaded_skills:
                targets = skills_config[skill.name]["supported_targets"]
                expected_supported = "all" in targets or platform in targets
                assert skill.is_supported == expected_supported, (
                    f"技能 {skill.name} is_supported 不正确: "
                    f"平台={platform}, targets={targets}, "
                    f"期望 {expected_supported}, 实际 {skill.is_supported}"
                )
        finally:
            registry_file.unlink(missing_ok=True)


class TestSkillsLoadingRoundTrip:
    """验证技能加载的往返一致性
    
    **Validates: Requirements 2.1, 2.2**
    """

    @given(skills_config=registry_config_strategy(), platform=st.sampled_from(PLATFORMS))
    @settings(max_examples=100, deadline=None)
    def test_complete_roundtrip(self, skills_config, platform):
        """验证完整的往返一致性
        
        **Validates: Requirements 2.1, 2.2**
        
        配置 -> TOML -> 加载 -> 验证所有字段
        """
        registry_file = create_temp_registry(skills_config)
        try:
            manager = ExternalSkillManager(platform=platform, registry_path=registry_file)
            loaded_skills = manager.get_skills()
            
            # 构建加载结果的字典
            loaded_dict = {s.name: s for s in loaded_skills}
            
            # 验证每个配置的技能
            for name, config in skills_config.items():
                assert name in loaded_dict, f"技能 {name} 未被加载"
                
                skill = loaded_dict[name]
                
                # 验证所有字段
                assert skill.name == name
                assert skill.description == config["description"]
                assert skill.skill_type == config["type"]
                assert skill.package == config["package"]
                assert skill.requires == config["requires"]
                assert skill.supported_targets == config["supported_targets"]
                assert skill.homepage == config["homepage"]
                assert skill.license == config["license"]
                
                # 验证 is_supported
                targets = config["supported_targets"]
                expected_supported = "all" in targets or platform in targets
                assert skill.is_supported == expected_supported
        finally:
            registry_file.unlink(missing_ok=True)
