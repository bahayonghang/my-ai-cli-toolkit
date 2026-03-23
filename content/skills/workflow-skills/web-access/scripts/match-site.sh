#!/bin/bash
# 根据用户输入匹配站点经验文件
# 用法：match-site.sh "用户输入文本"
# 输出：匹配到的站点经验内容，无匹配则静默

DIR="$(dirname "$0")/../references/site-patterns"
[ ! -d "$DIR" ] && exit 0
[ -z "$1" ] && exit 0

for f in "$DIR"/*.md; do
  [ ! -f "$f" ] && continue
  base=$(basename "$f")
  [ "$base" = "README.md" ] && continue
  grep -q '^domain:' "$f" 2>/dev/null || continue
  domain=$(basename "$f" .md)
  # 提取 aliases 行，去掉 yaml 格式字符，逗号分隔转竖线
  aliases=$(grep '^aliases:' "$f" | sed 's/^aliases: *//;s/\[//g;s/\]//g;s/, */|/g;s/ *$//')
  # 构建匹配模式：domain|alias1|alias2
  patterns="$domain"
  [ -n "$aliases" ] && patterns="$patterns|$aliases"
  # 匹配用户输入（不区分大小写，固定字符串用 fgrep 思路但需要多模式所以用 grep -iE）
  if echo "$1" | grep -qiE "$patterns"; then
    echo "--- 站点经验: $domain ---"
    # 跳过 frontmatter（两个 --- 之间），输出正文
    awk 'BEGIN{n=0} /^---$/{n++;next} n>=2{print}' "$f"
    echo ""
  fi
done
