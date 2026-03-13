import { startTransition, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Returns a navigate function that wraps route transitions in
 * `startTransition` so they don't block urgent UI updates.
 */
export function useNavigateDeferred() {
  const navigate = useNavigate();
  return useCallback(
    (to: string) => startTransition(() => navigate(to)),
    [navigate]
  );
}
