// Re-render every checked-in example from its JSON IR. Run after changing a
// renderer or the template, then commit the refreshed HTML so the golden test
// stays green.

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");

const TARGETS = [
  [
    "workflow",
    "agent-tool-call.workflow.json",
    "agent-tool-call.workflow.html",
  ],
  [
    "sequence",
    "cache-miss-request.sequence.json",
    "cache-miss-request.sequence.html",
  ],
  [
    "dataflow",
    "product-analytics.dataflow.json",
    "product-analytics.dataflow.html",
  ],
  ["lifecycle", "agent-run.lifecycle.json", "agent-run.lifecycle.html"],
  ["architecture", "web-app.architecture.json", "web-app.architecture.html"],
];

for (const [mode, input, output] of TARGETS) {
  execFileSync(
    "node",
    [
      path.join(skillRoot, `renderers/${mode}/render-${mode}.mjs`),
      path.join(skillRoot, "examples", input),
      path.join(skillRoot, "examples", output),
    ],
    { stdio: "inherit" },
  );
}
