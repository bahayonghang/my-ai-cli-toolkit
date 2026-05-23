# Deepening Guide

## Dependency categories

When assessing a candidate for deepening, classify its dependencies before proposing an interface.

### 1. In-process

Pure computation, in-memory state, and no I/O.

- Usually the easiest category to deepen.
- Merge the orchestration and hide the internal helper structure behind one boundary.
- Test the deepened module directly.

Examples: a pricing calculator that only reads inputs and returns a number; a tokenizer; an in-memory event aggregator with no persistence; a graph traversal helper.

### 2. Local-substitutable

Dependencies that have realistic local stand-ins, such as an in-memory filesystem or a local database replacement.

- Deepen only if the substitute is good enough to exercise the real behaviors.
- Prefer boundary tests that run against the substitute instead of unit tests that mock every leaf call.

Examples: filesystem access (production uses real disk, tests use `pyfakefs` or an in-memory FS); SQLite (production on disk, tests with `:memory:`); Redis-like caches with `miniredis` / `fakeredis`; an in-process Kafka substitute for local tests.

### 3. Remote but owned

Your own services or transports across a network boundary.

- Keep the logic in one conceptual module.
- Put the transport behind a port so the interface expresses the domain, not the wire protocol.
- Use a production adapter for the real transport and a local adapter for tests.

Recommendation shape:
"Define a shared port, implement the production transport separately, and test the deep module through an in-memory adapter."

Examples: a wrapper around your team's internal gRPC service; a client SDK that talks to a REST API your company owns; a producer for an internally hosted Kafka cluster; the cache layer in front of your own service. The transport crosses a network boundary, but you control both ends of the contract.

### 4. True external

Third-party services you do not control.

- Treat the third party as a boundary dependency.
- Inject a port for the external behavior and use a mock or fake in tests.
- Keep the external API details out of the main domain interface whenever possible.

Examples: Stripe, Twilio, or OpenAI APIs; AWS S3 or GCP Cloud Storage; third-party OAuth providers such as Google or GitHub; a partner's webhook endpoint. You only see the published surface and cannot influence breaking changes.

## Candidate evaluation

Every candidate list should include these fields in addition to the dependency category and test impact.

### Expected leverage

Estimate how much architectural value the deepening buys.

Good signals:
- Fewer files needed to understand one concept
- Less orchestration duplicated across callers
- More behavior testable through one public boundary
- Easier onboarding for future maintainers and agents

### Migration cost / risk

Estimate how hard the change is to adopt.

Common sources of risk:
- Many existing callers
- Shared types that leak across layers
- Hidden behavior differences between call sites
- Tight coupling to transports or external systems

### Confidence

State how confident you are in the recommendation.

Use `High`, `Medium`, or `Low` and explain why. Confidence should reflect the quality of evidence, not optimism.

Calibration anchors:

- **High** — direct call-chain tracing across all known sites, friction reproduced first-hand, and at least one existing test or bug report already pointing at the seam.
- **Medium** — friction pattern is clear but call sites are not fully enumerated, or a key assumption (third-party behavior, hidden caller semantics, performance shape) is still unverified. Often: "a similar refactor worked elsewhere, not yet validated here."
- **Low** — single-point observation, no first-hand reproduction, or the recommendation rests mainly on "in theory this should be cleaner."

Good evidence to point at when claiming High:
- Direct call-chain tracing
- Repeated friction while exploring the same concept
- Existing tests that expose the seam
- Clear ownership of one domain concept

## Boundary-test strategy

Core principle: replace, do not layer.

- Write new tests at the deepened module boundary.
- Assert on observable outcomes through the public interface.
- Delete shallow tests only after the new boundary tests cover the behavior they protected.
- Avoid tests that pin internal call order or temporary implementation details.
- Prefer tests that survive refactors because they describe behavior, not structure.

## RFC template

Use this template for the local Markdown draft and for any later GitHub issue.

```md
## Problem

- Which modules or concepts are shallow and tightly coupled
- What integration risk exists in the seams between them
- Why this area is hard to navigate, change, or test

## Candidate summary

- Dependency category
- Expected leverage
- Migration cost / risk
- Confidence

## Proposed interface

- Interface signature
- Usage example
- What complexity the interface hides internally

## Dependency strategy

- In-process, local-substitutable, remote but owned, or true external
- How the module depends on that boundary in production
- How the same behavior is exercised in tests

## Testing strategy

- New boundary tests to write
- Existing shallow tests that become redundant
- Local stand-ins, adapters, or mocks required

## Migration notes

- What the deepened module should own
- What should remain outside the module
- How existing callers should migrate
- Open questions or follow-up risks
```
