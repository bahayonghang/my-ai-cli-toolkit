export interface NpxJobItemState {
  id: string;
  label: string;
  status: "pending" | "running" | "success" | "error";
  output: string;
  error: string | null;
  durationMs: number | null;
}

export interface InterruptedJobState {
  items: NpxJobItemState[];
  completed: number;
  total: number;
  successCount: number;
  failureCount: number;
  percent: number;
}

export function finalizeInterruptedJob(
  items: NpxJobItemState[],
  message: string
): InterruptedJobState {
  const nextItems = items.map((item) =>
    item.status === "success"
      ? item
      : {
          ...item,
          status: "error" as const,
          error: item.error ?? message,
        }
  );
  const total = nextItems.length;
  const successCount = nextItems.filter((item) => item.status === "success").length;
  const failureCount = total - successCount;
  const completed = total;

  return {
    items: nextItems,
    completed,
    total,
    successCount,
    failureCount,
    percent: total === 0 ? 0 : 100,
  };
}
