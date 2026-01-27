# uv-expert

uv Python 包管理器专家指导。

## 概述

UV Expert 提供 uv (由 Astral 开发) Python 包管理器的专家级指导。uv 是一个极速的 Python 包安装器和解析器，可作为 pip、pip-tools 和 virtualenv 的替代品。

## 核心命令

### 包管理

```bash
# 安装包
uv pip install requests

# 从 requirements.txt 安装
uv pip install -r requirements.txt

# 卸载包
uv pip uninstall requests

# 查看已安装包
uv pip list
```

### 虚拟环境

```bash
# 创建虚拟环境
uv venv

# 指定 Python 版本
uv venv --python 3.12

# 激活虚拟环境 (bash/zsh)
source .venv/bin/activate

# 激活虚拟环境 (PowerShell)
.venv\Scripts\activate
```

### 依赖锁定

```bash
# 生成锁文件
uv pip compile requirements.in -o requirements.txt

# 同步依赖
uv pip sync requirements.txt
```

## 项目管理

### pyproject.toml 集成

```toml
[project]
name = "myproject"
version = "0.1.0"
dependencies = [
    "requests>=2.28",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = [
    "pytest",
    "ruff",
]
```

```bash
# 安装项目及依赖
uv pip install -e .

# 安装开发依赖
uv pip install -e ".[dev]"
```

## 性能对比

| 操作 | pip | uv |
|------|-----|-----|
| 安装 Django | ~10s | ~0.5s |
| 解析依赖 | 慢 | 极快 |
| 并行下载 | 否 | 是 |

## 配置选项

### 镜像源

```bash
# 使用镜像源
uv pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests

# 设置默认镜像
export UV_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
```

### 缓存

```bash
# 清理缓存
uv cache clean

# 指定缓存目录
export UV_CACHE_DIR=/path/to/cache
```

## 最佳实践

1. **始终使用虚拟环境** - 避免污染系统 Python
2. **锁定依赖版本** - 使用 `uv pip compile` 生成锁文件
3. **利用缓存** - 加速重复安装
4. **持续更新** - uv 发展迅速，保持最新版本

## 与其他工具对比

| 功能 | pip | poetry | uv |
|------|-----|--------|-----|
| 安装速度 | 慢 | 中 | 极快 |
| 依赖解析 | 基础 | 完整 | 完整 |
| 锁文件 | 否 | 是 | 是 |
| 虚拟环境 | 需 venv | 内置 | 内置 |

## 相关资源

- [uv 官方文档](https://github.com/astral-sh/uv)
- [Astral](https://astral.sh/)
