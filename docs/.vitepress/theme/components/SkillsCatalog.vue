<script setup lang="ts">
import { computed } from 'vue'
import {
  getCategoryDescriptions,
  getCategoryLabels,
  getSkillsCatalog,
  type SkillsCatalogLocale,
} from '../../skillsCatalog.mts'

const props = defineProps<{
  locale: SkillsCatalogLocale
}>()

const catalog = computed(() => getSkillsCatalog(props.locale))
const labels = computed(() => getCategoryLabels(props.locale))
const descriptions = computed(() => getCategoryDescriptions(props.locale))
const detailLabel = computed(() =>
  props.locale === 'zh' ? '查看详情' : 'View details',
)
</script>

<template>
  <div class="skills-catalog">
    <section
      v-for="category in catalog"
      :key="category.slug"
      class="skills-catalog-section"
    >
      <header class="skills-catalog-header">
        <h2>{{ labels[category.slug] ?? category.slug }}</h2>
        <p v-if="descriptions[category.slug]">
          {{ descriptions[category.slug] }}
        </p>
      </header>

      <div class="skills-catalog-grid">
        <article
          v-for="skill in category.skills"
          :key="skill.path"
          class="skills-catalog-card"
        >
          <h3>
            <a :href="skill.path">{{ skill.title }}</a>
          </h3>
          <p>{{ skill.summary }}</p>
          <a class="skills-catalog-link" :href="skill.path">
            {{ detailLabel }}
          </a>
        </article>
      </div>
    </section>
  </div>
</template>
