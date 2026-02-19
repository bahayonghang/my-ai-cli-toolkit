import { Bot, FileCode2, FileText, Package } from "lucide-react";
import type { ResourceType } from "@/types";

interface ResourceTypeIconProps {
  type: ResourceType;
  className?: string;
}

export function ResourceTypeIcon({ type, className }: ResourceTypeIconProps) {
  switch (type) {
    case "skill":
      return <Package className={className} aria-hidden="true" />;
    case "command":
      return <FileCode2 className={className} aria-hidden="true" />;
    case "agent":
      return <Bot className={className} aria-hidden="true" />;
    default:
      return <FileText className={className} aria-hidden="true" />;
  }
}

