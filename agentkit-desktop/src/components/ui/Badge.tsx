import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "text-slate-300 border-white/15 bg-white/5",
  success: "text-emerald-300 border-emerald-400/35 bg-emerald-500/15",
  warning: "text-amber-300 border-amber-400/35 bg-amber-500/15",
  danger: "text-red-300 border-red-400/35 bg-red-500/15",
  info: "text-sky-300 border-sky-400/35 bg-sky-500/15",
};

export function Badge({
  variant = "neutral",
  className,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={cn("ak-badge px-2.5 py-0.5", variantClasses[variant], className)}
    >
      {icon}
      {children}
    </span>
  );
}

