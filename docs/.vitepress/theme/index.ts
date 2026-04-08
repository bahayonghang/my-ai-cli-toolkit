import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import SkillsCatalog from './components/SkillsCatalog.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('SkillsCatalog', SkillsCatalog)
  },
} satisfies Theme
