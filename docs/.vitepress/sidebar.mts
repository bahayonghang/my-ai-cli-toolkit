import fs from 'fs'
import path from 'path'

export function generateSidebarByDir(dir) {
    const items = []

    // Try to push an Overview link if index.md exists
    const overviewPath = path.join(dir, 'index.md')
    if (fs.existsSync(overviewPath)) {
        items.push({ text: 'Overview', link: `/${path.relative('docs', dir).replace(/\\/g, '/')}/` })
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            const subDir = path.join(dir, entry.name)
            const subEntries = fs.readdirSync(subDir, { withFileTypes: true })

            const subItems = []
            for (const subEntry of subEntries) {
                if (subEntry.isFile() && subEntry.name.endsWith('.md') && subEntry.name !== 'index.md') {
                    const nameWithoutExt = path.basename(subEntry.name, '.md')
                    const link = `/${path.relative('docs', path.join(subDir, nameWithoutExt)).replace(/\\/g, '/')}`
                    subItems.push({ text: nameWithoutExt, link })
                }
            }

            if (subItems.length > 0) {
                // format title nicely: "ai-and-llm" -> "Ai And Llm" (or customize as needed)
                const formatTitle = (str) => {
                    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                        .replace('And', '&').replace('Llm', 'LLM');
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
