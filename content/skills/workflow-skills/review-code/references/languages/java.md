# Java Code Review Guide

> Java 代码审查指南，覆盖集合使用、Stream API、异常处理、并发编程、Optional 等核心主题。

## 目录

- [集合使用](#集合使用)
- [Stream API](#stream-api)
- [异常处理](#异常处理)
- [Optional 使用](#optional-使用)
- [并发编程](#并发编程)
- [Review Checklist](#review-checklist)

---

## 集合使用

### 选择正确的集合类型

```java
// ❌ 使用 Vector（已过时，线程安全但性能差）
Vector<String> list = new Vector<>();

// ✅ 使用 ArrayList（非线程安全，性能更好）
List<String> list = new ArrayList<>();

// ❌ 使用 Hashtable（已过时）
Hashtable<String, String> map = new Hashtable<>();

// ✅ 使用 HashMap
Map<String, String> map = new HashMap<>();

// ✅ 需要排序时使用 TreeMap
Map<String, String> sortedMap = new TreeMap<>();

// ✅ 需要保持插入顺序时使用 LinkedHashMap
Map<String, String> orderedMap = new LinkedHashMap<>();
```

### 集合初始化

```java
// ❌ 先创建再逐个添加
List<String> list = new ArrayList<>();
list.add("a");
list.add("b");
list.add("c");

// ✅ 使用 Arrays.asList（固定大小）
List<String> list = Arrays.asList("a", "b", "c");

// ✅ Java 9+ 使用 List.of（不可变）
List<String> list = List.of("a", "b", "c");

// ✅ Java 9+ Map.of
Map<String, Integer> map = Map.of(
    "one", 1,
    "two", 2,
    "three", 3
);
```

### 泛型使用

```java
// ❌ 使用原始类型
List list = new ArrayList();
list.add("string");
String s = (String) list.get(0);  // 需要强制转换

// ✅ 使用泛型
List<String> list = new ArrayList<>();
list.add("string");
String s = list.get(0);  // 类型安全

// ✅ 泛型方法
public <T> T getFirst(List<T> list) {
    return list.isEmpty() ? null : list.get(0);
}

// ✅  bounded wildcards
public void processNumbers(List<? extends Number> numbers) {
    for (Number n : numbers) {
        System.out.println(n.doubleValue());
    }
}
```

---

## Stream API

### 基础使用

```java
// ❌ 传统循环
List<String> result = new ArrayList<>();
for (String s : list) {
    if (s.length() > 3) {
        result.add(s.toUpperCase());
    }
}

// ✅ 使用 Stream API
List<String> result = list.stream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// ✅ 并行流（大数据量时）
List<String> result = list.parallelStream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

### 收集器

```java
// ✅ 分组
Map<Integer, List<String>> grouped = list.stream()
    .collect(Collectors.groupingBy(String::length));

// ✅ 分区
Map<Boolean, List<Integer>> partitioned = numbers.stream()
    .collect(Collectors.partitioningBy(n -> n > 10));

// ✅  joining
String joined = list.stream()
    .collect(Collectors.joining(", ", "[", "]"));

// ✅ 统计
IntSummaryStatistics stats = numbers.stream()
    .collect(Collectors.summarizingInt(Integer::intValue));
```

### 避免常见陷阱

```java
// ❌ 在 stream 中修改外部变量
List<String> result = new ArrayList<>();
list.stream().forEach(result::add);  // 副作用！

// ✅ 使用 collect
List<String> result = list.stream()
    .collect(Collectors.toList());

// ❌ 过度使用 parallelStream（小数据量反而慢）
list.parallelStream().filter(...);  // 数据量小时性能差

// ✅ 只在大数据量时使用
if (list.size() > 10000) {
    list.parallelStream()...
}
```

---

## 异常处理

### 异常类型选择

```java
// ❌ 使用 RuntimeException 太宽泛
throw new RuntimeException("Invalid input");

// ✅ 使用具体异常类型
throw new IllegalArgumentException("Age must be positive: " + age);

// ✅ 自定义业务异常
public class InsufficientFundsException extends Exception {
    private final BigDecimal amount;
    private final BigDecimal balance;
    
    public InsufficientFundsException(BigDecimal amount, BigDecimal balance) {
        super(String.format("Insufficient funds: required %s, available %s", 
            amount, balance));
        this.amount = amount;
        this.balance = balance;
    }
}
```

### try-with-resources

```java
// ❌ 手动关闭资源
public void readFile(String path) throws IOException {
    BufferedReader reader = null;
    try {
        reader = new BufferedReader(new FileReader(path));
        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println(line);
        }
    } finally {
        if (reader != null) {
            reader.close();
        }
    }
}

// ✅ 使用 try-with-resources
public void readFile(String path) throws IOException {
    try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println(line);
        }
    }  // 自动关闭
}

// ✅ 多个资源
public void copyFile(String src, String dest) throws IOException {
    try (InputStream in = new FileInputStream(src);
         OutputStream out = new FileOutputStream(dest)) {
        in.transferTo(out);
    }
}
```

### 不要忽略异常

```java
// ❌ 空的 catch 块
try {
    process();
} catch (Exception e) {
    // 忽略异常！
}

// ✅ 至少记录异常
try {
    process();
} catch (Exception e) {
    logger.error("Failed to process", e);
    throw new ProcessingException("Process failed", e);
}
```

---

## Optional 使用

### 正确使用 Optional

```java
// ❌ 不要这样创建 Optional
Optional<String> opt = Optional.of(null);  // NullPointerException!

// ✅ 可能为 null 时用 ofNullable
Optional<String> opt = Optional.ofNullable(maybeNull);

// ❌ 不要用 Optional 作为方法参数
public void process(Optional<String> maybeValue) { ... }

// ✅ 方法重载替代 Optional 参数
public void process(String value) { ... }
public void process() { ... }

// ❌ 不要用 Optional 作为字段
private Optional<String> name;

// ✅ 字段直接用 null
private String name;
```

### Optional 操作

```java
// ✅ 提供默认值
String value = optional.orElse("default");

// ✅ 延迟计算默认值
String value = optional.orElseGet(() -> expensiveOperation());

// ✅ 抛出异常
String value = optional.orElseThrow(() -> 
    new NotFoundException("Value not found"));

// ✅ 链式操作
String result = optional
    .filter(s -> s.length() > 0)
    .map(String::toUpperCase)
    .orElse("EMPTY");

// ✅ ifPresent
optional.ifPresent(value -> System.out.println("Found: " + value));
```

---

## 并发编程

### 线程安全集合

```java
// ❌ 手动同步 ArrayList
List<String> list = new ArrayList<>();
synchronized(list) {
    list.add("item");
}

// ✅ 使用 CopyOnWriteArrayList（读多写少）
List<String> list = new CopyOnWriteArrayList<>();

// ✅ 使用 ConcurrentHashMap
Map<String, String> map = new ConcurrentHashMap<>();

// ✅ 使用 BlockingQueue
BlockingQueue<String> queue = new LinkedBlockingQueue<>();
```

### ExecutorService

```java
// ✅ 使用线程池
ExecutorService executor = Executors.newFixedThreadPool(4);

try {
    Future<Integer> future = executor.submit(() -> {
        return heavyComputation();
    });
    
    Integer result = future.get(5, TimeUnit.SECONDS);
} catch (Exception e) {
    logger.error("Task failed", e);
} finally {
    executor.shutdown();
    try {
        if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
            executor.shutdownNow();
        }
    } catch (InterruptedException e) {
        executor.shutdownNow();
    }
}
```

### CompletableFuture

```java
// ✅ 异步链式操作
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> fetchUser(userId))
    .thenApply(User::getName)
    .thenApply(String::toUpperCase)
    .exceptionally(ex -> {
        logger.error("Failed to get user name", ex);
        return "UNKNOWN";
    });

// ✅ 组合多个异步操作
CompletableFuture<String> combined = userFuture
    .thenCombine(ordersFuture, (user, orders) -> 
        user.getName() + " has " + orders.size() + " orders");
```

---

## Review Checklist

### 集合
- [ ] 选择正确的集合类型（List/Set/Map 实现）
- [ ] 使用泛型保证类型安全
- [ ] 合理使用不可变集合（List.of, Map.of）

### Stream API
- [ ] 避免在 stream 中产生副作用
- [ ] 只在大数据量时使用 parallelStream
- [ ] 选择合适的收集器

### 异常处理
- [ ] 使用具体异常类型
- [ ] 使用 try-with-resources 管理资源
- [ ] 不要忽略异常（至少记录）

### Optional
- [ ] 不要用 Optional 作为字段或方法参数
- [ ] 使用 orElseGet 延迟计算默认值
- [ ] 善用链式操作

### 并发
- [ ] 使用线程安全的集合类
- [ ] 正确使用 ExecutorService 和线程池
- [ ] 优先使用 CompletableFuture 进行异步编程
