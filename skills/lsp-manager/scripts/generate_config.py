#!/usr/bin/env python3
"""生成 LSP 配置文件"""

import json
import sys
from pathlib import Path

# 预定义的语言配置模板
CONFIGS = {
    "Python": {
        "python": {
            "command": "pyright-langserver",
            "args": ["--stdio"],
            "extensionToLanguage": {
                ".py": "python",
                ".pyi": "python"
            }
        }
    },
    "TypeScript": {
        "typescript": {
            "command": "typescript-language-server",
            "args": ["--stdio"],
            "extensionToLanguage": {
                ".ts": "typescript",
                ".tsx": "typescriptreact",
                ".js": "javascript",
                ".jsx": "javascriptreact"
            }
        }
    },
    "JavaScript": {
        "javascript": {
            "command": "typescript-language-server",
            "args": ["--stdio"],
            "extensionToLanguage": {
                ".js": "javascript",
                ".jsx": "javascriptreact"
            }
        }
    },
    "Go": {
        "go": {
            "command": "gopls",
            "args": ["serve"],
            "extensionToLanguage": {
                ".go": "go"
            }
        }
    },
    "Rust": {
        "rust": {
            "command": "rust-analyzer",
            "extensionToLanguage": {
                ".rs": "rust"
            }
        }
    },
    "C/C++": {
        "cpp": {
            "command": "clangd",
            "extensionToLanguage": {
                ".c": "c",
                ".cpp": "cpp",
                ".cc": "cpp",
                ".h": "c",
                ".hpp": "cpp"
            }
        }
    },
    "Ruby": {
        "ruby": {
            "command": "solargraph",
            "args": ["stdio"],
            "extensionToLanguage": {
                ".rb": "ruby"
            }
        }
    },
    "PHP": {
        "php": {
            "command": "intelephense",
            "args": ["--stdio"],
            "extensionToLanguage": {
                ".php": "php"
            }
        }
    }
}

def generate_lsp_config(languages):
    """根据检测到的语言生成 LSP 配置"""
    config = {}
    
    for lang in languages:
        if lang in CONFIGS:
            config.update(CONFIGS[lang])
    
    return config

def generate_plugin_manifest(name="auto-lsp"):
    """生成 plugin.json"""
    return {
        "name": name,
        "version": "1.0.0",
        "description": "Auto-generated LSP configuration",
        "lspServers": "./.lsp.json"
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: generate_config.py <语言1> <语言2> ...")
        sys.exit(1)
    
    languages = sys.argv[1:]
    
    # 生成 LSP 配置
    lsp_config = generate_lsp_config(languages)
    
    # 生成插件清单
    plugin_manifest = generate_plugin_manifest()
    
    # 输出结果
    output = {
        ".lsp.json": lsp_config,
        "plugin.json": plugin_manifest
    }
    
    print(json.dumps(output, indent=2))
