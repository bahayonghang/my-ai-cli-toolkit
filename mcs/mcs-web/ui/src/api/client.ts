import type {
  ApiResponse,
  ApiError,
  PlatformDisplay,
  PlatformConfig,
  ItemDto,
  SkillCatalogDto,
  ExternalSkillCatalogDto,
  ExternalInstallBatchItemDto,
  ExternalInstallJobStartDto,
  ExternalInstallConfig,
  ItemDetailDto,
  DiffDto,
  CategoryDto,
  DashboardDto,
  BatchResultDto,
  PromptDiffDto,
  ItemType,
  InstallStatus,
  InstallTarget,
  ResolvedInstallTarget,
  PickedFolderDto,
  LegacyDirDto,
  CleanupResultDto,
} from "@/types";

const BASE = "/api";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    const error = new Error(
      body?.error?.message ?? `HTTP ${res.status}: ${res.statusText}`
    ) as Error & { code?: string; details?: unknown; status?: number };
    error.code = body?.error?.code;
    error.details = body?.error?.details;
    error.status = res.status;
    throw error;
  }
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

async function postJson<T>(
  url: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  return fetchJson<T>(url, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

async function putJson<T>(url: string, body: unknown): Promise<T> {
  return fetchJson<T>(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function applyInstallTargetQuery(query: URLSearchParams, installTarget?: InstallTarget) {
  if (!installTarget) {
    return;
  }
  query.set("target_scope", installTarget.scope);
  if (installTarget.project_path && installTarget.project_path.trim()) {
    query.set("project_path", installTarget.project_path);
  }
}

function withInstallTargetBody<T extends Record<string, unknown>>(
  body: T,
  installTarget?: InstallTarget
): T | (T & { install_target: InstallTarget }) {
  if (!installTarget) {
    return body;
  }
  return { ...body, install_target: installTarget };
}

// ── Platforms ──────────────────────────────────────────────────────

export async function getPlatforms(signal?: AbortSignal): Promise<PlatformDisplay[]> {
  return fetchJson(`${BASE}/platforms`, { signal });
}

export async function refreshContent(): Promise<{ success: boolean }> {
  return postJson(`${BASE}/refresh`, {});
}

export async function getPlatform(id: string): Promise<PlatformConfig> {
  return fetchJson(`${BASE}/platforms/${id}`);
}

export async function getCategories(
  platformId: string,
  installTarget?: InstallTarget,
  itemType?: ItemType,
  signal?: AbortSignal
): Promise<CategoryDto[]> {
  const query = new URLSearchParams();
  applyInstallTargetQuery(query, installTarget);
  if (itemType) query.set("item_type", itemType);
  const qs = query.toString();
  return fetchJson(`${BASE}/platforms/${platformId}/categories${qs ? `?${qs}` : ""}`, {
    signal,
  });
}

export async function resolveInstallTarget(
  platformId: string,
  installTarget: InstallTarget,
  signal?: AbortSignal
): Promise<ResolvedInstallTarget> {
  return postJson(
    `${BASE}/platforms/${platformId}/install-target/resolve`,
    installTarget,
    { signal }
  );
}

// ── Dashboard ─────────────────────────────────────────────────────

export async function getDashboard(signal?: AbortSignal): Promise<DashboardDto> {
  return fetchJson(`${BASE}/dashboard`, { signal });
}

export async function getSkillCatalog(): Promise<SkillCatalogDto[]> {
  return fetchJson(`${BASE}/skills/catalog`);
}

export async function getExternalSkillCatalog(
  signal?: AbortSignal
): Promise<ExternalSkillCatalogDto[]> {
  return fetchJson(`${BASE}/external-skills/catalog`, { signal });
}

// ── Skills ─────────────────────────────────────────────────────────

export async function getSkills(
  platformId: string,
  params?: {
    search?: string;
    category?: string;
    status?: InstallStatus;
    installTarget?: InstallTarget;
  },
  signal?: AbortSignal
): Promise<ItemDto[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.status) query.set("status", params.status);
  applyInstallTargetQuery(query, params?.installTarget);
  const qs = query.toString();
  return fetchJson(`${BASE}/platforms/${platformId}/skills${qs ? `?${qs}` : ""}`, {
    signal,
  });
}

export async function getSkillDetail(
  platformId: string,
  name: string
): Promise<ItemDetailDto> {
  return fetchJson(`${BASE}/platforms/${platformId}/skills/${name}`);
}

export async function getSkillDiff(
  platformId: string,
  name: string
): Promise<DiffDto> {
  return fetchJson(`${BASE}/platforms/${platformId}/skills/${name}/diff`);
}

export async function installSkills(
  platformId: string,
  names: string[],
  linkMode: "auto" | "symlink" | "copy" = "auto",
  installTarget?: InstallTarget
): Promise<BatchResultDto> {
  return postJson(
    `${BASE}/platforms/${platformId}/skills/install`,
    withInstallTargetBody({ names, link_mode: linkMode }, installTarget)
  );
}

export async function uninstallSkills(
  platformId: string,
  names: string[],
  installTarget?: InstallTarget
): Promise<BatchResultDto> {
  return postJson(
    `${BASE}/platforms/${platformId}/skills/uninstall`,
    withInstallTargetBody({ names }, installTarget)
  );
}

// ── Commands ──────────────────────────────────────────────────────

export async function getCommands(
  platformId: string,
  params?: {
    search?: string;
    category?: string;
    status?: InstallStatus;
    installTarget?: InstallTarget;
  },
  signal?: AbortSignal
): Promise<ItemDto[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.status) query.set("status", params.status);
  applyInstallTargetQuery(query, params?.installTarget);
  const qs = query.toString();
  return fetchJson(
    `${BASE}/platforms/${platformId}/commands${qs ? `?${qs}` : ""}`,
    { signal }
  );
}

export async function getCommandDiff(
  platformId: string,
  name: string
): Promise<DiffDto> {
  return fetchJson(`${BASE}/platforms/${platformId}/commands/${name}/diff`);
}

export async function installCommands(
  platformId: string,
  names: string[],
  installTarget?: InstallTarget
): Promise<BatchResultDto> {
  return postJson(
    `${BASE}/platforms/${platformId}/commands/install`,
    withInstallTargetBody({ names }, installTarget)
  );
}

export async function uninstallCommands(
  platformId: string,
  names: string[],
  installTarget?: InstallTarget
): Promise<BatchResultDto> {
  return postJson(
    `${BASE}/platforms/${platformId}/commands/uninstall`,
    withInstallTargetBody({ names }, installTarget)
  );
}

// ── Prompt ─────────────────────────────────────────────────────────

export async function getPromptDiff(
  platformId: string
): Promise<PromptDiffDto> {
  return fetchJson(`${BASE}/platforms/${platformId}/prompt/diff`);
}

export async function updatePrompt(
  platformId: string
): Promise<{ success: boolean; item_name: string; message: string }> {
  return postJson(`${BASE}/platforms/${platformId}/prompt/update`, {});
}

// ── Multi-Sync ────────────────────────────────────────────────────

export async function multiSync(body: {
  platform_names: string[];
  items: string[];
  item_type: "skill" | "command";
}): Promise<BatchResultDto> {
  return postJson(`${BASE}/sync`, body);
}

// ── Skill Content Edit ────────────────────────────────────────────

export async function updateSkillContent(
  platformId: string,
  name: string,
  content: string
): Promise<{ success: boolean }> {
  return putJson(`${BASE}/platforms/${platformId}/skills/${name}/content`, {
    content,
  });
}

// ── External Skill Install ────────────────────────────────────────

export async function externalInstallSkill(
  platformId: string,
  skillName: string,
  method: "vercel" | "playbooks",
  installTarget?: InstallTarget,
  config?: ExternalInstallConfig
): Promise<{ success: boolean; output: string }> {
  return postJson(
    `${BASE}/platforms/${platformId}/skills/external-install`,
    withInstallTargetBody(
      {
        skill_name: skillName,
        method,
        ...(config ? { config } : {}),
      },
      installTarget
    )
  );
}

export async function startExternalInstallJob(
  platformId: string,
  items: ExternalInstallBatchItemDto[],
  installTarget?: InstallTarget,
  config?: ExternalInstallConfig
): Promise<ExternalInstallJobStartDto> {
  return postJson(
    `${BASE}/platforms/${platformId}/skills/external-install/jobs`,
    withInstallTargetBody(
      {
        items,
        ...(config ? { config } : {}),
      },
      installTarget
    )
  );
}

// ── System ─────────────────────────────────────────────────────────

export async function pickFolder(): Promise<PickedFolderDto> {
  return fetchJson(`${BASE}/system/pick-folder`);
}

export async function getLegacyDirs(signal?: AbortSignal): Promise<LegacyDirDto[]> {
  return fetchJson(`${BASE}/system/legacy-dirs`, { signal });
}

export async function cleanupLegacyDirs(
  paths: string[]
): Promise<CleanupResultDto> {
  return postJson(`${BASE}/system/legacy-dirs/cleanup`, { paths });
}
