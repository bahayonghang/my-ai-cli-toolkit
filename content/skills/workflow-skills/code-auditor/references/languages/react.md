# React Code Review Guide

React 审查重点：Hooks 规则、性能优化的适度性、组件设计、以及现代 React 19/RSC 模式。

## 目录

- [基础 Hooks 规则](#基础-hooks-规则)
- [useEffect 模式](#useeffect-模式)
- [useMemo / useCallback](#usememo--usecallback)
- [组件设计](#组件设计)
- [Error Boundaries & Suspense](#error-boundaries--suspense)
- [Server Components (RSC)](#server-components-rsc)
- [React 19 Actions & Forms](#react-19-actions--forms)
- [Suspense & Streaming SSR](#suspense--streaming-ssr)
- [TanStack Query v5](#tanstack-query-v5)
- [Review Checklists](#review-checklists)

---

## 基础 Hooks 规则

```tsx
// ❌ 条件调用 Hooks — 违反 Hooks 规则
function BadComponent({ isLoggedIn }) {
  if (isLoggedIn) {
    const [user, setUser] = useState(null);  // Error!
  }
  return <div>...</div>;
}

// ✅ Hooks 必须在组件顶层调用
function GoodComponent({ isLoggedIn }) {
  const [user, setUser] = useState(null);
  if (!isLoggedIn) return <LoginPrompt />;
  return <div>{user?.name}</div>;
}
```

---

## useEffect 模式

```tsx
// ❌ 依赖数组缺失或不完整
function BadEffect({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, []);  // 缺少 userId 依赖！
}

// ✅ 完整的依赖数组
function GoodEffect({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchUser(userId).then(data => {
      if (!cancelled) setUser(data);
    });
    return () => { cancelled = true; };  // 清理函数
  }, [userId]);
}

// ❌ useEffect 用于派生状态（反模式）
function BadDerived({ items }) {
  const [filteredItems, setFilteredItems] = useState([]);
  useEffect(() => {
    setFilteredItems(items.filter(i => i.active));
  }, [items]);  // 不必要的 effect + 额外渲染
  return <List items={filteredItems} />;
}

// ✅ 直接在渲染时计算，或用 useMemo
function GoodDerived({ items }) {
  const filteredItems = useMemo(
    () => items.filter(i => i.active),
    [items]
  );
  return <List items={filteredItems} />;
}

// ❌ useEffect 用于事件响应
function BadEventEffect() {
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (query) {
      analytics.track('search', { query });  // 应该在事件处理器中
    }
  }, [query]);
}

// ✅ 在事件处理器中执行副作用
function GoodEvent() {
  const [query, setQuery] = useState('');
  const handleSearch = (q: string) => {
    setQuery(q);
    analytics.track('search', { query: q });
  };
}
```

---

## useMemo / useCallback

```tsx
// ❌ 过度优化 — 常量不需要 useMemo
function OverOptimized() {
  const config = useMemo(() => ({ timeout: 5000 }), []);  // 无意义
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);  // 如果不传给 memo 组件，无意义
}

// ✅ 只在需要时优化
function ProperlyOptimized() {
  const config = { timeout: 5000 };  // 简单对象直接定义
  const handleClick = () => console.log('clicked');
}

// ❌ useCallback 依赖总是变化
function BadCallback({ data }) {
  // data 每次渲染都是新对象，useCallback 无效
  const process = useCallback(() => {
    return data.map(transform);
  }, [data]);
}

// ✅ useMemo + useCallback 配合 React.memo 使用
const MemoizedChild = React.memo(function Child({ onClick, items }) {
  return <div onClick={onClick}>{items.length}</div>;
});

function Parent({ rawItems }) {
  const items = useMemo(() => processItems(rawItems), [rawItems]);
  const handleClick = useCallback(() => {
    console.log(items.length);
  }, [items]);
  return <MemoizedChild onClick={handleClick} items={items} />;
}
```

---

## 组件设计

```tsx
// ❌ 在组件内定义组件 — 每次渲染都创建新组件
function BadParent() {
  function ChildComponent() {  // 每次渲染都是新函数！
    return <div>child</div>;
  }
  return <ChildComponent />;
}

// ✅ 组件定义在外部
function ChildComponent() {
  return <div>child</div>;
}
function GoodParent() {
  return <ChildComponent />;
}

// ❌ Props 总是新对象引用
function BadProps() {
  return (
    <MemoizedComponent
      style={{ color: 'red' }}  // 每次渲染新对象
      onClick={() => {}}         // 每次渲染新函数
    />
  );
}

// ✅ 稳定的引用
const style = { color: 'red' };
function GoodProps() {
  const handleClick = useCallback(() => {}, []);
  return <MemoizedComponent style={style} onClick={handleClick} />;
}
```

---

## Error Boundaries & Suspense

```tsx
// ❌ 没有错误边界
function BadApp() {
  return (
    <Suspense fallback={<Loading />}>
      <DataComponent />  {/* 错误会导致整个应用崩溃 */}
    </Suspense>
  );
}

// ✅ Error Boundary 包裹 Suspense
function GoodApp() {
  return (
    <ErrorBoundary fallback={<ErrorUI />}>
      <Suspense fallback={<Loading />}>
        <DataComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## Server Components (RSC)

```tsx
// ❌ 在 Server Component 中使用客户端特性
// app/page.tsx (Server Component by default)
function BadServerComponent() {
  const [count, setCount] = useState(0);  // Error! No hooks in RSC
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// ✅ 交互逻辑提取到 Client Component
// app/counter.tsx
'use client';
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// app/page.tsx (Server Component)
async function GoodServerComponent() {
  const data = await fetchData();  // 可以直接 await
  return (
    <div>
      <h1>{data.title}</h1>
      <Counter />  {/* 客户端组件 */}
    </div>
  );
}

// ❌ 'use client' 放置不当 — 整个树都变成客户端
// layout.tsx
'use client';  // 这会让所有子组件都成为客户端组件
export default function Layout({ children }) { ... }

// ✅ 只在需要交互的组件使用 'use client'
// 将客户端逻辑隔离到叶子组件
```

---

## React 19 Actions & Forms

### useActionState

```tsx
// ❌ 传统方式：多个状态变量
function OldForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(null);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);
    try {
      const result = await submitForm(formData);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsPending(false);
    }
  };
}

// ✅ React 19: useActionState 统一管理
import { useActionState } from 'react';

function NewForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData: FormData) => {
      try {
        const result = await submitForm(formData);
        return { success: true, data: result };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    { success: false, data: null, error: null }
  );

  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

### useOptimistic

```tsx
// ❌ 等待服务器响应再更新 UI
function SlowLike({ postId, likes }) {
  const [likeCount, setLikeCount] = useState(likes);
  const [isPending, setIsPending] = useState(false);

  const handleLike = async () => {
    setIsPending(true);
    const newCount = await likePost(postId);  // 等待...
    setLikeCount(newCount);
    setIsPending(false);
  };
}

// ✅ useOptimistic 即时反馈，失败自动回滚
import { useOptimistic } from 'react';

function FastLike({ postId, likes }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (currentLikes, increment: number) => currentLikes + increment
  );

  const handleLike = async () => {
    addOptimisticLike(1);  // 立即更新 UI
    try {
      await likePost(postId);  // 后台同步
    } catch {
      // React 自动回滚到 likes 原值
    }
  };

  return <button onClick={handleLike}>{optimisticLikes} likes</button>;
}
```

---

## Suspense & Streaming SSR

```tsx
// ❌ 传统加载状态管理
function OldComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData().then(setData).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner />;
  return <DataView data={data} />;
}

// ✅ Suspense 声明式加载状态
function NewComponent() {
  return (
    <Suspense fallback={<Spinner />}>
      <DataView />  {/* 内部使用 use() 或支持 Suspense 的数据获取 */}
    </Suspense>
  );
}

// ✅ 多个独立 Suspense 边界
function GoodLayout() {
  return (
    <>
      <Header />  {/* 立即显示 */}
      <div className="flex">
        <Suspense fallback={<ContentSkeleton />}>
          <MainContent />  {/* 独立加载 */}
        </Suspense>
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />      {/* 独立加载 */}
        </Suspense>
      </div>
    </>
  );
}
```

---

## TanStack Query v5

### queryOptions (v5 新增)

```tsx
// ❌ 重复定义 queryKey 和 queryFn
function Component1() {
  const { data } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
  });
}

function prefetchUser(queryClient, userId) {
  queryClient.prefetchQuery({
    queryKey: ['users', userId],  // 重复！
    queryFn: () => fetchUser(userId),  // 重复！
  });
}

// ✅ queryOptions 统一定义，类型安全
import { queryOptions } from '@tanstack/react-query';

const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
  });

function Component1({ userId }) {
  const { data } = useQuery(userQueryOptions(userId));
}

function prefetchUser(queryClient, userId) {
  queryClient.prefetchQuery(userQueryOptions(userId));
}
```

### useSuspenseQuery 限制

```tsx
// ❌ useSuspenseQuery 不支持 enabled
function BadSuspenseQuery({ userId }) {
  const { data } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,  // useSuspenseQuery 不支持 enabled！
  });
}

// ✅ 组件组合实现条件渲染
function GoodSuspenseQuery({ userId }) {
  const { data } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  return <UserProfile user={data} />;
}

function Parent({ userId }) {
  if (!userId) return <NoUserSelected />;
  return (
    <Suspense fallback={<UserSkeleton />}>
      <GoodSuspenseQuery userId={userId} />
    </Suspense>
  );
}
```

### v5 状态字段变化

```tsx
// v5: isPending 表示没有数据，isLoading = isPending && isFetching
const { data, isPending, isFetching, isLoading } = useQuery({...});

// isPending: 缓存中没有数据（首次加载）
// isFetching: 正在请求中（包括后台刷新）
// isLoading: isPending && isFetching（首次加载中）

// ✅ 明确意图
if (isPending) return <Spinner />;  // 没有数据时显示加载
```

---

## Review Checklists

### Hooks 规则
- [ ] Hooks 在组件/自定义 Hook 顶层调用
- [ ] 没有条件/循环中调用 Hooks
- [ ] useEffect 依赖数组完整
- [ ] useEffect 有清理函数（订阅/定时器/请求）
- [ ] 没有用 useEffect 计算派生状态

### 性能优化（适度原则）
- [ ] useMemo/useCallback 只用于真正需要的场景
- [ ] React.memo 配合稳定的 props 引用
- [ ] 没有在组件内定义子组件
- [ ] 没有在 JSX 中创建新对象/函数（除非传给非 memo 组件）

### 组件设计
- [ ] 组件职责单一，不超过 200 行
- [ ] 逻辑与展示分离（Custom Hooks）
- [ ] Props 接口清晰，使用 TypeScript
- [ ] 避免 Props Drilling（考虑 Context 或组合）

### Server Components (RSC)
- [ ] 'use client' 只用于需要交互的组件
- [ ] Server Component 不使用 Hooks/事件处理
- [ ] 客户端组件尽量放在叶子节点

### React 19 Forms
- [ ] 使用 useActionState 替代多个 useState
- [ ] useFormStatus 在 form 子组件中调用
- [ ] useOptimistic 不用于关键业务（支付等）

### TanStack Query
- [ ] queryKey 包含所有影响数据的参数
- [ ] 设置合理的 staleTime（不是默认 0）
- [ ] useSuspenseQuery 不使用 enabled
- [ ] Mutation 成功后 invalidate 相关查询
