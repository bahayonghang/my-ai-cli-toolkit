import { useState, useEffect, useCallback } from "react";
import { getLegacyDirs } from "@/api/client";

export function useLegacyDirs() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    getLegacyDirs()
      .then((dirs) => setCount(dirs.length))
      .catch(() => setCount(0));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { legacyCount: count, refreshLegacyCount: refresh };
}
