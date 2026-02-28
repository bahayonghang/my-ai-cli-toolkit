import type {
  ApiResponse,
  ApiError,
  PlatformDisplay,
  PlatformConfig,
  ItemDto,
  ItemDetailDto,
  DiffDto,
  CategoryDto,
  DashboardDto,
  BatchResultDto,
  PromptDiffDto,
  InstallStatus,
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

async function postJson<T>(url: string, body: unknown): Promise<T> {
  return fetchJson<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

// ── Platforms ──────────────────────────────────────────────────────

export async function getPlatforms(): Promise<PlatformDisplay[]> {
  return fetchJson(`${BASE}/platforms`);
}

export async function getPlatform(id: string): Promise<PlatformConfig> {
  return fetchJson(`${BASE}/platforms/${id}`);
}

export async function getCategories(
  platformId: string
): Promise<CategoryDto[]> {
  return fetchJson(`${BASE}/platforms/${platformId}/categories`);
}

// ── Dashboard ─────────────────────────────────────────────────────

export async function getDashboard(): Promise<DashboardDto> {
  return fetchJson(`${BASE}/dashboard`);
}

// ── Skills ─────────────────────────────────────────────────────────

export async function getSkills(
  platformId: string,
  params?: { search?: string; category?: string; status?: InstallStatus }
): Promise<ItemDto[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return fetchJson(`${BASE}/platforms/${platformId}/skills${qs ? `?${qs}` : ""}`);
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
  names: string[]
): Promise<BatchResultDto> {
  return postJson(`${BASE}/platforms/${platformId}/skills/install`, { names });
}

export async function uninstallSkills(
  platformId: string,
  names: string[]
): Promise<BatchResultDto> {
  return postJson(`${BASE}/platforms/${platformId}/skills/uninstall`, { names });
}

// ── Commands ──────────────────────────────────────────────────────

export async function getCommands(
  platformId: string,
  params?: { search?: string; category?: string; status?: InstallStatus }
): Promise<ItemDto[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return fetchJson(
    `${BASE}/platforms/${platformId}/commands${qs ? `?${qs}` : ""}`
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
  names: string[]
): Promise<BatchResultDto> {
  return postJson(`${BASE}/platforms/${platformId}/commands/install`, { names });
}

export async function uninstallCommands(
  platformId: string,
  names: string[]
): Promise<BatchResultDto> {
  return postJson(`${BASE}/platforms/${platformId}/commands/uninstall`, {
    names,
  });
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
  method: "vercel" | "playbooks"
): Promise<{ success: boolean; output: string }> {
  return postJson(`${BASE}/platforms/${platformId}/skills/external-install`, {
    skill_name: skillName,
    method,
  });
}
