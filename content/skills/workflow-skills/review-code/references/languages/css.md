# CSS / Less / Sass Review Guide

CSS 及预处理器代码审查指南，覆盖性能、可维护性、响应式设计和浏览器兼容性。

## CSS 变量 vs 硬编码

### 应该使用变量的场景

```css
/* ❌ 硬编码 - 难以维护 */
.button {
  background: #3b82f6;
  border-radius: 8px;
}
.card {
  border: 1px solid #3b82f6;
  border-radius: 8px;
}

/* ✅ 使用 CSS 变量 */
:root {
  --color-primary: #3b82f6;
  --radius-md: 8px;
}
.button {
  background: var(--color-primary);
  border-radius: var(--radius-md);
}
.card {
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
}
```

### 变量命名规范

```css
/* 推荐的变量分类 */
:root {
  /* 颜色 */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-text: #1f2937;
  --color-text-muted: #6b7280;
  --color-bg: #ffffff;
  --color-border: #e5e7eb;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 字体 */
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-weight-normal: 400;
  --font-weight-bold: 700;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* 过渡 */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
}
```

### 变量作用域建议

```css
/* ✅ 组件级变量 - 减少全局污染 */
.card {
  --card-padding: var(--spacing-md);
  --card-radius: var(--radius-md);

  padding: var(--card-padding);
  border-radius: var(--card-radius);
}

/* ⚠️ 避免频繁用 JS 动态修改变量 - 影响性能 */
```

### 审查清单

- [ ] 颜色值是否使用变量？
- [ ] 间距是否来自设计系统？
- [ ] 重复值是否提取为变量？
- [ ] 变量命名是否语义化？

---

## 选择器性能

### 避免过度嵌套

```scss
// ❌ SCSS 嵌套过深 - 生成复杂选择器
.card {
  .header {
    .title {
      .icon {
        svg {
          path {
            fill: blue;
          }
        }
      }
    }
  }
}
// 生成: .card .header .title .icon svg path { }

// ✅ 限制嵌套深度（最多 3 层）
.card {
  .header {
    display: flex;
  }
}
.card-icon {
  svg path {
    fill: blue;
  }
}
```

### 避免低效选择器

```css
/* ❌ 通配符和标签选择器性能差 */
* { margin: 0; }  /* 遍历所有元素 */
div { padding: 10px; }  /* 遍历所有 div */

/* ✅ 使用类选择器 */
.reset { margin: 0; }
.container { padding: 10px; }
```

---

## 响应式设计

### 移动优先

```css
/* ✅ 移动优先：基础样式针对小屏幕 */
.card {
  padding: 16px;
  font-size: 14px;
}

/* 平板 */
@media (min-width: 768px) {
  .card {
    padding: 24px;
    font-size: 16px;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .card {
    padding: 32px;
  }
}
```

### 使用相对单位

```css
/* ❌ 固定像素值 */
.card {
  font-size: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

/* ✅ 相对单位 */
.card {
  font-size: 1rem;      /* 相对于根字体 */
  padding: 1.25rem;
  margin-bottom: 1rem;
}

/* ✅ 视口单位（特定场景） */
.hero {
  height: 100vh;        /* 视口高度 */
  font-size: clamp(1rem, 2.5vw, 2rem);  /* 响应式字体 */
}
```

---

## 现代 CSS 特性

### Container Queries

```css
/* ✅ 容器查询 - 基于容器而非视口 */
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
  .card-image {
    width: 40%;
  }
}
```

### CSS Grid 和 Flexbox

```css
/* ✅ Flexbox 用于一维布局 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* ✅ Grid 用于二维布局 */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

### 逻辑属性

```css
/* ❌ 物理属性 - 不利于国际化 */
.card {
  margin-left: 1rem;
  margin-right: 1rem;
  border-left: 2px solid blue;
}

/* ✅ 逻辑属性 - 支持 RTL */
.card {
  margin-inline: 1rem;  /* 水平方向 */
  border-inline-start: 2px solid blue;  /* 起始边 */
  padding-block: 1rem;  /* 垂直方向 */
}
```

---

## 性能优化

### 包含性（Containment）

```css
/* ✅ 限制样式计算范围 */
.widget {
  contain: layout style paint;
}

/* ✅ 严格包含（最强隔离） */
.isolated-component {
  contain: strict;
  content-visibility: auto;  /* 视口外不渲染 */
}
```

### will-change 使用

```css
/* ❌ 滥用 will-change */
.element {
  will-change: transform, opacity, left, top;  /* 太多！ */
}

/* ✅ 谨慎使用 */
.element {
  will-change: transform;  /* 动画前添加 */
}
.element.animation-complete {
  will-change: auto;  /* 动画后移除 */
}
```

---

## 可访问性

### 焦点样式

```css
/* ❌ 移除焦点样式 */
*:focus {
  outline: none;  /* 不要这样做！ */
}

/* ✅ 自定义焦点样式 */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ✅ 键盘导航专用 */
button:focus-visible {
  box-shadow: 0 0 0 3px var(--color-primary-focus);
}
```

### 减少动画（尊重用户偏好）

```css
/* ✅ 尊重用户的减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 颜色对比度

```css
/* ✅ 确保足够的对比度（WCAG AA: 4.5:1） */
.text-primary {
  color: #1f2937;  /* 深灰 */
  background: #ffffff;  /* 白底 - 对比度 12:1 ✅ */
}

.text-muted {
  color: #6b7280;  /* 中灰 */
  background: #ffffff;  /* 对比度 ~4.6:1 ✅ */
}

/* ❌ 对比度不足 */
.text-light {
  color: #9ca3af;  /* 浅灰 */
  background: #f3f4f6;  /* 浅灰底 - 对比度太低 ❌ */
}
```

---

## Review Checklist

### 变量和设计系统
- [ ] 使用 CSS 变量而非硬编码值
- [ ] 变量命名语义化、一致
- [ ] 颜色、间距、字体使用设计系统值

### 性能
- [ ] 选择器嵌套不超过 3 层
- [ ] 避免通配符和标签选择器
- [ ] 谨慎使用 will-change
- [ ] 考虑使用 content-visibility

### 响应式
- [ ] 移动优先的媒体查询
- [ ] 使用相对单位（rem, em, %）
- [ ] 考虑 Container Queries

### 现代特性
- [ ] 使用 Flexbox 和 Grid
- [ ] 考虑逻辑属性支持 RTL
- [ ] 使用现代 CSS 函数（clamp, min, max）

### 可访问性
- [ ] 保留/自定义焦点样式
- [ ] 尊重 prefers-reduced-motion
- [ ] 颜色对比度符合 WCAG 标准
