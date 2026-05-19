# Renderer Modes and JSON IR

Renderer-backed Archify modes use compact JSON intermediate representations (IRs), validate them with JSON Schema, and generate standalone HTML through Node.js scripts.

## Setup

Before using any renderer mode in a fresh checkout or installed skill directory, install the bundled Node dependency once:

```bash
cd archify
npm ci
```

If `npm ci` is not available but network access is allowed, use `npm install`. If dependencies cannot be installed, do not use renderer-backed modes; fall back to architecture/manual template mode or explain the blocker.


Every JSON file is validated against its schema (`archify/schemas/*.schema.json`) before any layout work runs. Schema violations exit non-zero with a path-prefixed error message — for example `/cards/0/dot must be equal to one of the allowed values ["cyan","emerald","violet","amber","rose","orange","slate"]` or `/nodes/0/id must match pattern "^[a-zA-Z][a-zA-Z0-9_-]*$"`. Common things the schema catches before the renderer touches the file:

- Unknown node/participant/state `type`, unknown card `dot`
- IDs containing spaces or starting with a digit
- Extra/misspelled fields (`additionalProperties: false` is set on every object)
- Missing required fields (`label`, `meta.title`, etc.)
- `schema_version` not equal to `1`

If a render fails with a schema error, fix the JSON and re-run; do not edit the renderer.

## Workflow Mode

Workflow diagrams use a compact JSON IR:

```json
{
  "schema_version": 1,
  "diagram_type": "workflow",
  "meta": {
    "title": "Release Workflow",
    "subtitle": "PR to production deployment",
    "output": "release-workflow.html",
    "viewBox": [720, 780]
  },
  "lanes": [
    { "id": "dev", "label": "Developer" },
    { "id": "ci", "label": "CI" }
  ],
  "nodes": [],
  "edges": [],
  "cards": []
}
```

If you have filesystem/tool access, create a workflow JSON file and render it with:

```bash
node archify/renderers/workflow/render-workflow.mjs workflow.json workflow.html
```

The renderer:

- Places nodes by lane + column instead of raw SVG coordinates
- Routes edges through explicit anchors and orthogonal route presets
- Uses `c-lane` swimlanes plus the normal semantic component classes
- Adds a `c-mask` label background for routed labels
- Fails fast on schema violations, overlapping nodes, out-of-lane placement, and labeled short links — keep adjacent-step labels minimal in the JSON to avoid the short-link error

Use workflow labels sparingly. Adjacent steps should often be unlabeled; reserve labels for cross-lane transitions, approval decisions, async trace writes, and return paths.

## Sequence Mode

Sequence diagrams use a compact JSON IR:

```json
{
  "schema_version": 1,
  "diagram_type": "sequence",
  "meta": {
    "title": "Cache Miss Request Sequence",
    "subtitle": "Frontend request path with auth and cache fallback",
    "output": "cache-miss-request.html",
    "viewBox": [820, 760]
  },
  "participants": [
    { "id": "web", "type": "frontend", "label": "Web App", "sublabel": "React UI" },
    { "id": "api", "type": "backend", "label": "API", "sublabel": "request handler" }
  ],
  "messages": [],
  "activations": [],
  "cards": []
}
```

If you have filesystem/tool access, create a sequence JSON file and render it with:

```bash
node archify/renderers/sequence/render-sequence.mjs sequence.json sequence.html
```

The renderer:

- Places participants across the top and time downward
- Uses semantic message variants: `emphasis`, `security`, `return`, and `dashed`
- Uses activation bars to show ownership duration
- Uses light segment bands as story landmarks
- Fails fast on schema violations, overflowing participants, unknown message endpoints, and rows that are too tight

Use sequence diagrams when the important thing is order over time. Keep labels short; prefer "GET /path", "verify JWT", "cache miss", "emit trace", and "200 JSON" over prose sentences.

## Data-flow Mode

Data-flow diagrams use a compact JSON IR:

```json
{
  "schema_version": 1,
  "diagram_type": "dataflow",
  "meta": {
    "title": "Product Analytics Data Flow",
    "subtitle": "Events, consent, PII isolation, warehouse sync, and consumers",
    "output": "product-analytics.html",
    "viewBox": [900, 720]
  },
  "stages": [
    { "label": "Sources" },
    { "label": "Ingest" },
    { "label": "Process" },
    { "label": "Store" },
    { "label": "Consume" }
  ],
  "nodes": [],
  "flows": [],
  "cards": []
}
```

If you have filesystem/tool access, create a data-flow JSON file and render it with:

```bash
node archify/renderers/dataflow/render-dataflow.mjs dataflow.json dataflow.html
```

The renderer:

- Places nodes by lifecycle stage + row
- Uses vertical stage bands for source, ingest, process, store, and consume boundaries
- Uses flow labels to name data assets, plus optional `classification` for PII/governance context
- Uses semantic variants: `emphasis` for the primary data path, `security` for PII/policy/consent/restricted joins, and `dashed` for async or batch derivations
- Fails fast on schema violations, node overlap, stage overflow, unknown flow endpoints, missing labels, and unreadably short arrows

Use data-flow diagrams when the important thing is data lineage and governance. Keep labels asset-like: "clickstream", "identity map", "normalized facts", "feature vectors", "restricted join". Put sensitivity in `classification`: "PII touch", "encrypted PII", "approved only", "non-PII", "read-only".

## Lifecycle Mode

Lifecycle diagrams use a compact JSON IR:

```json
{
  "schema_version": 1,
  "diagram_type": "lifecycle",
  "meta": {
    "title": "Agent Run Lifecycle",
    "subtitle": "State machine for planning, execution, waits, retries, and terminal outcomes",
    "output": "agent-run.html",
    "viewBox": [980, 720]
  },
  "lanes": [
    { "id": "main", "label": "Main lifecycle" },
    { "id": "waiting", "label": "Wait states" },
    { "id": "exceptions", "label": "Exceptions + recovery" }
  ],
  "states": [],
  "transitions": [],
  "cards": []
}
```

If you have filesystem/tool access, create a lifecycle JSON file and render it with:

```bash
node archify/renderers/lifecycle/render-lifecycle.mjs lifecycle.json lifecycle.html
```

The renderer:

- Places states by lane + column
- Uses lanes to separate the happy path, wait states, and exception/recovery paths
- Uses semantic state types: `start`, `active`, `waiting`, `decision`, `success`, `failure`, and `neutral`
- Uses transition variants: `emphasis` for the primary lifecycle, `security` for failure/cancel/timeout/policy paths, and `dashed` for retry/resume paths
- Fails fast on schema violations, state overlap, out-of-lane placement, unknown lanes, unknown transition endpoints, and legends pushed outside the viewBox

Use lifecycle diagrams when the important thing is state, not step-by-step work. Keep transition labels event-like: "start", "plan ready", "needs approval", "retry", "timeout", "cancel". Put terminal states on the right or in the bottom lane so endings are visually unambiguous.
