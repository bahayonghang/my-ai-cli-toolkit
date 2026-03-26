# vue-best-practices

::: warning 历史文档
此页仅用于历史参考与兼容旧链接；对应的 skill 已不再由本仓库的 `content/skills/` 一方目录提供。
:::

Vue 3 和 TypeScript 最佳实践指南。

## 概述

Vue Best Practices 提供 Vue 3 与 TypeScript 开发的最佳实践指导，涵盖组合式 API、状态管理、组件设计等核心主题。

## 组合式 API

### 基础模式

```typescript
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 响应式状态
const count = ref(0)
const message = ref('')

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 生命周期
onMounted(() => {
  console.log('组件已挂载')
})

// 方法
function increment() {
  count.value++
}
</script>
```

### 组合函数 (Composables)

```typescript
// composables/useMouse.ts
export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

## TypeScript 集成

### Props 类型

```typescript
interface Props {
  title: string
  count?: number
  items: string[]
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
```

### Emit 类型

```typescript
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}>()
```

## 状态管理

### Pinia 基础

```typescript
// stores/counter.ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
```

## 组件设计原则

1. **单一职责** - 每个组件只做一件事
2. **Props 向下** - 数据通过 props 传递给子组件
3. **Events 向上** - 子组件通过事件通知父组件
4. **组合优于继承** - 使用 composables 复用逻辑

## 项目结构

```
src/
├── components/      # 通用组件
│   ├── ui/         # 基础 UI 组件
│   └── common/     # 业务通用组件
├── composables/    # 组合函数
├── stores/         # Pinia stores
├── views/          # 页面组件
├── types/          # TypeScript 类型
└── utils/          # 工具函数
```

## 最佳实践

| 实践 | 说明 |
|------|------|
| 使用 `<script setup>` | 更简洁的语法 |
| 类型化 props/emits | 更好的类型推断 |
| 组合函数复用逻辑 | 替代 mixins |
| Pinia 管理状态 | 替代 Vuex |
| 组件命名规范 | PascalCase |

## 相关资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [VueUse](https://vueuse.org/)
