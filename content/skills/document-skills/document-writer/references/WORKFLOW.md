# 文档生成工作流

## 步骤 1: 理解代码
1. 阅读现有文档
2. 查看目录结构、入口文件
3. 追踪主要流程，记录疑问

## 步骤 2: 确定结构
1. 列出需覆盖的主题
2. 按重要性排序并创建大纲

## 步骤 3: 撰写与验证
1. 从最重要的部分开始写
2. 验证代码示例、API 签名
3. 检查链接有效性、没有敏感信息泄露

## 示例 (JSDoc)
用户要求追加 JSDoc：
```typescript
/**
 * Fetches orders for a specific user.
 * 
 * @param userId - Unique identifier
 * @param options - Configuration (limit, status, sortBy)
 * @returns Promise resolving to Order[]
 */
```
