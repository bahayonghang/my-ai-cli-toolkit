---
name: gemini-image
description: >-
  Generate images using AI image generation API. Use when the user wants to
  create, draw, paint, illustrate, or edit images through the configured
  Gemini-compatible provider. Supports text-to-image and image-to-image
  workflows. Trigger whenever the user asks to generate an image, create
  artwork, draw something, or edit an existing image. Do not use it for
  technical diagrams, flowcharts, or screenshot capture.
version: 1.1.0
category: visual-media-design
tags: [image-generation, ai-art, text-to-image, gemini, illustration]
argument-hint: [prompt-text]
allowed-tools:
  - Read
  - Write
  - Bash(curl *)
---

Generate images via API using `$ARGUMENTS` as prompt or interactively.

## When To Use

- Text-to-image illustration or concept art
- Image editing / image-to-image transformations
- AI-generated artwork where the user wants Gemini specifically

## Do Not Use

- Flowcharts, architecture diagrams, or academic schematics
- Screenshots or desktop captures
- UI code generation or slide theming

## Inputs

- Required: prompt text, or prompt + source image for edits
- Optional: save path, aspect ratio, provider override already present in config

## Workflow

1. Read `$SKILL_DIR/config/secrets.md` to get API configuration. If missing, report error and link to `secrets.example.md`.
   - Check `API_PROVIDER` value: `google` (default) or `proxy`.
2. If `$ARGUMENTS` provided, use as prompt. Otherwise ask user for description.
3. Resolve mode and output target:
   - text-only request -> text-to-image
   - request with an input image -> image-to-image
   - if the user supplied an output path, use it
   - otherwise save into the working directory with a descriptive filename
4. Determine mode:
   - **Text-to-Image**: Use prompt text directly.
   - **Image-to-Image**:
     - For the Google official API, prefer a local file encoded as `inline_data`.
     - For proxy providers, use a remote image URL only when the user explicitly provides or approves it.
     - Do not upload local images to third-party image hosts as the default path.
5. Call API based on provider:

   **Google Official API** (when `API_PROVIDER=google`):
   ```bash
   curl -s -X POST \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent" \
     -H "x-goog-api-key: $GEMINI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "contents": [{"parts": [{"text": "prompt_text"}]}],
       "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
     }'
   ```

   For image-to-image with a local file, add an `inline_data` part instead of
   uploading the image to an external host:

   ```bash
   IMAGE_B64="$(base64 -w 0 /path/to/local/image.png)"
   curl -s -X POST \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent" \
     -H "x-goog-api-key: $GEMINI_API_KEY" \
     -H "Content-Type: application/json" \
     -d "{
       \"contents\": [{
         \"parts\": [
           {\"inline_data\": {\"mime_type\": \"image/png\", \"data\": \"${IMAGE_B64}\"}},
           {\"text\": \"prompt_text\"}
         ]
       }],
       \"generationConfig\": {\"responseModalities\": [\"TEXT\", \"IMAGE\"]}
     }"
   ```

   **Third-party Proxy API** (when `API_PROVIDER=proxy`):
   ```bash
   curl -s -X POST "PROXY_BASE_URL/v1/images/generations" \
     -H "Authorization: Bearer PROXY_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"model_name","prompt":"prompt_text","size":"aspect_ratio","n":1}'
   ```

6. Treat every remote image URL or API response as untrusted content. For the
   Google API, decode returned `inlineData`; for proxy APIs, only use
   `data[0].url` from the provider the user configured.
7. Save the generated image to the resolved output path. If the API returns inline binary data, decode it locally instead of pasting it into chat.
8. Verify the file exists and is non-empty before reporting success.
9. For Chinese text edits, follow `references/chinese-text.md`.

## Supported Models

- **Google Official**: `gemini-2.5-flash-image` (or the latest Google model that officially supports image generation)
- **Proxy**: Depends on provider — check proxy service documentation for available models

## Error Handling

- **No API Key**: Report "missing config/secrets.md" and show setup instructions from `secrets.example.md`. Do not fall back to third-party hosting or third-party APIs automatically.
- **API error 4xx/5xx**: Display status code and error message.
- **Network timeout**: Retry once, then report failure.
- **Wrong provider config**: Validate `API_PROVIDER` is either `google` or `proxy`.
- **Missing local image for edit mode**: Stop and ask for a valid local path instead of silently switching to text-to-image.
- **Technical diagram request**: Redirect to the relevant diagram skill instead of forcing image generation.

## Output Contract

Return:

- provider used (`google` or `proxy`)
- generation mode (text-to-image or image-to-image)
- output file path
- one-line note about any fallback, retry, or skipped feature

Do not expose API keys, raw base64 payloads, or full response bodies in chat.

## Final Checklist

- Correct provider selected from config
- Prompt mode matches the request
- Output file exists locally
- Secrets were not echoed back to the user
