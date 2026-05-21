import { ensureGitRepository } from "./git.mjs";

export function resolveWorkspaceRoot(cwd) {
  try {
    return ensureGitRepository(cwd);
  } catch {
    if (!process.env.NODE_TEST_CONTEXT) {
      process.stderr.write(`Warning: ${cwd} is not inside a git repository. Job state may not persist correctly across sessions.\n`);
    }
    return cwd;
  }
}
