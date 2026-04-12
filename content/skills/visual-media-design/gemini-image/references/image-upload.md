# Image Input Guidance

Do not upload local images to third-party hosting services by default.

## Preferred path

- For the Google official API, use a local image file encoded as `inline_data`.
- For a proxy provider, use a remote image URL only when the user explicitly
  provides or approves that URL.

## Third-party hosting fallback

If the configured provider absolutely requires a public URL and the user
explicitly approves third-party hosting, warn about the exposure first and use a
temporary host rather than a permanent one. Keep the uploaded image scoped to
the current task and avoid reusing the URL elsewhere.
