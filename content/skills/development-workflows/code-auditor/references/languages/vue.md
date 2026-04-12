# Vue 3 Code Review Guide

> Vue 3 Composition API 代码审查指南，覆盖响应性系统、Props/Emits、Watchers、Composables、Vue 3.5 新特性等核心主题。

## 目录

- [响应性系统](#响应性系统)
- [Props & Emits](#props--emits)
- [Vue 3.5 新特性](#vue-35-新特性)
- [Watchers](#watchers)
- [Composables](#composables)
- [Review Checklist](#review-checklist)

---

## 响应性系统

### ref vs reactive 选择

```vue
<!-- ✅ 基本类型用 ref -->
<script setup lang="ts">
const count = ref(0)
const name = ref('Vue')

// ref 需要 .value 访问
count.value++
</script>

<!-- ✅ 对象/数组用 reactive（可选）-->
<script setup lang="ts">
const state = reactive({
  user: null,
  loading: false,
  error: null
})

// reactive 直接访问
state.loading = true
</script>

<!-- 💡 现代最佳实践：全部使用 ref，保持一致性 -->
<script setup lang="ts">
const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<Error | null>(null)
</script>
```

### 解构 reactive 对象

```vue
<!-- ❌ 解构 reactive 会丢失响应性 -->
<script setup lang="ts">
const state = reactive({ count: 0, name: 'Vue' })
const { count, name } = state  // 丢失响应性！
</script>

<!-- ✅ 使用 toRefs 保持响应性 -->
<script setup lang="ts">
const state = reactive({ count: 0, name: 'Vue' })
const { count, name } = toRefs(state)  // 保持响应性
// 或者直接使用 ref
const count = ref(0)
const name = ref('Vue')
</script>
```

### computed 副作用

```vue
<!-- ❌ computed 中产生副作用 -->
<script setup lang="ts">
const fullName = computed(() => {
  console.log('Computing...')  // 副作用！
  otherRef.value = 'changed'   // 修改其他状态！
  return `${firstName.value} ${lastName.value}`
})
</script>

<!-- ✅ computed 只用于派生状态 -->
<script setup lang="ts">
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})
// 副作用放在 watch 或事件处理中
watch(fullName, (name) => {
  console.log('Name changed:', name)
})
</script>
```

---

## Props & Emits

### 直接修改 props

```vue
<!-- ❌ 直接修改 props -->
<script setup lang="ts">
const props = defineProps<{ user: User }>()
props.user.name = 'New Name'  // 永远不要直接修改 props！
</script>

<!-- ✅ 使用 emit 通知父组件更新 -->
<script setup lang="ts">
const props = defineProps<{ user: User }>()
const emit = defineEmits<{
  update: [name: string]
}>()
const updateName = (name: string) => emit('update', name)
</script>
```

### defineProps 类型声明

```vue
<!-- ❌ defineProps 缺少类型声明 -->
<script setup lang="ts">
const props = defineProps(['title', 'count'])  // 无类型检查
</script>

<!-- ✅ 使用类型声明 + withDefaults -->
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items?: string[]
}
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []  // 对象/数组默认值需要工厂函数
})
</script>
```

### defineEmits 类型安全

```vue
<!-- ❌ defineEmits 缺少类型 -->
<script setup lang="ts">
const emit = defineEmits(['update', 'delete'])  // 无类型检查
emit('update', someValue)  // 参数类型不安全
</script>

<!-- ✅ 完整的类型定义 -->
<script setup lang="ts">
const emit = defineEmits<{
  update: [id: number, value: string]
  delete: [id: number]
  'custom-event': [payload: CustomPayload]
}>()

// 现在有完整的类型检查
emit('update', 1, 'new value')  // ✅
emit('update', 'wrong')  // ❌ TypeScript 报错
</script>
```

---

## Vue 3.5 新特性

### Reactive Props Destructure (3.5+)

```vue
<!-- Vue 3.5+：解构保持响应性 -->
<script setup lang="ts">
const { count, name = 'default' } = defineProps<{
  count: number
  name?: string
}>()

// count 和 name 自动保持响应性！
// 可以直接在模板和 watch 中使用
watch(() => count, (newCount) => {
  console.log('Count changed:', newCount)
})
</script>
```

### defineModel (3.4+)

```vue
<!-- ❌ 传统 v-model 实现：冗长 -->
<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// 需要 computed 来双向绑定
const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<!-- ✅ defineModel：简洁的 v-model 实现 -->
<script setup lang="ts">
// 自动处理 props 和 emit
const model = defineModel<string>()

// 直接使用
model.value = 'new value'  // 自动 emit
</script>
<template>
  <input v-model="model" />
</template>

<!-- ✅ 命名 v-model -->
<script setup lang="ts">
// v-model:title 的实现
const title = defineModel<string>('title')

// 带默认值和选项
const count = defineModel<number>('count', {
  default: 0,
  required: false
})
</script>
```

### useTemplateRef (3.5+)

```vue
<!-- ✅ useTemplateRef：更清晰的模板引用 -->
<script setup lang="ts">
import { useTemplateRef } from 'vue'

const input = useTemplateRef<HTMLInputElement>('my-input')

onMounted(() => {
  input.value?.focus()
})
</script>
<template>
  <input ref="my-input" />
</template>
```

### useId (3.5+)

```vue
<!-- ✅ useId：SSR 安全的唯一 ID -->
<script setup lang="ts">
import { useId } from 'vue'

const id = useId()  // 例如：'v-0'
</script>
<template>
  <label :for="id">Name</label>
  <input :id="id" />
</template>
```

---

## Watchers

### watch vs watchEffect

```vue
<script setup lang="ts">
// ✅ watch：明确指定依赖，惰性执行
watch(
  () => props.userId,
  async (userId) => {
    user.value = await fetchUser(userId)
  }
)

// ✅ watchEffect：自动收集依赖，立即执行
watchEffect(async () => {
  // 自动追踪 props.userId
  user.value = await fetchUser(props.userId)
})

// 💡 选择指南：
// - 需要旧值？用 watch
// - 需要惰性执行？用 watch
// - 依赖复杂？用 watchEffect
</script>
```

### watch 清理函数

```vue
<!-- ❌ watch 缺少清理函数，可能内存泄漏 -->
<script setup lang="ts">
watch(searchQuery, async (query) => {
  const controller = new AbortController()
  const data = await fetch(`/api/search?q=${query}`, {
    signal: controller.signal
  })
  results.value = await data.json()
  // 如果 query 快速变化，旧请求不会被取消！
})
</script>

<!-- ✅ 使用 onCleanup 清理副作用 -->
<script setup lang="ts">
watch(searchQuery, async (query, _, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())  // 取消旧请求

  try {
    const data = await fetch(`/api/search?q=${query}`, {
      signal: controller.signal
    })
    results.value = await data.json()
  } catch (e) {
    if (e.name !== 'AbortError') throw e
  }
})
</script>
```

---

## Composables

### 命名规范

```ts
// ✅ 以 use 开头
function useUser() { ... }
function useLocalStorage() { ... }
function useAsyncState() { ... }

// ❌ 不以 use 开头
function getUser() { ... }
function localStorageHelper() { ... }
```

### 参数设计

```ts
// ✅ 使用 options 对象参数（参数多时）
function useFetch(url: string, options?: UseFetchOptions) {
  const {
    immediate = true,
    refetch = false,
    onError
  } = options || {}
  // ...
}

// ✅ 使用 required 参数（关键参数）
function useStorage<T>(key: string, defaultValue: T) {
  // key 是必需的
}
```

### 副作用清理

```ts
// ✅ 在 onUnmounted 中清理副作用
export function useEventListener(
  target: EventTarget,
  event: string,
  callback: EventListener
) {
  onMounted(() => {
    target.addEventListener(event, callback)
  })
  
  onUnmounted(() => {
    target.removeEventListener(event, callback)
  })
}
```

---

## Review Checklist

### 响应性
- [ ] ref/reactive 使用恰当
- [ ] 解构 reactive 使用 toRefs
- [ ] computed 无副作用
- [ ] 避免不必要的响应性转换

### Props & Emits
- [ ] 不直接修改 props
- [ ] defineProps 有类型声明
- [ ] defineEmits 类型完整
- [ ] 使用 defineModel 简化 v-model

### Vue 3.5 特性
- [ ] Reactive Props Destructure 正确使用
- [ ] useTemplateRef 替代字符串 ref
- [ ] useId 用于 SSR 安全 ID

### Watchers
- [ ] 有清理函数防止内存泄漏
- [ ] watch vs watchEffect 选择正确
- [ ] 依赖数组完整

### Composables
- [ ] 以 use 开头命名
- [ ] 副作用正确清理
- [ ] 参数设计合理
- [ ] 返回值类型清晰
