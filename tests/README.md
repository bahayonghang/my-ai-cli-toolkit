# 测试目录结构

此目录包含项目的测试文件，按测试类型组织如下：

## 目录结构

- `unit/` - 单元测试，测试单个函数和类的方法
- `integration/` - 集成测试，测试多个组件间的交互
- `e2e/` - 端到端测试，测试完整的用户工作流程
- `properties/` - 属性测试，使用 Hypothesis 库进行基于属性的测试
- `manual/` - 手动测试脚本，提供给开发者的交互式测试

## 测试类型说明

### Unit Tests (`unit/`)
- 测试单个函数和类的方法
- 验证特定功能的正确性
- 快速执行，易于调试

### Integration Tests (`integration/`)
- 测试多个组件间的交互
- 验证组件集成后的功能
- 涵盖跨模块的业务逻辑

### End-to-End Tests (`e2e/`)
- 测试完整的用户工作流程
- 模拟真实用户的操作场景
- 验证端到端的功能完整性

### Properties Tests (`properties/`)
- 使用 Hypothesis 库进行基于属性的测试
- 自动生成测试用例以覆盖边界情况
- 验证程序属性和不变量

### Manual Tests (`manual/`)
- 提供给开发者的交互式测试脚本
- 用于手动验证复杂功能
- 便于调试和演示

## 运行测试

要运行所有测试，请使用以下命令：

```bash
uv run pytest
```

要运行特定类型的测试，请使用以下命令之一：

```bash
# 运行单元测试
uv run pytest tests/unit/

# 运行集成测试
uv run pytest tests/integration/

# 运行端到端测试
uv run pytest tests/e2e/

# 运行属性测试
uv run pytest tests/properties/

# 运行手动测试（如果有的话）
python tests/manual/<test_file>.py
```