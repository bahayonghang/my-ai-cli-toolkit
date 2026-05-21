# Python Code Review Guide

> Python 代码审查指南，覆盖类型注解、async/await 模式、异常处理、性能优化等核心主题。

## 目录

- [类型注解](#类型注解)
- [异步处理](#异步处理)
- [异常处理](#异常处理)
- [性能优化](#性能优化)
- [代码风格](#代码风格)
- [Review Checklist](#review-checklist)

---

## 类型注解

### 基础类型注解

```python
# ❌ 无类型注解

def process_data(data):
    return data.value

# ✅ 使用类型注解
from typing import Optional, Union

def process_data(data: dict) -> Optional[str]:
    return data.get("value")

# ✅ Python 3.10+ 使用 | 替代 Union
def get_value(data: dict) -> str | None:
    return data.get("value")
```

### 泛型类型

```python
from typing import TypeVar, Generic, List

T = TypeVar('T')

# ✅ 泛型函数
def get_first(items: list[T]) -> T | None:
    return items[0] if items else None

# ✅ 泛型类
class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T | None:
        return self._items.pop() if self._items else None
```

### dataclass 使用

```python
from dataclasses import dataclass
from typing import Optional

# ❌ 传统类定义
class User:
    def __init__(self, name: str, age: int, email: Optional[str] = None):
        self.name = name
        self.age = age
        self.email = email
    
    def __repr__(self):
        return f"User(name={self.name}, age={self.age}, email={self.email})"

# ✅ 使用 dataclass
@dataclass
class User:
    name: str
    age: int
    email: str | None = None
```

---

## 异步处理

### async/await 基础

```python
import asyncio
from typing import AsyncIterator

# ✅ 异步函数定义
async def fetch_data(url: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

# ✅ 并发执行
async def fetch_multiple(urls: list[str]) -> list[dict]:
    tasks = [fetch_data(url) for url in urls]
    return await asyncio.gather(*tasks)

# ❌ 在异步函数中使用同步阻塞操作
async def bad_fetch():
    import requests  # 阻塞！
    return requests.get("https://api.example.com")

# ✅ 使用异步 HTTP 客户端
async def good_fetch():
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.example.com") as resp:
            return await resp.json()
```

### 异步迭代器

```python
# ✅ 异步生成器
async def fetch_pages(urls: list[str]) -> AsyncIterator[dict]:
    for url in urls:
        yield await fetch_data(url)

# ✅ 异步上下文管理器
class DatabaseConnection:
    async def __aenter__(self) -> "DatabaseConnection":
        self.conn = await create_connection()
        return self
    
    async def __aexit__(self, *args) -> None:
        await self.conn.close()
```

---

## 异常处理

### 异常处理最佳实践

```python
# ❌ 捕获所有异常

def bad_function():
    try:
        result = risky_operation()
    except Exception:  # 太宽泛！
        pass

# ✅ 捕获具体异常

def good_function():
    try:
        result = risky_operation()
    except ValueError as e:
        logger.warning(f"Invalid value: {e}")
        raise
    except ConnectionError as e:
        logger.error(f"Connection failed: {e}")
        return None

# ✅ 使用 finally 清理资源
def process_file(path: str) -> str:
    f = None
    try:
        f = open(path, 'r')
        return f.read()
    except FileNotFoundError:
        return ""
    finally:
        if f:
            f.close()

# ✅ 使用上下文管理器（更推荐）
def process_file_better(path: str) -> str:
    try:
        with open(path, 'r') as f:
            return f.read()
    except FileNotFoundError:
        return ""
```

### 自定义异常

```python
# ✅ 定义领域异常
class BusinessError(Exception):
    """业务逻辑错误基类"""
    pass

class ValidationError(BusinessError):
    """数据验证错误"""
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")

class NotFoundError(BusinessError):
    """资源不存在"""
    def __init__(self, resource: str, id: str):
        self.resource = resource
        self.id = id
        super().__init__(f"{resource} with id {id} not found")
```

---

## 性能优化

### 列表推导式

```python
# ❌ 使用 for 循环创建列表
squares = []
for x in range(1000):
    squares.append(x ** 2)

# ✅ 使用列表推导式
squares = [x ** 2 for x in range(1000)]

# ✅ 使用生成器表达式处理大数据
squares_gen = (x ** 2 for x in range(1000000))  # 惰性求值
```

### 字典操作

```python
from collections import defaultdict, Counter

# ✅ 使用 defaultdict
word_count = defaultdict(int)
for word in words:
    word_count[word] += 1

# ✅ 使用 Counter
from collections import Counter
word_count = Counter(words)

# ✅ 字典 get 方法
count = word_count.get("hello", 0)  # 默认值 0
```

### 字符串拼接

```python
# ❌ 使用 + 拼接字符串（O(n²)）
result = ""
for item in items:
    result += str(item) + ", "

# ✅ 使用 join 方法（O(n)）
result = ", ".join(str(item) for item in items)

# ✅ 使用 f-string（Python 3.6+）
name = "Alice"
age = 30
message = f"Hello, {name}! You are {age} years old."
```

---

## 代码风格

### PEP 8 规范

```python
# ✅ 命名规范
class MyClass:          # 类名：大驼峰
    CONSTANT = 42       # 常量：全大写
    
    def method_name(self):   # 方法/函数：小写下划线
        local_variable = 1   # 变量：小写下划线
        
def public_function():       # 公共函数
    pass

def _private_function():     # 私有函数（单下划线）
    pass

def __mangled_function():    # 名称改写（双下划线）
    pass
```

### 文档字符串

```python
# ✅ Google 风格文档字符串
def fetch_user(user_id: str) -> dict:
    """获取用户信息。
    
    Args:
        user_id: 用户唯一标识符。
        
    Returns:
        包含用户信息的字典。
        
    Raises:
        ValueError: 当 user_id 为空时。
        NotFoundError: 当用户不存在时。
    """
    if not user_id:
        raise ValueError("user_id cannot be empty")
    # ...
```

---

## Review Checklist

### 类型安全
- [ ] 函数参数和返回值有类型注解
- [ ] 使用 dataclass 替代传统类定义
- [ ] 避免使用 Any 类型

### 异步
- [ ] 异步函数使用 async/await
- [ ] 避免在异步代码中使用阻塞操作
- [ ] 使用 asyncio.gather 并发执行

### 异常处理
- [ ] 捕获具体异常而非 Exception
- [ ] 使用 finally 或上下文管理器清理资源
- [ ] 定义清晰的自定义异常层次

### 性能
- [ ] 使用列表推导式替代简单循环
- [ ] 使用生成器处理大数据
- [ ] 使用 join 方法拼接字符串

### 代码风格
- [ ] 遵循 PEP 8 命名规范
- [ ] 添加清晰的文档字符串
- [ ] 函数职责单一
