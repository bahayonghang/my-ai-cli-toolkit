import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "ak-btn-primary",
  secondary: "ak-btn-secondary",
  ghost: "ak-btn-ghost",
  danger: "ak-btn-danger",
};

export function Button({
  className,
  variant = "secondary",
  size = "md",
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "ak-btn ak-focus-ring",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}

