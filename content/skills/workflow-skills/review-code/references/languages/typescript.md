# TypeScript/JavaScript Code Review Guide

> TypeScript 代码审查指南，覆盖类型系统、泛型、条件类型、strict 模式、async/await 模式等核心主题。

## 目录

- [类型安全基础](#类型安全基础)
- [泛型模式](#泛型模式)
- [Strict 模式配置](#strict-模式配置)
- [异步处理](#异步处理)
- [不可变性](#不可变性)
- [Review Checklist](#review-checklist)

---

## 类型安全基础

### 避免使用 any

```typescript
// ❌ Using any defeats type safety
function processData(data: any) {
  return data.value;  // 无类型检查，运行时可能崩溃
}

// ✅ Use proper types
interface DataPayload {
  value: string;
}
function processData(data: DataPayload) {
  return data.value;
}

// ✅ 未知类型用 unknown + 类型守卫
function processUnknown(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data');
}
```

### 类型收窄

```typescript
// ❌ 不安全的类型断言
function getLength(value: string | string[]) {
  return (value as string[]).length;  // 如果是 string 会出错
}

// ✅ 使用类型守卫
function getLength(value: string | string[]): number {
  if (Array.isArray(value)) {
    return value.length;
  }
  return value.length;
}

// ✅ 使用 in 操作符
interface Dog { bark(): void }
interface Cat { meow(): void }

function speak(animal: Dog | Cat) {
  if ('bark' in animal) {
    animal.bark();
  } else {
    animal.meow();
  }
}
```

### 字面量类型与 as const

```typescript
// ❌ 类型过于宽泛
const config = {
  endpoint: '/api',
  method: 'GET'  // 类型是 string
};

// ✅ 使用 as const 获得字面量类型
const config = {
  endpoint: '/api',
  method: 'GET'
} as const;  // method 类型是 'GET'
```

---

## 泛型模式

### 基础泛型

```typescript
// ❌ 重复代码
function getFirstString(arr: string[]): string | undefined {
  return arr[0];
}
function getFirstNumber(arr: number[]): number | undefined {
  return arr[0];
}

// ✅ 使用泛型
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

### 泛型约束

```typescript
// ❌ 泛型没有约束，无法访问属性
function getProperty<T>(obj: T, key: string) {
  return obj[key];  // Error: 无法索引
}

// ✅ 使用 keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
getProperty(user, 'name');  // 返回类型是 string
getProperty(user, 'age');   // 返回类型是 number
getProperty(user, 'foo');   // Error: 'foo' 不在 keyof User
```

### 常见泛型工具类型

```typescript
// ✅ 善用内置工具类型
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;         // 所有属性可选
type RequiredUser = Required<User>;       // 所有属性必需
type ReadonlyUser = Readonly<User>;       // 所有属性只读
type UserKeys = keyof User;               // 'id' | 'name' | 'email'
type NameOnly = Pick<User, 'name'>;       // { name: string }
type WithoutId = Omit<User, 'id'>;        // { name: string; email: string }
type UserRecord = Record<string, User>;   // { [key: string]: User }
```

---

## Strict 模式配置

### 推荐配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### strictNullChecks 重要性

```typescript
// ❌ 关闭 strictNullChecks
function greet(name: string) {
  console.log(name.toUpperCase());
}
greet(null);  // 运行时错误！

// ✅ 开启 strictNullChecks
function greet(name: string | null) {
  if (name) {
    console.log(name.toUpperCase());
  }
}
```

---

## 异步处理

### Promise 类型

```typescript
// ✅ 明确返回 Promise 类型
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

// ✅ 使用 Promise.all 并行执行
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);
```

### 错误处理

```typescript
// ❌ 忽略异步错误
async function badFetch() {
  const data = await fetchData();  // 可能抛出错误
  return data;
}

// ✅ 正确处理异步错误
async function goodFetch() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;  // 或返回默认值
  }
}
```

---

## 不可变性

### readonly 使用

```typescript
// ✅ 函数参数使用 readonly
function processItems(items: readonly string[]): string[] {
  // items.push('new');  // Error: readonly
  return items.map(item => item.toUpperCase());
}

// ✅ 对象属性使用 readonly
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}
```

### 不可变更新模式

```typescript
// ❌ 直接修改对象
function updateUser(user: User, newName: string) {
  user.name = newName;  // 修改原对象
  return user;
}

// ✅ 创建新对象
function updateUser(user: User, newName: string): User {
  return { ...user, name: newName };
}

// ❌ 直接修改数组
function addItem(items: string[], item: string) {
  items.push(item);  // 修改原数组
  return items;
}

// ✅ 创建新数组
function addItem(items: string[], item: string): string[] {
  return [...items, item];
}
```

---

## Review Checklist

### 类型安全
- [ ] 避免使用 any，使用 unknown + 类型守卫
- [ ] 使用类型收窄而非类型断言
- [ ] 开启 strict 模式
- [ ] 函数返回值类型明确

### 泛型
- [ ] 泛型命名清晰（T, K, V 等）
- [ ] 使用泛型约束限制类型范围
- [ ] 善用内置工具类型（Partial, Pick, Omit 等）

### 异步
- [ ] async/await 错误处理完整
- [ ] Promise 类型明确
- [ ] 并行请求使用 Promise.all

### 不可变性
- [ ] 函数参数使用 readonly
- [ ] 不直接修改对象/数组
- [ ] 使用展开运算符创建新引用
