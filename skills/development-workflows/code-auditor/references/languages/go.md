# Go 代码审查指南

基于 Go 官方指南、Effective Go 和社区最佳实践的代码审查清单。

## 快速审查清单

### 必查项
- [ ] 错误是否正确处理（不忽略、有上下文）
- [ ] goroutine 是否有退出机制（避免泄漏）
- [ ] context 是否正确传递和取消
- [ ] 接收器类型选择是否合理（值/指针）
- [ ] 是否使用 `gofmt` 格式化代码

### 高频问题
- [ ] 循环变量捕获问题（Go < 1.22）
- [ ] nil 检查是否完整
- [ ] map 是否初始化后使用
- [ ] defer 在循环中的使用
- [ ] 变量遮蔽（shadowing）

---

## 1. 错误处理

### 1.1 永远不要忽略错误

```go
// ❌ 错误：忽略错误
result, _ := SomeFunction()

// ✅ 正确：处理错误
result, err := SomeFunction()
if err != nil {
    return fmt.Errorf("some function failed: %w", err)
}
```

### 1.2 错误包装与上下文

```go
// ❌ 错误：丢失上下文
if err != nil {
    return err
}

// ❌ 错误：使用 %v 丢失错误链
if err != nil {
    return fmt.Errorf("failed: %v", err)
}

// ✅ 正确：使用 %w 保留错误链
if err != nil {
    return fmt.Errorf("failed to process user %d: %w", userID, err)
}
```

### 1.3 使用 errors.Is 和 errors.As

```go
// ❌ 错误：直接比较（无法处理包装错误）
if err == sql.ErrNoRows {
    // ...
}

// ✅ 正确：使用 errors.Is（支持错误链）
if errors.Is(err, sql.ErrNoRows) {
    return nil, ErrNotFound
}

// ✅ 正确：使用 errors.As 提取特定类型
var pathErr *os.PathError
if errors.As(err, &pathErr) {
    log.Printf("path error: %s", pathErr.Path)
}
```

### 1.4 自定义错误类型

```go
// ✅ 推荐：定义 sentinel 错误
var (
    ErrNotFound     = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
)

// ✅ 推荐：带上下文的自定义错误
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation error on %s: %s", e.Field, e.Message)
}
```

### 1.5 错误处理只做一次

```go
// ❌ 错误：既记录又返回（重复处理）
if err != nil {
    log.Printf("error: %v", err)
    return err
}

// ✅ 正确：只返回，让调用者决定
if err != nil {
    return fmt.Errorf("operation failed: %w", err)
}

// ✅ 或者：只记录并处理（不返回）
if err != nil {
    log.Printf("non-critical error: %v", err)
    // 继续执行备用逻辑
}
```

---

## 2. 并发与 Goroutine

### 2.1 避免 Goroutine 泄漏

```go
// ❌ 错误：goroutine 永远无法退出
func bad() {
    ch := make(chan int)
    go func() {
        val := <-ch // 永远阻塞，无人发送
        fmt.Println(val)
    }()
    // 函数返回，goroutine 泄漏
}

// ✅ 正确：使用 context 或 done channel
func good(ctx context.Context) {
    ch := make(chan int)
    go func() {
        select {
        case val := <-ch:
            fmt.Println(val)
        case <-ctx.Done():
            return // 优雅退出
        }
    }()
}
```

### 2.2 Channel 使用规范

```go
// ❌ 错误：向 nil channel 发送（永久阻塞）
var ch chan int
ch <- 1 // 永久阻塞

// ❌ 错误：向已关闭的 channel 发送（panic）
close(ch)
ch <- 1 // panic!

// ✅ 正确：发送方关闭 channel
func producer(ch chan<- int) {
    defer close(ch) // 发送方负责关闭
    for i := 0; i < 10; i++ {
        ch <- i
    }
}

// ✅ 正确：接收方检测关闭
for val := range ch {
    process(val)
}
// 或者
val, ok := <-ch
if !ok {
    // channel 已关闭
}
```

### 2.3 使用 sync.WaitGroup

```go
// ❌ 错误：Add 在 goroutine 内部
var wg sync.WaitGroup
for i := 0; i < 10; i++ {
    go func() {
        wg.Add(1) // 竞态条件！
        defer wg.Done()
        work()
    }()
}
wg.Wait()

// ✅ 正确：Add 在 goroutine 启动前
var wg sync.WaitGroup
for i := 0; i < 10; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        work()
    }()
}
wg.Wait()
```

### 2.4 使用 errgroup 处理并发错误

```go
// ✅ 使用 golang.org/x/sync/errgroup
import "golang.org/x/sync/errgroup"

func processURLs(urls []string) error {
    g, ctx := errgroup.WithContext(context.Background())
    
    for _, url := range urls {
        url := url // 捕获循环变量
        g.Go(func() error {
            return fetchURL(ctx, url)
        })
    }
    
    return g.Wait() // 返回第一个错误
}
```

---

## 3. Context 使用

### 3.1 Context 传递

```go
// ❌ 错误：不传递 context
func fetchData() (*Data, error) {
    resp, err := http.Get("https://api.example.com/data")
    // ...
}

// ✅ 正确：context 作为第一个参数
func fetchData(ctx context.Context) (*Data, error) {
    req, err := http.NewRequestWithContext(ctx, "GET", "https://api.example.com/data", nil)
    if err != nil {
        return nil, err
    }
    resp, err := http.DefaultClient.Do(req)
    // ...
}
```

### 3.2 Context 取消传播

```go
// ✅ 使用 WithCancel
ctx, cancel := context.WithCancel(parentCtx)
defer cancel() // 确保取消函数被调用

// ✅ 使用 WithTimeout
ctx, cancel := context.WithTimeout(parentCtx, 5*time.Second)
defer cancel()

// ✅ 使用 WithDeadline
ctx, cancel := context.WithDeadline(parentCtx, time.Now().Add(1*time.Hour))
defer cancel()
```

---

## 4. 接口与结构体

### 4.1 接口设计

```go
// ❌ 错误：接口过大
type BigInterface interface {
    Read(p []byte) (n int, err error)
    Write(p []byte) (n int, err error)
    Close() error
    Seek(offset int64, whence int) (int64, error)
    // ... 更多方法
}

// ✅ 正确：小接口，组合使用
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type ReadWriter interface {
    Reader
    Writer
}
```

### 4.2 接收器类型选择

```go
// ✅ 值接收器：不改变状态，小结构体
func (p Point) Distance(other Point) float64 {
    return math.Sqrt(math.Pow(p.X-other.X, 2) + math.Pow(p.Y-other.Y, 2))
}

// ✅ 指针接收器：修改状态，大结构体，需要 nil 检查
type Buffer struct {
    data []byte
}

func (b *Buffer) Write(p []byte) (n int, err error) {
    if b == nil {
        return 0, errors.New("buffer is nil")
    }
    b.data = append(b.data, p...)
    return len(p), nil
}
```

---

## 5. 性能优化

### 5.1 字符串拼接

```go
// ❌ 低效：循环中使用 +
var s string
for i := 0; i < 1000; i++ {
    s += "x"  // 每次分配新内存
}

// ✅ 高效：使用 strings.Builder
var b strings.Builder
b.Grow(1000) // 预分配容量
for i := 0; i < 1000; i++ {
    b.WriteString("x")
}
s := b.String()
```

### 5.2 切片预分配

```go
// ❌ 多次内存分配
var results []int
for i := 0; i < 10000; i++ {
    results = append(results, i)  // 可能多次扩容
}

// ✅ 预分配容量
results := make([]int, 0, 10000)
for i := 0; i < 10000; i++ {
    results = append(results, i)
}
```

### 5.3 Map 预分配

```go
// ✅ 预分配 map 容量
m := make(map[string]int, 1000) // 预分配约 1000 个元素的空间
for i := 0; i < 1000; i++ {
    m[fmt.Sprintf("key%d", i)] = i
}
```

---

## 6. 代码风格

### 6.1 命名规范

```go
// ✅ 包名：小写，简短
package userrepo

// ✅ 导出标识符：大写开头
type UserService struct { }
func (s *UserService) GetUser(id int) (*User, error) { }

// ✅ 未导出标识符：小写开头
type userCache struct { }
func (c *userCache) get(key string) (*User, bool) { }

// ✅ 接口名：方法名 + er（或描述性名词）
type Reader interface { Read([]byte) (int, error) }
type Writer interface { Write([]byte) (int, error) }
type StringWriter interface { WriteString(string) (int, error) }
```

### 6.2 错误变量命名

```go
// ✅ 错误变量以 Err 开头
var ErrNotFound = errors.New("not found")
var ErrInvalidInput = errors.New("invalid input")

// ✅ 具体错误实例以 err 开头
if err := doSomething(); err != nil {
    return err
}
```

---

## 7. 测试

### 7.1 表格驱动测试

```go
// ✅ 表格驱动测试
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 1, 2, 3},
        {"negative", -1, -2, -3},
        {"zero", 0, 0, 0},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d, want %d", 
                    tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

### 7.2 使用 testify

```go
// ✅ 使用 testify 简化断言
import "github.com/stretchr/testify/assert"

func TestSomething(t *testing.T) {
    result, err := DoSomething()
    assert.NoError(t, err)
    assert.Equal(t, "expected", result)
    assert.NotNil(t, result)
}
```

---

## Review Checklist

### 错误处理
- [ ] 不忽略错误
- [ ] 使用 %w 包装错误
- [ ] 使用 errors.Is/errors.As
- [ ] 错误只处理一次

### 并发
- [ ] goroutine 有退出机制
- [ ] channel 正确关闭
- [ ] WaitGroup 正确使用
- [ ] 避免竞态条件

### Context
- [ ] 函数第一个参数是 context
- [ ] 及时调用 cancel
- [ ] 传递 context 而非存储

### 接口与结构体
- [ ] 接口小而专注
- [ ] 接收器类型选择合理
- [ ] 避免接口过度抽象

### 性能
- [ ] 字符串拼接用 strings.Builder
- [ ] 切片/map 预分配容量
- [ ] 避免不必要的内存分配

### 代码风格
- [ ] 使用 gofmt 格式化
- [ ] 命名符合 Go 惯例
- [ ] 包名简短有意义
