# Vue Best Practices

Vue 3 and TypeScript best practices with Volar and vue-tsc.

## Overview

Vue Best Practices provides expert guidance for writing type-safe Vue 3 components with TypeScript. It covers proper typing patterns, component props extraction, template type checking, and Volar configuration to ensure correct and maintainable Vue code.

## Features

- ✅ **Type Safety** - Proper TypeScript patterns for Vue 3
- 🔧 **Volar Integration** - Optimal IDE configuration
- 📦 **Props Extraction** - Extract types from .vue components
- 🎯 **Template Checking** - Catch undefined components in templates
- 🏗️ **Component Design** - Best practices for wrapper components

## Core Rules

### Extract Component Props

Extract types from .vue components for wrapper components:

```typescript
// ❌ Wrong - Duplicating props
<script setup lang="ts">
interface Props {
  title: string;
  count: number;
}
defineProps<Props>();
</script>

// ✅ Correct - Extract from component
import type { ComponentProps } from 'vue-component-type-helpers';
import MyComponent from './MyComponent.vue';

type MyComponentProps = ComponentProps<typeof MyComponent>;
```

**Keywords**: get props type, wrapper component, extend props, inherit props, ComponentProps

### Strict Template Type Checking

Enable strict template checking to catch undefined components:

```json
// tsconfig.json
{
  "vueCompilerOptions": {
    "strictTemplates": true
  }
}
```

This catches errors like:
```vue
<template>
  <!-- ❌ Error: Component 'UndefinedComponent' not found -->
  <UndefinedComponent />
</template>
```

**Keywords**: undefined component, template error, strictTemplates

## Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "jsxImportSource": "vue"
  },
  "vueCompilerOptions": {
    "strictTemplates": true
  }
}
```

### Volar Setup

Install Volar extension in VS Code:
- Volar (Vue Language Features)
- TypeScript Vue Plugin

## Common Patterns

### Defining Props

```vue
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
});
</script>
```

### Emits with Types

```vue
<script setup lang="ts">
const emit = defineEmits<{
  update: [value: string];
  close: [];
}>();

emit('update', 'new value');
</script>
```

### Composables

```typescript
export function useCounter() {
  const count = ref(0);
  const increment = () => count.value++;
  
  return {
    count: readonly(count),
    increment
  };
}
```

## Best Practices

- Always use `<script setup lang="ts">`
- Define explicit prop types
- Use `ComponentProps` for wrapper components
- Enable `strictTemplates` in tsconfig
- Leverage Volar for type checking
- Use `readonly()` for exposed reactive state

## Triggers

This skill activates when:
- Writing Vue components
- Reviewing Vue code
- Refactoring components
- Extracting props
- Configuring Volar
- Template type checking issues

## Requirements

- Vue 3.3+
- TypeScript 5.0+
- Volar 1.0+
- vue-tsc 1.8+

## Version

8.0.0

## Author

hyf0

## License

MIT
