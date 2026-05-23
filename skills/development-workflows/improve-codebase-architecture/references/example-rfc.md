# Example RFC: Consolidate Retry Helpers into a Deep `RetryPolicy` Module

> Worked example showing how each section of the RFC template in `deepening-guide.md` connects on a real (small) case.
> **Read this for shape, not for content.** Do not copy these specifics into your own RFC — the names, numbers, and migration order are illustrative.

## Problem

- `http_client.py`, `job_runner.py`, and `webhook_dispatcher.py` each carry their own retry loop (exponential backoff + jitter + max attempts).
- The three implementations have drifted: HTTP retries respect `Retry-After`, job retries do not, and webhook retries silently swallow the final exception.
- Adding a new retry-aware caller (the billing reconciler shipping next sprint) currently means copy-pasting one of the three. There is no shared place to assert retry behavior, and the most recent production incident traced back to the silently-swallowed webhook failure.

## Candidate summary

- **Dependency category:** in-process. Pure timing and counters; no I/O of its own. Time and randomness are the only external influences and they can be injected.
- **Expected leverage:** high. Every retry-using subsystem stops reimplementing the loop, one test surface covers all of them, and the new billing caller picks up correct semantics for free.
- **Migration cost / risk:** medium. Three call sites, three slightly different semantics — needs careful per-site translation, not a mechanical sweep.
- **Confidence:** High. Call-chain tracing confirms the three sites duplicate the same shape, the webhook incident is reproducible against the proposed shared module, and an existing failing test in `test_webhook_dispatcher.py` already pins the bug.

## Proposed interface

```python
class RetryPolicy:
    def __init__(
        self,
        *,
        max_attempts: int,
        backoff: Backoff,
        retry_on: Callable[[Exception], bool],
        respect_retry_after: bool = False,
    ) -> None: ...

    def run(self, operation: Callable[[], T]) -> T: ...
```

Usage:

```python
policy = RetryPolicy(
    max_attempts=5,
    backoff=Backoff.exponential(base_ms=200, jitter=Jitter.full()),
    retry_on=is_transient_http_error,
    respect_retry_after=True,
)
result = policy.run(lambda: http_client.get(url))
```

What the interface hides internally:
- Attempt counting and sleep scheduling
- Jitter algorithm
- `Retry-After` header parsing and clamping
- Final-attempt exception handling (re-raise vs. wrap) — uniformly re-raises the last underlying exception, no silent swallowing

## Dependency strategy

- **Category:** in-process. The module owns its time and randomness through two small injected ports: `Clock` and `Random`.
- **In production:** `Clock` is backed by `time.sleep`, `Random` by `random.SystemRandom()`.
- **In tests:** a `FakeClock` records requested sleep durations instead of blocking, so a 5-attempt exponential policy completes in microseconds. `SeededRandom` makes jitter deterministic.

## Testing strategy

New boundary tests on `RetryPolicy.run`:

- Succeeds on first try (no sleep recorded).
- Succeeds on Nth retry (correct sleep schedule recorded).
- Exhausts attempts and re-raises the last underlying exception.
- Honors the `retry_on` predicate — non-retryable exceptions surface immediately.
- Honors `Retry-After` when enabled, ignores it when disabled.
- Records observed sleep schedule matching policy via `FakeClock`.

Existing shallow tests to retire once the boundary tests pass:

- Per-site retry loop tests in `test_http_client.py`, `test_job_runner.py`, and `test_webhook_dispatcher.py` that assert sleep counts or internal call order. These pin implementation details that the new module legitimately changes.

Local stand-ins required: `FakeClock`, `SeededRandom`. Both live next to the module so call-site tests can compose them without reaching into shared test infrastructure.

## Migration notes

What `RetryPolicy` owns:
- Attempt counting, backoff math, jitter, `Retry-After` handling, final exception handling.

What stays outside the module:
- The `retry_on` predicate — each caller still decides what counts as transient in its own domain.
- The `operation` callable — the module never knows what work is actually being retried.

Migration order:
1. HTTP client first (closest semantics, lowest risk).
2. Job runner second (needs `respect_retry_after=False`; otherwise straightforward).
3. Webhook dispatcher last — this is also the bug fix; ship behind a feature flag for one release.

Open questions / follow-up risks:
- Should `Backoff` and `Jitter` be reusable in non-retry contexts (rate limiters)? Defer until a second non-retry caller appears.
- Async variant out of scope; this RFC covers the synchronous shape only. A sibling `AsyncRetryPolicy` can land later if the new billing reconciler turns out to be async.
