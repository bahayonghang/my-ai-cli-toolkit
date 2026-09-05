# 发现链核验与处置边界

日期：2026-09-05。访问方式：Windows 文件系统及 SQLite mode=ro；用户具名提供主机后使用 SSH BatchMode 到 lyh@192.168.31.17。没有安装、缓存、数据库或远端写入。

## Windows 当前事实
- 版本管理源：本仓库 skills/git-github-collaboration/git-commit 和 skills/developer-tools-integrations/goal-meta-skill。origin 为 https://github.com/bahayonghang/my-ai-cli-toolkit.git。
- .agents/skills/{skill} 为 Junction，指向 .claude/skills/{skill}；后者为 SymbolicLink，指向 ../../.skillsmanage/skills/{skill}。
- MCS db.sqlite 的 skills 表把 .skillsmanage/skills/{skill} 标为 is_central=1；这是安装管理中心，不是工作树实时链接。
- skill_repository_members 指向本仓库同名 source_path；skill_repositories 指向 bahayonghang/my-ai-cli-toolkit、main、source_type=github。登记 last_synced_at=2026-09-05T02:55:00.228649400+00:00，resolved_commit_sha=4e3e38c0cf384b10d6283a6477b8d0ebdab7e336；这些是数据库记录，不证明目前文件仍由该提交生成。
- 当前部署由 GitHub 仓库来源记录、中心实体副本、客户端链接组成。repo 的 scripts/install_projects.py:39、900 附近则属于项目本地 live-link 工具，不是上述全局管理链的刷新工具。没有把 just install-projects 当成全局发布命令。
- 没有运行同步动作；MCS 内部复制/缓存刷新行为尚未以实际更新运行验证，不能宣称改源码立即对全局生效。

修改前 SKILL.md 原始 SHA-256（仓库源、管理副本、发现入口均相同）：
- git-commit 1.12.0：e14348b8b3200a7d76ff30491dbf63a7e9bc073bd1344d4dc81d65c9b15569f2
- goal-meta-skill 0.8.0：ea865cd8c84024ec3cf0c0993c8dc5581928e753752dde7cc81a1aec4a64a176

## Linux 当前事实
- /home/lyh/.agents/skills/goal-meta-skill 是指向 /home/lyh/.skillsmanage/skills/goal-meta-skill 的 symlink。
- 全局 SKILL.md 0.8.0 SHA-256：ea865cd8c84024ec3cf0c0993c8dc5581928e753752dde7cc81a1aec4a64a176，与本地修改前相同。
- /mnt/data/lyh/industrytslib/.agents/skills/goal-meta-skill 为独立目录；SKILL.md 0.3.0 SHA-256：c9c0ada35c22c55098cad6ea58cd084de184b478cb8c38ac4fa56f5dc6dd7c8e。
- git check-ignore -v 命中 .gitignore:301 的 .agents/ 规则。
- git status --porcelain=v1 -uno 显示该远端项目 AGENTS.md 和 CLAUDE.md 有既存改动；未读取其内容或修改。
- 文件层面的同名不同版本已现场验证；是否在同一选择器重复呈现、实际解析顺序与新会话加载结果尚无现场证据。

## 后续处置原则
完整旧包差异见 remote-package-comparison.md。不得直接覆盖旧目录。实际删除、改名、链接切换或 MCS 同步均未获本轮具体处置授权；先以差异证明是否有必须保留的非 Trellis 增量，并列出确切操作和回滚对象。若改变 Trellis 路由/生成规则，按已批准计划只报告冲突。

O1：源和发现链/管理来源已验证；真实同步运行机制仍部分未验证。
O2：SSH 路径、版本和完整旧包增量已核实；全部 9 文件与历史 d15f4354 一致，且项目实际有 .agents/.claude/.grok 三份副本，详见 remote-package-comparison.md。
O3：未执行安装/处置或新会话枚举，保持未完成。
