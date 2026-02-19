/**
 * Shared resource utility functions
 */

import type { LucideIcon } from "lucide-react";
import { Bot, FileCode2, FileText, Package } from "lucide-react";
import type { ResourceType } from "@/types";

/**
 * Returns a resource icon component based on resource type.
 */
export function getTypeIcon(type: ResourceType): LucideIcon {
  switch (type) {
    case "skill":
      return Package;
    case "command":
      return FileCode2;
    case "agent":
      return Bot;
    default:
      return FileText;
  }
}
