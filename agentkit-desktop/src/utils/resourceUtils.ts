/**
 * Shared resource utility functions
 */

/**
 * Returns an emoji icon based on resource type.
 */
export function getTypeIcon(type: string): string {
  switch (type) {
    case "skill":
      return "📦";
    case "command":
      return "⚡";
    case "agent":
      return "🤖";
    default:
      return "📄";
  }
}
