#!/usr/bin/env python3
"""检测项目中使用的编程语言"""

import os
import json
from collections import Counter
from pathlib import Path

def detect_languages(directory="."):
    """扫描目录并检测编程语言"""
    
    # 语言到扩展名的映射
    lang_extensions = {
        "Python": [".py", ".pyi"],
        "TypeScript": [".ts", ".tsx"],
        "JavaScript": [".js", ".jsx"],
        "Go": [".go"],
        "Rust": [".rs"],
        "C/C++": [".c", ".cpp", ".cc", ".h", ".hpp"],
        "Java": [".java"],
        "PHP": [".php"],
        "Ruby": [".rb"],
        "CSS": [".css", ".scss", ".sass"],
        "HTML": [".html", ".htm"],
        "Shell": [".sh", ".bash"],
    }
    
    # 统计文件
    file_counts = Counter()
    
    for root, dirs, files in os.walk(directory):
        # 跳过常见的忽略目录
        dirs[:] = [d for d in dirs if d not in {
            'node_modules', '.git', '__pycache__', 'venv', 
            '.venv', 'dist', 'build', 'target'
        }]
        
        for file in files:
            ext = Path(file).suffix.lower()
            for lang, extensions in lang_extensions.items():
                if ext in extensions:
                    file_counts[lang] += 1
    
    # 生成结果
    results = []
    for lang, count in file_counts.most_common():
        results.append({
            "language": lang,
            "file_count": count,
            "extensions": lang_extensions[lang]
        })
    
    return results

if __name__ == "__main__":
    import sys
    directory = sys.argv[1] if len(sys.argv) > 1 else "."
    
    languages = detect_languages(directory)
    
    if languages:
        print(json.dumps(languages, indent=2))
    else:
        print(json.dumps({"message": "未检测到支持的编程语言"}))
