# C/C++ Code Review Guide

> C/C++ 代码审查指南，覆盖内存安全、生命周期、RAII、并发安全等核心主题。

## 目录

- [C 代码审查](#c-代码审查)
- [C++ 代码审查](#c-代码审查-1)
- [Review Checklist](#review-checklist)

---

# C 代码审查

## 指针和缓冲区安全

### 始终携带缓冲区大小

```c
// ❌ Bad: ignores destination size
bool copy_name(char *dst, size_t dst_size, const char *src) {
    strcpy(dst, src);
    return true;
}

// ✅ Good: validate size and terminate
bool copy_name(char *dst, size_t dst_size, const char *src) {
    size_t len = strlen(src);
    if (len + 1 > dst_size) {
        return false;
    }
    memcpy(dst, src, len + 1);
    return true;
}
```

### 避免危险 API

```c
// ❌ Bad: unbounded write
sprintf(buf, "%s", input);
gets(buf);  // Never use gets!

// ✅ Good: bounded write
snprintf(buf, buf_size, "%s", input);
fgets(buf, buf_size, stdin);
```

### 使用正确的拷贝原语

```c
// ❌ Bad: memcpy with overlapping regions
memcpy(dst, src, len);

// ✅ Good: memmove handles overlap
memmove(dst, src, len);
```

---

## 所有权和资源管理

### 一次分配，一次释放

```c
// ✅ Good: cleanup label avoids leaks
int load_file(const char *path) {
    int rc = -1;
    FILE *f = NULL;
    char *buf = NULL;

    f = fopen(path, "rb");
    if (!f) {
        goto cleanup;
    }
    buf = malloc(4096);
    if (!buf) {
        goto cleanup;
    }

    if (fread(buf, 1, 4096, f) == 0) {
        goto cleanup;
    }

    rc = 0;

cleanup:
    free(buf);
    if (f) {
        fclose(f);
    }
    return rc;
}
```

---

## 未定义行为陷阱

### 空指针解引用

```c
// ❌ Bad: no null check
void process(struct Data *d) {
    printf("%d\n", d->value);  // 可能崩溃
}

// ✅ Good: check before dereference
void process(struct Data *d) {
    if (!d) return;
    printf("%d\n", d->value);
}
```

### 有符号整数溢出

```c
// ❌ Bad: signed overflow is UB
int a = INT_MAX;
int b = a + 1;  // Undefined behavior!

// ✅ Good: check before operation
if (a > INT_MAX - 1) {
    // handle overflow
}
```

---

# C++ 代码审查

## 所有权和 RAII

### 优先使用 RAII 和智能指针

```cpp
// ❌ Bad: manual new/delete with early returns
Foo* make_foo() {
    Foo* foo = new Foo();
    if (!foo->Init()) {
        delete foo;
        return nullptr;
    }
    return foo;
}

// ✅ Good: RAII with unique_ptr
std::unique_ptr<Foo> make_foo() {
    auto foo = std::make_unique<Foo>();
    if (!foo->Init()) {
        return {};
    }
    return foo;
}

// ✅ Good: wrap C resources
using FilePtr = std::unique_ptr<FILE, decltype(&fclose)>;

FilePtr open_file(const char* path) {
    return FilePtr(fopen(path, "rb"), &fclose);
}
```

---

## 生命周期和引用

### 避免悬空引用和视图

```cpp
// ❌ Bad: returning string_view to a temporary
std::string_view bad_view() {
    std::string s = make_name();
    return s; // dangling
}

// ✅ Good: return owning string
std::string good_name() {
    return make_name();
}

// ✅ Good: view tied to caller-owned data
std::string_view good_view(const std::string& s) {
    return s;
}
```

### Lambda 捕获

```cpp
// ❌ Bad: capture reference that escapes
std::function<void()> make_task() {
    int value = 42;
    return [&]() { use(value); }; // dangling
}

// ✅ Good: capture by value
std::function<void()> make_task() {
    int value = 42;
    return [value]() { use(value); };
}
```

---

## 拷贝和移动语义

### 遵循 Rule of Zero/Five

```cpp
// ✅ Rule of Zero: use compiler-generated special members
class Good {
    std::string name_;
    std::vector<int> data_;
    // 编译器生成的拷贝/移动/析构都正确
};

// ✅ Rule of Five: if you define one, define all five
class Resource {
public:
    Resource();                          // default constructor
    ~Resource();                         // destructor
    Resource(const Resource& other);     // copy constructor
    Resource& operator=(const Resource& other);  // copy assignment
    Resource(Resource&& other) noexcept;         // move constructor
    Resource& operator=(Resource&& other) noexcept; // move assignment

private:
    Handle handle_;
};
```

---

## const 正确性和 API 设计

### 使用 const 表达语义

```cpp
// ✅ Good: const-correct API
class Data {
public:
    // 不修改对象 -> const 成员函数
    int size() const { return size_; }
    const std::string& name() const { return name_; }
    
    // 修改对象 -> 非 const
    void set_name(const std::string& name) { name_ = name; }
    
private:
    int size_;
    std::string name_;
};

// ✅ Good: const reference parameters
void process(const Data& data);  // 不修改，不拷贝
void modify(Data& data);         // 会修改
void take_ownership(Data data);  // 会拷贝/移动
```

---

## 错误处理和异常安全

### 异常安全保证

```cpp
// ✅ Basic guarantee: 异常时对象保持有效状态
class Stack {
public:
    void push(const T& value) {
        // 先分配新内存（可能抛出）
        auto new_data = std::make_unique<T[]>(capacity_ * 2);
        // 再修改状态
        data_ = std::move(new_data);
        size_++;
    }
};

// ✅ Strong guarantee: 异常时状态不变（常用 copy-and-swap）
void Stack::push(const T& value) {
    Stack temp(*this);  // 拷贝
    temp.push_impl(value);  // 修改拷贝
    swap(temp);  // 无异常操作
}
```

---

## 并发

### 线程安全

```cpp
// ❌ Bad: data race
class Counter {
    int count_ = 0;
public:
    void increment() { ++count_; }  // 非线程安全
};

// ✅ Good: mutex protection
class ThreadSafeCounter {
    mutable std::mutex mutex_;
    int count_ = 0;
public:
    void increment() {
        std::lock_guard<std::mutex> lock(mutex_);
        ++count_;
    }
    
    int get() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return count_;
    }
};
```

### 避免死锁

```cpp
// ❌ Bad: potential deadlock
void transfer(Account& from, Account& to, int amount) {
    std::lock_guard<std::mutex> lock1(from.mutex());
    std::lock_guard<std::mutex> lock2(to.mutex());  // 如果另一线程反向锁定，死锁！
    // ...
}

// ✅ Good: std::lock for multiple mutexes
void transfer(Account& from, Account& to, int amount) {
    std::lock(from.mutex(), to.mutex());
    std::lock_guard<std::mutex> lock1(from.mutex(), std::adopt_lock);
    std::lock_guard<std::mutex> lock2(to.mutex(), std::adopt_lock);
    // ...
}
```

---

## 性能和内存

### 避免不必要的拷贝

```cpp
// ❌ Bad: unnecessary copies
std::vector<std::string> process(std::vector<std::string> items) {
    std::vector<std::string> result;
    for (auto item : items) {  // 拷贝每个元素
        result.push_back(item);  // 再次拷贝
    }
    return result;
}

// ✅ Good: use references and move
std::vector<std::string> process(const std::vector<std::string>& items) {
    std::vector<std::string> result;
    result.reserve(items.size());
    for (const auto& item : items) {  // 引用，不拷贝
        result.push_back(item);
    }
    return result;
}
```

### 使用 emplace

```cpp
// ❌ Bad: construct + copy/move
std::vector<std::pair<int, std::string>> vec;
vec.push_back(std::make_pair(1, "hello"));

// ✅ Good: construct in place
vec.emplace_back(1, "hello");
```

---

## Review Checklist

### C 代码
- [ ] 缓冲区操作携带大小参数
- [ ] 避免使用危险 API（strcpy, gets, sprintf）
- [ ] 检查空指针
- [ ] 资源分配和释放配对
- [ ] 避免有符号整数溢出

### C++ 代码
- [ ] 优先使用 RAII 和智能指针
- [ ] 避免悬空引用和指针
- [ ] Lambda 捕获正确（值 vs 引用）
- [ ] 遵循 Rule of Zero/Five
- [ ] const 正确性

### 内存安全
- [ ] 无内存泄漏
- [ ] 无 use-after-free
- [ ] 无缓冲区溢出
- [ ] 智能指针使用恰当

### 并发
- [ ] 共享数据有同步保护
- [ ] 避免死锁
- [ ] 原子操作用于简单类型

### 性能
- [ ] 避免不必要的拷贝
- [ ] 使用 emplace 替代 push
- [ ] 预分配容器容量
- [ ] 移动语义正确使用
