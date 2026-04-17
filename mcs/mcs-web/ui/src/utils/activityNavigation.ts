export function buildActivityRunPath(runId: string, platformId?: string | null) {
  const query = new URLSearchParams();
  query.set("run_id", runId);
  if (platformId) {
    query.set("platform_id", platformId);
  }
  return `/activity?${query.toString()}`;
}

export function buildActivityPlatformPath(
  platformId: string,
  params?: {
    surface?: "local" | "npx_skills";
    operation?: "install" | "uninstall" | "remove" | "check" | "update" | "update_packages";
    status?: "success" | "warning" | "error";
  },
) {
  const query = new URLSearchParams();
  query.set("platform_id", platformId);
  if (params?.surface) {
    query.set("surface", params.surface);
  }
  if (params?.operation) {
    query.set("operation", params.operation);
  }
  if (params?.status) {
    query.set("status", params.status);
  }
  return `/activity?${query.toString()}`;
}
