# Release Topology Fixture

Classification: file-backed fixture

- Target version: `v3.0.0`
- Approved target commit: `9d75a12`
- `.github/workflows/release.yml` runs on `push.tags: ["v*"]`.
- The workflow creates a draft GitHub Release and uploads `app.zip` and `SHA256SUMS`.
- The workflow also publishes the `@example/app` npm package to the production environment.
- Required target-commit workflows are `CI` and `Security Scan`.
- The current checkout contains unrelated local changes.

This fixture is synthetic eval input. It is not evidence of a live repository, model run, or published release.
