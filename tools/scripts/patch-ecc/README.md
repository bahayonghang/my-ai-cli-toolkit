## Claude Code 双插件实战：everything-claude-code × oh-my-claudecode 补丁

### 为什么要同时使用两个插件？ 🤔

Claude Code 的插件生态里，目前最强大的两个工具是：
- **[everything-claude-code (ECC)](https://github.com/affaan-m/everything-claude-code)**：专注于工程质量，提供 Rules 规范体系、Agents 专家团队、Hooks 自动化检查，核心理念是"需求驱动开发 + 90分质量门禁"。
- **[oh-my-claudecode (OMC)](https://github.com/oh-my-claudecode/oh-my-claudecode)**：专注于工作流增强，提供持久化记忆系统、自动驾驶模式、多模型协作（Claude/Codex/Gemini），核心理念是"智能记忆 + 高并发执行"。

两者互补性极强：ECC 管"做什么、怎么做好"，OMC 管"记住上下文、高效执行"。

### 存在什么冲突？ 💥

这两个强大的插件事实上都定义了一些同名的 Agent，比如：
- `planner` (规划专家 vs 战略规划顾问)
- `architect` (系统架构设计 vs 架构顾问)
- `code-reviewer` (代码质量审查 vs 代码审查专家)
- `security-reviewer` (安全漏洞检测 vs 安全审查专家)

如果不处理这些冲突，Claude 加载时就会不知所措，不知道该调用哪个，或者互相覆盖。另外，生命周期的 `hooks.json` 也有一些重复，可能会导致多余的保存或执行动作。

因此我们需要将 ECC 里面的冲突 Agent 重命名（加上 `ecc-` 前缀），并修剪多余的 Hooks，这样就能做到 **1+1>2** 啦！o(*￣︶￣*)o

### 脚本说明与使用方法 🛠️

`patch-ecc` 脚本正是为了解决上述冲突和实现完美共存而设计的。它会自动：
1. **自动探测路径**：脚本会尝试在 `~/.claude/plugins/everything-claude-code`, `~/.claude/plugins/marketplaces/everything-claude-code` 等多个常见安装位置自动定位 ECC 插件目录。
2. 重命名 ECC 的相关 Agent (`planner.md` -> `ecc-planner.md` 等)。
3. 同步更新文件内的 Frontmatter `name` 字段。
4. 搜索 ECC 所有 `.md` 依赖记录，将其内部调用名替换为加了前缀的名称。
5. 修剪 `hooks.json` 里与 OMC 重叠的部分，例如剔除 `SessionStart` 和 `PreCompact` 生命周期操作，清理 `session-end.js` 等。

**如何使用：**

如果你已经通过 `claude plugin marketplace add ...` 或者将其放入 `C:\Users\lyh\.claude\plugins\marketplaces` 下：

**对于 Windows PowerShell 用户：**
```powershell
# 脚本会自动尝试寻找默认安装路径，如果路径不同可以手动指定
.\patch-ecc.ps1

# 手动指定 ECC 路径的用法：
.\patch-ecc.ps1 -EccDir "C:\Users\lyh\.claude\plugins\marketplaces\everything-claude-code"
```

**对于 Linux/macOS 以及 Bash 用户：**
```bash
# 给予执行权限然后执行
chmod +x patch-ecc.sh
./patch-ecc.sh

# 手动指定 ECC 路径的用法：
./patch-ecc.sh "/path/to/everything-claude-code"
```

> [!WARNING]
> **⚠️ 更新注意事项 (IMPORTANT)**
> 
> 每次你通过 `git pull` 或其他方式 **更新或升级 everything-claude-code (ECC) 插件后**，上游最新的原始文件会覆盖掉这边的修改，导致命名冲突重现。
> 
> ***因此，每次更新 ECC 后，都请务必重新执行一次本脚本来重新打补丁喵！***

---
**📖 参考资料**
- [Claude Code 双插件实战：everything-claude-code × oh-my-claudecode](https://mp.weixin.qq.com/s/YBFncHbwke3JSP9jZy2JEA)
