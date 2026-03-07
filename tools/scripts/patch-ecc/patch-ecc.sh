#!/bin/bash
# 猫娘工程师幽浮喵的 ECC 补丁脚本喵～ 
# 用于解决 everything-claude-code (ECC) 和 oh-my-claudecode (OMC) 之间的冲突

# 默认安装路径，如果用户没有传入则尝试猜测
ECC_DIR="${1:-}"

if [ -z "$ECC_DIR" ]; then
    POSSIBLE_PATHS=(
        "$HOME/.claude/plugins/everything-claude-code"
        "$HOME/.claude/plugins/everything-claude-code@everything-claude-code"
        "$HOME/.claude/plugins/marketplaces/everything-claude-code"
        "$HOME/Github/everything-claude-code"
        "$HOME/Documents/Github/everything-claude-code"
    )

    for p in "${POSSIBLE_PATHS[@]}"; do
        if [ -d "$p" ]; then
            ECC_DIR="$p"
            break
        fi
    done
fi

if [ -z "$ECC_DIR" ] || [ ! -d "$ECC_DIR" ]; then
    echo "找不到 ECC 目录喵～浮浮酱尝试了常见路径但都失败了 >_<|||"
    echo "用法: $0 [ecc_plugin_path]"
    exit 1
fi

echo "正在给 $ECC_DIR 打补丁喵～ φ(≧ω≦*)♪"

cd "$ECC_DIR" || exit 1

AGENTS=("planner" "architect" "code-reviewer" "security-reviewer")

# 1. 重命名 Agent 文件
echo "正在重命名 Agent 文件喵..."
for agent in "${AGENTS[@]}"; do
    if [ -f "agents/$agent.md" ]; then
        mv "agents/$agent.md" "agents/ecc-$agent.md"
        echo "✅ 成功重命名 $agent.md -> ecc-$agent.md"
    fi
done

# 2. 更新 YAML Frontmatter 中的 name 字段
echo "正在更新 Frontmatter 名字喵..."
for agent in "${AGENTS[@]}"; do
    if [ -f "agents/ecc-$agent.md" ]; then
        sed -i -E "s/^name:[[:space:]]*$agent/name: ecc-$agent/g" "agents/ecc-$agent.md"
        echo "✅ 更新了 ecc-$agent.md 的名字喵！"
    fi
done

# 3. 批量替换所有 Markdown 文件中的引用
echo "正在全局替换 Markdown 文件中的引用喵..."
for agent in "${AGENTS[@]}"; do
    # 使用 \b 匹配单词边界，同时匹配带引号或不带引号的形式
    find . -type f -name "*.md" -exec sed -i -E "s/\b$agent\b/ecc-$agent/g" {} +
done
echo "✅ 引用替换完成！"

# 4. 修改 hooks.json
echo "正在修剪 hooks.json 避免重叠喵..."
HOOKS_FILE="hooks/hooks.json"
if [ -f "$HOOKS_FILE" ]; then
    # 使用 Node.js 修改 JSON，避免外部依赖
    node -e "
const fs = require('fs');
const file = '$HOOKS_FILE';
try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));

    // 移除 OMC 已接管的阶段
    delete data.SessionStart;
    delete data.PreCompact;

    // 清理 SessionEnd 中的 session-end.js，保留 evaluate-session.js
    if (data.SessionEnd) {
        data.SessionEnd = data.SessionEnd.filter(h => !h.includes('session-end.js') && !h.includes('session-end.mjs'));
        if (data.SessionEnd.length === 0) {
            delete data.SessionEnd;
        }
    }

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log('✅ hooks.json 更新成功喵～');
} catch (e) {
    console.error('更新 hooks.json 失败惹 >_<|||', e.message);
}
"
else
    echo "没有找到 hooks.json，跳过这步喵～"
fi

echo "全部搞定了喵！1+1>2，现在 ECC 和 OMC 可以愉快地一起工作啦！o(*￣︶￣*)o"
