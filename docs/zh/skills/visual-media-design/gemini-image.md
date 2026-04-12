# gemini-image

使用 Gemini API 生成图像，支持文生图和图生图。

## 使用场景

- 创建图片和艺术作品
- 生成插图
- 图像风格迁移
- 多图合成

## 模式

### 文生图
从文字描述生成图像。

```
提示词："一只可爱的橙色猫"
```

### 图生图
转换或参考现有图像。

```
提示词："https://example.com/image.jpg 画类似风格"
```

### 多图参考
合并多张图像。

```
提示词："https://a.jpg https://b.jpg 合并这两张"
```

## 设置

1. 在 `config/secrets.md` 中配置 API 密钥
2. 本地图像需要先上传（参见提示）

## API 调用

```bash
curl -s -X POST "https://api.apicore.ai/v1/images/generations" \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "model_name",
    "prompt": "prompt_text",
    "size": "aspect_ratio",
    "n": 1
  }'
```

## 提示

### 中文文字
参见 `tips/chinese-text.md` 了解如何在提示词中处理中文。

### 图像上传
参见 `tips/image-upload.md` 了解如何上传本地图像。

## 输出

从 API 响应的 `data[0].url` 返回图像 URL。
