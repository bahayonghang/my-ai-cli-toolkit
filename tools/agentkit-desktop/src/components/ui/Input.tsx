import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
}

export function Input({
  label,
  error,
  id,
  className,
  containerClassName,
  inputClassName,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[color:var(--ak-text-secondary)]"
        >
          {label}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        className={cn(
          "ak-input ak-focus-ring px-4 py-2.5 text-sm",
          error ? "ak-input-error" : "",
          className,
          inputClassName
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

