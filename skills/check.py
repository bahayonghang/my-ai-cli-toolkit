#!/usr/bin/env python3
"""
检查 skills 目录下所有 SKILL.md 文件的 YAML frontmatter 完整性
"""

import io
import re
import sys
from pathlib import Path

import yaml

# 确保 stdout 使用 UTF-8 编码，解决 Windows GBK 编码问题
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


def extract_yaml_frontmatter(content: str) -> dict | None:
    """
    从 Markdown 内容中提取 YAML frontmatter

    Args:
        content: Markdown 文件内容

    Returns:
        解析后的 YAML 字典，如果没有 frontmatter 则返回 None
    """
    # 匹配 YAML frontmatter (以 --- 开始和结束)
    pattern = r'^---\s*\n(.*?)\n---\s*\n'
    match = re.match(pattern, content, re.DOTALL)

    if not match:
        return None

    yaml_content = match.group(1)
    try:
        return yaml.safe_load(yaml_content)
    except yaml.YAMLError:
        return None


def check_skill_metadata(skill_path: Path) -> dict[str, any]:
    """
    检查单个 skill 的 metadata 完整性

    Args:
        skill_path: skill 目录路径

    Returns:
        检查结果字典
    """
    result = {
        'name': skill_path.name,
        'has_skill_md': False,
        'has_frontmatter': False,
        'has_category': False,
        'has_tags': False,
        'category_value': None,
        'tags_value': None,
        'errors': []
    }

    # 检查 SKILL.md 文件 (大小写不敏感)
    skill_md_path = None
    for candidate in ['SKILL.md', 'skill.md', 'Skill.md']:
        candidate_path = skill_path / candidate
        if candidate_path.exists():
            skill_md_path = candidate_path
            break

    if not skill_md_path:
        result['errors'].append('未找到 SKILL.md 文件')
        return result

    result['has_skill_md'] = True

    # 读取文件内容
    try:
        content = skill_md_path.read_text(encoding='utf-8')
    except Exception as e:
        result['errors'].append(f'读取文件失败: {e}')
        return result

    # 提取 YAML frontmatter
    metadata = extract_yaml_frontmatter(content)

    if metadata is None:
        result['errors'].append('未找到有效的 YAML frontmatter')
        return result

    result['has_frontmatter'] = True

    # 检查 category 字段
    if 'category' in metadata:
        result['has_category'] = True
        result['category_value'] = metadata['category']
    else:
        result['errors'].append('缺少 category 字段')

    # 检查 tags 字段
    if 'tags' in metadata:
        result['has_tags'] = True
        result['tags_value'] = metadata['tags']
    else:
        result['errors'].append('缺少 tags 字段')

    return result


def scan_skills_directory(skills_dir: Path = None) -> list[dict]:
    """
    扫描 skills 目录下的所有 skill

    Args:
        skills_dir: skills 目录路径，默认为当前脚本所在目录

    Returns:
        所有 skill 的检查结果列表
    """
    if skills_dir is None:
        skills_dir = Path(__file__).parent

    results = []

    # 遍历所有子目录
    for item in sorted(skills_dir.iterdir()):
        if item.is_dir() and not item.name.startswith('.'):
            result = check_skill_metadata(item)
            results.append(result)

    return results


def print_report(results: list[dict]):
    """
    打印检查报告

    Args:
        results: 检查结果列表
    """
    print("=" * 80)
    print("Skills Metadata 完整性检查报告")
    print("=" * 80)
    print()

    # 统计信息
    total = len(results)
    complete = sum(1 for r in results if r['has_category'] and r['has_tags'])
    incomplete = total - complete

    print(f"📊 总计: {total} 个 skills")
    print(f"✅ 完整: {complete} 个")
    print(f"❌ 不完整: {incomplete} 个")
    print()

    # 列出不完整的 skills
    if incomplete > 0:
        print("=" * 80)
        print("❌ 缺少 category 或 tags 的 Skills:")
        print("=" * 80)
        print()

        for result in results:
            if not (result['has_category'] and result['has_tags']):
                print(f"📁 {result['name']}")

                if not result['has_skill_md']:
                    print("   ⚠️  未找到 SKILL.md 文件")
                elif not result['has_frontmatter']:
                    print("   ⚠️  未找到 YAML frontmatter")
                else:
                    if not result['has_category']:
                        print("   ❌ 缺少 category 字段")
                    if not result['has_tags']:
                        print("   ❌ 缺少 tags 字段")

                if result['errors']:
                    for error in result['errors']:
                        print(f"   ⚠️  {error}")

                print()
    else:
        print("🎉 所有 skills 的 metadata 都完整！")
        print()


def main():
    """主函数"""
    results = scan_skills_directory()
    print_report(results)


if __name__ == '__main__':
    main()
