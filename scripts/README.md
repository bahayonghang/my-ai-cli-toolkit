# Scripts

辅助脚本集合，用于安装和管理 Claude Code 相关工具。

## 脚本列表

| 脚本 | 描述 |
|------|------|
| [claude-mem.py](claude-mem.py) | Claude-Mem 持久化记忆系统 |
| [install_wshobson_agents.py](install_wshobson_agents.py) | wshobson/agents 插件安装助手 |

## install_wshobson_agents.py

安装 [wshobson/agents](https://github.com/wshobson/agents) 插件市场及推荐插件。

### 使用方法

```bash
# 默认运行（显示 marketplace 添加指令和插件列表）
python scripts/install_wshobson_agents.py

# 查看可用插件
python scripts/install_wshobson_agents.py --list

# 安装指定插件
python scripts/install_wshobson_agents.py --install python-development

# 安装所有推荐插件
python scripts/install_wshobson_agents.py --install-recommended

# 生成批量安装命令
python scripts/install_wshobson_agents.py --batch

# 查看使用示例
python scripts/install_wshobson_agents.py --examples
```

### 推荐插件

| 类别 | 插件 | 包含 Agents |
|------|------|-------------|
| Python | `python-development` | python-pro, django-pro, fastapi-pro |
| JavaScript | `javascript-typescript` | javascript-pro, typescript-pro |
| Review | `comprehensive-review` | architect-review, code-reviewer, security-auditor |
| Infrastructure | `deployment`, `kubernetes` | 部署和 K8s 相关 |
| Security | `security-scanning` | 安全扫描 |

### 在 Claude Code 中使用

```
# 添加 marketplace
/install-plugin-marketplace https://github.com/wshobson/agents

# 安装插件
/install-plugin python-development

# 使用 agent
@python-pro Create a FastAPI project with async patterns
```

## claude-mem.py

Claude-Mem 持久化记忆压缩系统，用于跨会话保存上下文。

### 功能

- 存储和检索会话观察记录
- 生成语义摘要
- 跨会话维护上下文
- 历史数据搜索

### 数据存储

默认存储路径: `~/.claude-mem/memory.db` (SQLite)
