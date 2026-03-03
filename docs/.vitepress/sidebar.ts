import fs from 'node:fs'
import path from 'node:path'

export function generateSidebarByDir(dir: string, basePath = '/skills/') {
    const items: any[] = []

    // Try to push an Overview link if index.md exists
    const overviewPath = path.join(dir, 'index.md')
    if (fs.existsSync(overviewPath)) {
        items.push({ text: 'Overview', link: basePath })
    }

    if (!fs.existsSync(dir)) return [{ text: 'Skills', items }]

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            const subDir = path.join(dir, entry.name)
            const subEntries = fs.readdirSync(subDir, { withFileTypes: true })

            const subItems: any[] = []
            for (const subEntry of subEntries) {
                if (subEntry.isFile() && subEntry.name.endsWith('.md') && subEntry.name !== 'index.md') {
                    const nameWithoutExt = path.basename(subEntry.name, '.md')
                    // Using strict replace to avoid Windows path separater issues since this goes to URL
                    const linkParams = `${basePath}${entry.name}/${nameWithoutExt}`
                    subItems.push({ text: nameWithoutExt, link: linkParams })
                }
            }

            if (subItems.length > 0) {
                // format title nicely: "ai-and-llm" -> "AI & LLM" or "Ai And Llm"
                const formatTitle = (str: string) => {
                    // Remove '-skills' suffix if present
                    const baseName = str.replace(/-skills$/, '');

                    const mappings: Record<string, string> = {
                        'academic': 'Academic',
                        'ai-llm': 'AI & LLM',
                        'diagram': 'Diagram',
                        'document': 'Document',
                        'git-github': 'Git & GitHub',
                        'media': 'Media',
                        'skill-meta': 'Skill Meta',
                        'tech-stack': 'Tech Stack',
                        'workflow': 'Workflow'
                    };

                    if (mappings[baseName]) {
                        return mappings[baseName];
                    }

                    // Fallback
                    return str.split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                }

                items.push({
                    text: formatTitle(entry.name),
                    collapsed: false,
                    items: subItems
                })
            }
        }
    }

    return [{ text: 'Skills', items }]
}
