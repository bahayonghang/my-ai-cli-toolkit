---
name: gemini-image
description: >-
  Generate images using AI image generation API. Use when user wants to create,
  draw, paint, illustrate, or edit images. Supports text-to-image and
  image-to-image workflows. Trigger whenever the user asks to generate an image,
  create artwork, draw something, or edit an existing image.
version: 1.0.0
argument-hint: [prompt-text]
allowed-tools:
  - Read
  - Bash(curl *)
metadata:
  category: content-creation
  tags: [image-generation, ai-art, text-to-image, gemini, illustration]
---

Generate images via API using `$ARGUMENTS` as prompt or interactively.

## Steps

1. Read `$SKILL_DIR/config/secrets.md` to get API configuration. If missing, report error and link to `secrets.example.md`.
   - Check `API_PROVIDER` value: `google` (default) or `proxy`.
2. If `$ARGUMENTS` provided, use as prompt. Otherwise ask user for description.
3. Determine mode:
   - **Text-to-Image**: Use prompt text directly.
   - **Image-to-Image**: Upload local image first (see `references/image-upload.md`), prepend URL to prompt.
4. Call API based on provider:

   **Google Official API** (when `API_PROVIDER=google`):
   ```bash
   curl -s -X POST \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=GOOGLE_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "contents": [{"parts": [{"text": "prompt_text"}]}],
       "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
     }'
   ```

   **Third-party Proxy API** (when `API_PROVIDER=proxy`):
   ```bash
   curl -s -X POST "PROXY_BASE_URL/v1/images/generations" \
     -H "Authorization: Bearer PROXY_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"model_name","prompt":"prompt_text","size":"aspect_ratio","n":1}'
   ```

5. Extract image data from response. For Google API, decode base64 `inlineData`; for proxy API, extract `data[0].url`. Display image to user.
6. For Chinese text edits, follow `references/chinese-text.md`.

## Supported Models

- **Google Official**: `gemini-2.0-flash-exp` (or latest model supporting image generation)
- **Proxy**: Depends on provider — check proxy service documentation for available models

## Error Handling

- **No API Key**: Report "missing config/secrets.md" and show setup instructions from `secrets.example.md`.
- **API error 4xx/5xx**: Display status code and error message.
- **Network timeout**: Retry once, then report failure.
- **Wrong provider config**: Validate `API_PROVIDER` is either `google` or `proxy`.
