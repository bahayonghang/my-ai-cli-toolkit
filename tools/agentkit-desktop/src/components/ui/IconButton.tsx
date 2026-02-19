import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";

type IconButtonVariant = "ghost" | "soft" | "solid";
type IconButtonSize = "sm" | "md";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  ariaLabel: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
};

const variantClasses: Record<IconButtonVariant, string> = {
  ghost:
    "text-[color:var(--ak-text-muted)] hover:text-[color:var(--ak-text-primary)] hover:bg-white/10 border border-transparent",
  soft:
    "text-[color:var(--ak-text-secondary)] bg-white/5 hover:bg-white/10 border border-white/10",
  solid: "text-white bg-primary-500 hover:bg-primary-600 border border-primary-400/30",
};

export function IconButton({
  ariaLabel,
  icon,
  className,
  variant = "ghost",
  size = "md",
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-label={ariaLabel}
      className={cn(
        "ak-focus-ring inline-flex items-center justify-center rounded-lg transition-colors",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {icon}
    </button>
  );
}

