#!/usr/bin/env python3
"""
Analyze structure of Typst Touying and LaTeX Beamer slide files.

Extracts metadata, sections, slides, and generates statistics and checklist.
Outputs JSON to stdout for consumption by Claude Code commands.
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple


def detect_engine(content: str, file_path: Path) -> str:
    """Detect whether file is Typst or LaTeX based on content and extension."""
    suffix = file_path.suffix.lower()

    if suffix == '.typ':
        return 'typst'
    elif suffix in ['.tex', '.latex']:
        return 'latex'

    # Fallback: detect by content
    if re.search(r'\\documentclass|\\begin\{document\}', content):
        return 'latex'
    elif re.search(r'#import|#show:', content):
        return 'typst'

    return 'unknown'


def parse_typst_metadata(content: str) -> Dict[str, Any]:
    """Extract metadata from Typst Touying file."""
    metadata = {
        'title': None,
        'subtitle': None,
        'author': None,
        'institution': None,
        'date': None,
        'theme': None,
        'aspect_ratio': None
    }

    # Extract theme from import statement
    theme_match = re.search(r'#import\s+themes\.(\w+):', content)
    if theme_match:
        metadata['theme'] = theme_match.group(1)

    # Extract from config-info block
    config_match = re.search(r'config-info\((.*?)\)', content, re.DOTALL)
    if config_match:
        config_content = config_match.group(1)

        # Extract title
        title_match = re.search(r'title:\s*\[(.*?)\]', config_content, re.DOTALL)
        if title_match:
            metadata['title'] = title_match.group(1).strip()

        # Extract subtitle
        subtitle_match = re.search(r'subtitle:\s*\[(.*?)\]', config_content, re.DOTALL)
        if subtitle_match:
            metadata['subtitle'] = subtitle_match.group(1).strip()

        # Extract author
        author_match = re.search(r'author:\s*\[(.*?)\]', config_content, re.DOTALL)
        if author_match:
            metadata['author'] = author_match.group(1).strip()

        # Extract institution
        inst_match = re.search(r'institution:\s*\[(.*?)\]', config_content, re.DOTALL)
        if inst_match:
            metadata['institution'] = inst_match.group(1).strip()

        # Extract date
        date_match = re.search(r'date:\s*datetime\(.*?\)|date:\s*\[(.*?)\]', config_content)
        if date_match:
            metadata['date'] = date_match.group(0).strip()

    # Extract aspect ratio from theme config
    aspect_match = re.search(r'aspect-ratio:\s*"(\d+-\d+)"', content)
    if aspect_match:
        metadata['aspect_ratio'] = aspect_match.group(1)

    return metadata


def parse_typst_structure(content: str) -> Tuple[List[Dict], Dict[str, Any]]:
    """Parse Typst Touying file structure."""
    lines = content.split('\n')
    sections = []
    current_section = None
    current_slide = None

    checklist = {
        'has_title_page': False,
        'has_outline': False,
        'has_introduction': False,
        'has_core_content': False,
        'has_summary': False,
        'has_qa': False,
        'has_references': False
    }

    stats = {
        'total_sections': 0,
        'total_slides': 0,
        'slides_with_animation': 0,
        'slides_with_math': 0,
        'slides_with_tables': 0
    }

    for line_num, line in enumerate(lines, start=1):
        stripped = line.strip()

        # Check for title page
        if '#title-slide()' in stripped:
            checklist['has_title_page'] = True

        # Section heading (single =)
        if re.match(r'^=\s+[^=]', stripped):
            section_title = re.sub(r'^=\s+', '', stripped).strip()

            # Save previous section
            if current_section:
                sections.append(current_section)

            current_section = {
                'title': section_title,
                'line': line_num,
                'slides': []
            }
            stats['total_sections'] += 1
            current_slide = None

            # Check section names for checklist
            section_lower = section_title.lower()
            if any(kw in section_lower for kw in ['introduction', '引言', '介绍', '导言']):
                checklist['has_introduction'] = True
            elif any(kw in section_lower for kw in ['summary', 'conclusion', '总结', '结论']):
                checklist['has_summary'] = True
            elif any(kw in section_lower for kw in ['q&a', 'questions', '问答', '提问']):
                checklist['has_qa'] = True
            elif any(kw in section_lower for kw in ['reference', 'bibliography', '参考文献']):
                checklist['has_references'] = True

        # Slide heading (double ==)
        elif re.match(r'^==\s+', stripped):
            slide_title = re.sub(r'^==\s+', '', stripped).strip()

            # Check if this is an outline slide
            if '<touying:hidden>' in stripped or 'outline(' in content[line_num:line_num+10]:
                checklist['has_outline'] = True

            # Save previous slide
            if current_slide and current_section:
                current_section['slides'].append(current_slide)

            current_slide = {
                'title': slide_title,
                'line_start': line_num,
                'line_end': line_num,
                'has_animation': False,
                'has_math': False,
                'has_table': False,
                'bullet_count': 0
            }
            stats['total_slides'] += 1

        # Analyze slide content
        elif current_slide:
            current_slide['line_end'] = line_num

            # Check for animations
            if re.search(r'#pause|#uncover|#only', stripped):
                current_slide['has_animation'] = True

            # Check for math
            if re.search(r'\$[^$]+\$', stripped):
                current_slide['has_math'] = True

            # Check for tables
            if '#table(' in stripped:
                current_slide['has_table'] = True

            # Count bullets
            if re.match(r'^-\s+', stripped):
                current_slide['bullet_count'] += 1

    # Save last section and slide
    if current_slide and current_section:
        current_section['slides'].append(current_slide)
    if current_section:
        sections.append(current_section)

    # Update stats
    for section in sections:
        for slide in section['slides']:
            if slide['has_animation']:
                stats['slides_with_animation'] += 1
            if slide['has_math']:
                stats['slides_with_math'] += 1
            if slide['has_table']:
                stats['slides_with_tables'] += 1

    # Check if has core content (at least 2 sections beyond intro/summary)
    content_sections = [s for s in sections if not any(
        kw in s['title'].lower()
        for kw in ['introduction', 'summary', 'conclusion', 'q&a', 'reference',
                   '引言', '总结', '结论', '问答', '参考文献']
    )]
    checklist['has_core_content'] = len(content_sections) >= 2

    return sections, {'stats': stats, 'checklist': checklist}


def parse_latex_metadata(content: str) -> Dict[str, Any]:
    """Extract metadata from LaTeX Beamer file."""
    metadata = {
        'title': None,
        'subtitle': None,
        'author': None,
        'institution': None,
        'date': None,
        'theme': None,
        'aspect_ratio': None
    }

    # Extract title
    title_match = re.search(r'\\title\{(.*?)\}', content, re.DOTALL)
    if title_match:
        metadata['title'] = title_match.group(1).strip()

    # Extract subtitle
    subtitle_match = re.search(r'\\subtitle\{(.*?)\}', content, re.DOTALL)
    if subtitle_match:
        metadata['subtitle'] = subtitle_match.group(1).strip()

    # Extract author
    author_match = re.search(r'\\author\{(.*?)\}', content, re.DOTALL)
    if author_match:
        metadata['author'] = author_match.group(1).strip()

    # Extract institution
    inst_match = re.search(r'\\institute\{(.*?)\}', content, re.DOTALL)
    if inst_match:
        metadata['institution'] = inst_match.group(1).strip()

    # Extract date
    date_match = re.search(r'\\date\{(.*?)\}', content, re.DOTALL)
    if date_match:
        metadata['date'] = date_match.group(1).strip()

    # Extract theme
    theme_match = re.search(r'\\usetheme\{(\w+)\}', content)
    if theme_match:
        metadata['theme'] = theme_match.group(1).lower()

    # Extract aspect ratio
    aspect_match = re.search(r'\\documentclass\[.*?aspectratio=(\d+).*?\]', content)
    if aspect_match:
        ratio = aspect_match.group(1)
        # Convert 169 -> 16-9, 43 -> 4-3
        if ratio == '169':
            metadata['aspect_ratio'] = '16-9'
        elif ratio == '43':
            metadata['aspect_ratio'] = '4-3'
        else:
            metadata['aspect_ratio'] = ratio

    return metadata


def parse_latex_structure(content: str) -> Tuple[List[Dict], Dict[str, Any]]:
    """Parse LaTeX Beamer file structure."""
    lines = content.split('\n')
    sections = []
    current_section = None
    current_slide = None
    in_frame = False

    checklist = {
        'has_title_page': False,
        'has_outline': False,
        'has_introduction': False,
        'has_core_content': False,
        'has_summary': False,
        'has_qa': False,
        'has_references': False
    }

    stats = {
        'total_sections': 0,
        'total_slides': 0,
        'slides_with_animation': 0,
        'slides_with_math': 0,
        'slides_with_tables': 0
    }

    for line_num, line in enumerate(lines, start=1):
        stripped = line.strip()

        # Check for title page
        if re.search(r'\\titlepage|\\maketitle', stripped):
            checklist['has_title_page'] = True

        # Check for outline
        if '\\tableofcontents' in stripped:
            checklist['has_outline'] = True

        # Section
        section_match = re.match(r'\\section\{(.*?)\}', stripped)
        if section_match:
            section_title = section_match.group(1)

            # Save previous section
            if current_section:
                sections.append(current_section)

            current_section = {
                'title': section_title,
                'line': line_num,
                'slides': []
            }
            stats['total_sections'] += 1

            # Check section names for checklist
            section_lower = section_title.lower()
            if any(kw in section_lower for kw in ['introduction', '引言', '介绍', '导言']):
                checklist['has_introduction'] = True
            elif any(kw in section_lower for kw in ['summary', 'conclusion', '总结', '结论']):
                checklist['has_summary'] = True
            elif any(kw in section_lower for kw in ['q&a', 'questions', '问答', '提问']):
                checklist['has_qa'] = True
            elif any(kw in section_lower for kw in ['reference', 'bibliography', '参考文献']):
                checklist['has_references'] = True

        # Begin frame
        frame_match = re.match(r'\\begin\{frame\}(?:\{(.*?)\})?', stripped)
        if frame_match:
            in_frame = True
            slide_title = frame_match.group(1) if frame_match.group(1) else ''

            # Save previous slide
            if current_slide and current_section:
                current_section['slides'].append(current_slide)

            current_slide = {
                'title': slide_title,
                'line_start': line_num,
                'line_end': line_num,
                'has_animation': False,
                'has_math': False,
                'has_table': False,
                'bullet_count': 0
            }
            stats['total_slides'] += 1

        # Frame title (alternative syntax)
        elif in_frame and current_slide and not current_slide['title']:
            frametitle_match = re.match(r'\\frametitle\{(.*?)\}', stripped)
            if frametitle_match:
                current_slide['title'] = frametitle_match.group(1)

        # End frame
        elif '\\end{frame}' in stripped:
            in_frame = False
            if current_slide:
                current_slide['line_end'] = line_num

        # Analyze frame content
        elif in_frame and current_slide:
            current_slide['line_end'] = line_num

            # Check for animations
            if re.search(r'\\pause|\\onslide|\\only|\\uncover', stripped):
                current_slide['has_animation'] = True

            # Check for math
            if re.search(r'\\\[|\$|\\\(|\\begin\{equation\}|\\begin\{align\}', stripped):
                current_slide['has_math'] = True

            # Check for tables
            if re.search(r'\\begin\{tabular\}|\\begin\{table\}', stripped):
                current_slide['has_table'] = True

            # Count bullets
            if '\\item' in stripped:
                current_slide['bullet_count'] += 1

    # Save last section and slide
    if current_slide and current_section:
        current_section['slides'].append(current_slide)
    if current_section:
        sections.append(current_section)

    # Update stats
    for section in sections:
        for slide in section['slides']:
            if slide['has_animation']:
                stats['slides_with_animation'] += 1
            if slide['has_math']:
                stats['slides_with_math'] += 1
            if slide['has_table']:
                stats['slides_with_tables'] += 1

    # Check if has core content
    content_sections = [s for s in sections if not any(
        kw in s['title'].lower()
        for kw in ['introduction', 'summary', 'conclusion', 'q&a', 'reference',
                   '引言', '总结', '结论', '问答', '参考文献']
    )]
    checklist['has_core_content'] = len(content_sections) >= 2

    return sections, {'stats': stats, 'checklist': checklist}


def analyze_file(file_path: Path) -> Dict[str, Any]:
    """Analyze slide file and return structured data."""
    if not file_path.exists():
        return {'error': f'File not found: {file_path}'}

    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        return {'error': f'Failed to read file: {e}'}

    engine = detect_engine(content, file_path)

    if engine == 'unknown':
        return {'error': 'Unknown file format (not Typst or LaTeX)'}

    result = {
        'file': str(file_path),
        'engine': engine
    }

    if engine == 'typst':
        result['metadata'] = parse_typst_metadata(content)
        sections, analysis = parse_typst_structure(content)
        result['sections'] = sections
        result['stats'] = analysis['stats']
        result['checklist'] = analysis['checklist']
    else:  # latex
        result['metadata'] = parse_latex_metadata(content)
        sections, analysis = parse_latex_structure(content)
        result['sections'] = sections
        result['stats'] = analysis['stats']
        result['checklist'] = analysis['checklist']

    return result


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Analyze Typst Touying or LaTeX Beamer slide structure'
    )
    parser.add_argument(
        'file',
        type=Path,
        help='Path to slide file (.typ or .tex)'
    )
    parser.add_argument(
        '--pretty',
        action='store_true',
        help='Pretty-print JSON output'
    )

    args = parser.parse_args()

    result = analyze_file(args.file)

    if args.pretty:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(result, ensure_ascii=False))

    # Exit with error code if analysis failed
    if 'error' in result:
        sys.exit(1)


if __name__ == '__main__':
    main()
