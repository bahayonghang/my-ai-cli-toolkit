---
name: gemini-image
description: Generate images using AI via Gemini API. Use when user wants to create, draw, paint, or edit images. Supports text-to-image and image-to-image.
argument-hint: [prompt-text]
allowed-tools: Read, Bash(curl *)
metadata:
  category: content-creation
  tags: [image-generation, ai-art, text-to-image, gemini]
---

Generate images via API using `$ARGUMENTS` as prompt or interactively.

## Steps

1. Read `$SKILL_DIR/config/secrets.md` to get API_KEY. If missing, report error and link to `secrets.example.md`.
2. If `$ARGUMENTS` provided, use as prompt. Otherwise ask user for description.
3. Determine mode:
   - **Text-to-Image**: Use prompt text directly.
   - **Image-to-Image**: Upload local image first (see `references/image-upload.md`), prepend URL to prompt.
4. Call API:
   ```bash
   curl -s -X POST "https://api.apicore.ai/v1/images/generations" \
     -H "Authorization: Bearer API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"model_name","prompt":"prompt_text","size":"aspect_ratio","n":1}'
   ```
5. Extract `data[0].url` from response. Display image to user.
6. For Chinese text edits, follow `references/chinese-text.md`.

## Error Handling

- **No API Key**: Report "missing config/secrets.md" and show setup instructions.
- **API error 4xx/5xx**: Display status code and error message.
- **Network timeout**: Retry once, then report failure.
