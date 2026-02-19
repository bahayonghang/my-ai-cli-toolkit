/**
 * Error Utilities - User-friendly error messages and recovery options
 */

import { useToastStore } from "@/stores/toastStore";

export interface UserFriendlyError {
  title: string;
  message: string;
  suggestion?: string;
  recoverable: boolean;
  retryAction?: () => void;
}

/**
 * Convert technical errors to user-friendly messages
 */
export function toUserFriendlyError(
  error: unknown,
  context?: string
): UserFriendlyError {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("ECONNREFUSED")
  ) {
    return {
      title: "Connection Error",
      message: "Unable to connect to the server.",
      suggestion: "Please check your internet connection and try again.",
      recoverable: true,
    };
  }

  // npm/pip/git errors - check these BEFORE file not found since they may contain ENOENT
  if (errorMessage.includes("npm")) {
    return {
      title: "npm Error",
      message: "Failed to execute npm command.",
      suggestion: "Make sure npm is installed and in your PATH.",
      recoverable: true,
    };
  }

  if (errorMessage.includes("pip")) {
    return {
      title: "pip Error",
      message: "Failed to execute pip command.",
      suggestion: "Make sure Python and pip are installed and in your PATH.",
      recoverable: true,
    };
  }

  if (errorMessage.includes("git")) {
    return {
      title: "Git Error",
      message: "Failed to execute git command.",
      suggestion: "Make sure git is installed and in your PATH.",
      recoverable: true,
    };
  }

  // Permission errors
  if (
    errorMessage.includes("permission") ||
    errorMessage.includes("EACCES") ||
    errorMessage.includes("access denied")
  ) {
    return {
      title: "Permission Denied",
      message: "You don't have permission to perform this action.",
      suggestion: "Try running the application as administrator.",
      recoverable: false,
    };
  }

  // File not found
  if (
    errorMessage.includes("ENOENT") ||
    errorMessage.includes("not found") ||
    errorMessage.includes("does not exist")
  ) {
    return {
      title: "File Not Found",
      message: "The requested file or directory could not be found.",
      suggestion: "Make sure the path is correct and the file exists.",
      recoverable: false,
    };
  }

  // Symlink errors
  if (
    errorMessage.includes("symlink") ||
    errorMessage.includes("junction") ||
    errorMessage.includes("link")
  ) {
    return {
      title: "Link Creation Failed",
      message: "Unable to create symbolic link.",
      suggestion:
        "On Windows, try running as administrator or enable Developer Mode.",
      recoverable: true,
    };
  }

  // Database errors
  if (
    errorMessage.includes("database") ||
    errorMessage.includes("sqlite") ||
    errorMessage.includes("SQL")
  ) {
    return {
      title: "Database Error",
      message: "A database error occurred.",
      suggestion: "Try restarting the application. If the problem persists, reset the database.",
      recoverable: true,
    };
  }

  // Default error
  return {
    title: context ? `Error in ${context}` : "An Error Occurred",
    message: errorMessage || "An unexpected error occurred.",
    suggestion: "Please try again. If the problem persists, restart the application.",
    recoverable: true,
  };
}

/**
 * Error message component props
 */
export interface ErrorMessageProps {
  error: UserFriendlyError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Format error for logging
 */
export function formatErrorForLog(error: unknown, context?: string): string {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  return [
    `[${timestamp}]`,
    context ? `Context: ${context}` : null,
    `Error: ${errorMessage}`,
    stack ? `Stack: ${stack}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Convert an error to a user-friendly message and display it as a toast.
 * Safe to call outside React components (uses getState).
 *
 * @param error - The raw error (Error object, string, or unknown)
 * @param context - Optional context label (e.g. "installing skill")
 * @returns The UserFriendlyError for further use if needed
 */
export function showErrorToast(error: unknown, context?: string): UserFriendlyError {
  const friendly = toUserFriendlyError(error, context);
  const detail = friendly.suggestion
    ? `${friendly.message} ${friendly.suggestion}`
    : friendly.message;
  useToastStore.getState().error(friendly.title, detail);
  return friendly;
}
