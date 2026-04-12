# Rust Code Review Guide

> Rust 代码审查指南，覆盖所有权、借用检查、错误处理、生命周期、并发安全等核心主题。

## 目录

- [所有权与借用](#所有权与借用)
- [错误处理](#错误处理)
- [生命周期](#生命周期)
- [并发安全](#并发安全)
- [性能优化](#性能优化)
- [Review Checklist](#review-checklist)

---

## 所有权与借用

### 所有权规则

```rust
// ❌ 使用已移动的值
fn bad_ownership() {
    let s = String::from("hello");
    let s2 = s;  // s 的所有权移动到 s2
    println!("{}", s);  // Error: s 已失效
}

// ✅ 使用 clone 显式复制
fn good_clone() {
    let s = String::from("hello");
    let s2 = s.clone();  // 显式深拷贝
    println!("{} {}", s, s2);  // 两者都可用
}

// ✅ 使用引用避免移动
fn good_borrow() {
    let s = String::from("hello");
    let len = calculate_length(&s);  // 借用 s
    println!("{} length: {}", s, len);  // s 仍可用
}

fn calculate_length(s: &str) -> usize {
    s.len()
}
```

### 可变借用

```rust
// ❌ 同时存在可变和不可变借用
fn bad_borrow() {
    let mut s = String::from("hello");
    let r1 = &s;
    let r2 = &mut s;  // Error: 已有不可变借用
    println!("{} {}", r1, r2);
}

// ✅ 借用作用域不重叠
fn good_borrow() {
    let mut s = String::from("hello");
    {
        let r1 = &s;
        println!("{}", r1);
    }  // r1 作用域结束
    let r2 = &mut s;  // ✅ 可以可变借用
    r2.push_str(" world");
}
```

---

## 错误处理

### Result 类型

```rust
use std::fs::File;
use std::io::{self, Read};

// ❌ 使用 unwrap 可能 panic
fn bad_read() -> String {
    let mut file = File::open("data.txt").unwrap();  // 可能 panic
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    contents
}

// ✅ 传播错误
fn good_read() -> Result<String, io::Error> {
    let mut file = File::open("data.txt")?;  // ? 传播错误
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

// ✅ 提供上下文错误
use std::io;

fn read_with_context() -> Result<String, Box<dyn std::error::Error>> {
    let contents = std::fs::read_to_string("data.txt")
        .map_err(|e| format!("Failed to read data.txt: {}", e))?;
    Ok(contents)
}
```

### Option 类型

```rust
// ❌ 直接 unwrap Option
fn bad_option(items: &[i32]) -> i32 {
    items.first().unwrap() * 2  // 可能 panic
}

// ✅ 使用模式匹配
fn good_option(items: &[i32]) -> Option<i32> {
    items.first().map(|x| x * 2)
}

// ✅ 提供默认值
fn with_default(items: &[i32]) -> i32 {
    items.first().copied().unwrap_or(0) * 2
}

// ✅ 使用 if let
fn process_option(opt: Option<String>) {
    if let Some(value) = opt {
        println!("Value: {}", value);
    } else {
        println!("No value");
    }
}
```

---

## 生命周期

### 显式生命周期标注

```rust
// ❌ 缺少生命周期标注
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}

// ✅ 显式生命周期标注
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

// ✅ 结构体中的生命周期
struct Extractor<'a> {
    pattern: &'a str,  // 引用需要生命周期
}

impl<'a> Extractor<'a> {
    fn new(pattern: &'a str) -> Self {
        Self { pattern }
    }
    
    fn extract(&self, text: &'a str) -> Option<&'a str> {
        text.find(self.pattern)
            .map(|i| &text[i..i + self.pattern.len()])
    }
}
```

### 静态生命周期

```rust
// ✅ 字符串字面量是 'static
const GREETING: &str = "Hello";  // &'static str

// ✅ 谨慎使用 'static
fn get_static_str() -> &'static str {
    "This is a static string"
}
```

---

## 并发安全

### Send 和 Sync

```rust
use std::sync::{Arc, Mutex};
use std::thread;

// ✅ Arc 用于跨线程共享所有权
fn shared_ownership() {
    let data = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    
    for _ in 0..10 {
        let data_clone = Arc::clone(&data);
        let handle = thread::spawn(move || {
            let mut num = data_clone.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("Result: {}", *data.lock().unwrap());
}
```

### 通道通信

```rust
use std::sync::mpsc;
use std::thread;

// ✅ 使用通道传递消息
fn channel_communication() {
    let (tx, rx) = mpsc::channel();
    
    thread::spawn(move || {
        let vals = vec!["hi", "from", "the", "thread"];
        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(std::time::Duration::from_secs(1));
        }
    });
    
    for received in rx {
        println!("Got: {}", received);
    }
}
```

---

## 性能优化

### 避免不必要的克隆

```rust
// ❌ 不必要的 String 克隆
fn bad_process(items: &[String]) -> Vec<String> {
    items.iter()
        .map(|s| s.clone())  // 克隆每个字符串
        .collect()
}

// ✅ 使用引用
fn good_process(items: &[String]) -> Vec<&str> {
    items.iter()
        .map(|s| s.as_str())  // 只借用
        .collect()
}
```

### 使用迭代器

```rust
// ❌ 使用索引循环
fn sum_squares_bad(nums: &[i32]) -> i32 {
    let mut sum = 0;
    for i in 0..nums.len() {
        sum += nums[i] * nums[i];
    }
    sum
}

// ✅ 使用迭代器方法
fn sum_squares_good(nums: &[i32]) -> i32 {
    nums.iter()
        .map(|x| x * x)
        .sum()
}
```

### 内存布局

```rust
// ✅ 使用 Box 处理大类型
struct LargeStruct {
    data: [u8; 1024 * 1024],  // 1MB
}

struct Container {
    // 使用 Box 避免栈溢出
    large: Box<LargeStruct>,
}

// ✅ 使用 Vec 而非 LinkedList（缓存友好）
use std::collections::VecDeque;

fn efficient_queue() {
    let mut queue = VecDeque::new();
    queue.push_back(1);
    queue.push_front(2);
}
```

---

## Review Checklist

### 所有权与借用
- [ ] 避免不必要的 clone
- [ ] 正确使用引用避免所有权转移
- [ ] 可变借用和不可变借用不重叠

### 错误处理
- [ ] 避免使用 unwrap/expect（除非测试）
- [ ] 使用 ? 传播错误
- [ ] 为错误提供上下文信息

### 生命周期
- [ ] 结构体包含引用时有生命周期参数
- [ ] 函数返回引用时有生命周期标注
- [ ] 理解 'static 的适用场景

### 并发安全
- [ ] 跨线程共享数据使用 Arc + Mutex/RwLock
- [ ] 优先使用消息传递（channel）而非共享状态
- [ ] 理解 Send 和 Sync trait

### 性能
- [ ] 使用迭代器方法替代手动循环
- [ ] 避免不必要的内存分配
- [ ] 选择合适的集合类型
