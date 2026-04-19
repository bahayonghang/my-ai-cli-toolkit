import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import BoltIcon from "@mui/icons-material/Bolt";

import { NotificationSnackbar } from "@/components/common/NotificationSnackbar";
import PageLoadingState from "@/components/common/PageLoadingState";
import {
  AppShell,
  ListSurface,
  MetricStrip,
  MobileFilterButton,
  ResponsiveFilterRail,
  SectionHero,
} from "@/components/shell/AppShell";
import { PlatformIdentity } from "@/components/platform/PlatformVisuals";
import { useI18n } from "@/i18n";
import { useNavigateDeferred } from "@/hooks/useNavigateDeferred";
import { useActivityStore, type ActivityRunsFilters } from "@/stores/activityStore";
import { usePlatformStore } from "@/stores/platformStore";
import type {
  ActivityEventDto,
  ActivityOperation,
  ActivityRunDto,
  ActivityRunStatus,
  ActivitySurface,
  ItemType,
  PlatformDisplay,
} from "@/types";

function positiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatTimestamp(value: number) {
  return new Date(value).toLocaleString();
}

function formatRunSurface(value: ActivitySurface, t: ReturnType<typeof useI18n>["t"]) {
  return t(`activity.surface.${value}`);
}

function formatRunOperation(value: ActivityOperation, t: ReturnType<typeof useI18n>["t"]) {
  return t(`activity.operation.${value}`);
}

function formatRunStatus(value: ActivityRunStatus, t: ReturnType<typeof useI18n>["t"]) {
  return t(`activity.status.${value}`);
}

function chipColorForStatus(
  value: ActivityRunStatus,
): "success" | "warning" | "error" {
  if (value === "success") return "success";
  if (value === "warning") return "warning";
  return "error";
}

function updateSearchParams(
  current: URLSearchParams,
  updates: Record<string, string | null | undefined>,
  resetPage = true,
) {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(updates)) {
    if (!value) next.delete(key);
    else next.set(key, value);
  }
  if (resetPage && !("page" in updates)) {
    next.set("page", "1");
  }
  return next;
}

export default function ActivityPage() {
  const { t } = useI18n();
  const navigateDeferred = useNavigateDeferred();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [expandedRunIds, setExpandedRunIds] = useState<Set<string>>(new Set());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const platforms = usePlatformStore((state) => state.platforms);
  const fetchPlatforms = usePlatformStore((state) => state.fetchPlatforms);

  const data = useActivityStore((state) => state.data);
  const loading = useActivityStore((state) => state.loading);
  const error = useActivityStore((state) => state.error);
  const fetchRuns = useActivityStore((state) => state.fetchRuns);
  const refreshRuns = useActivityStore((state) => state.refreshRuns);
  const liveEvents = useActivityStore((state) => state.liveEvents);
  const liveConnected = useActivityStore((state) => state.liveConnected);
  const liveError = useActivityStore((state) => state.liveError);
  const startLiveTail = useActivityStore((state) => state.startLiveTail);
  const stopLiveTail = useActivityStore((state) => state.stopLiveTail);
  const clearLiveEvents = useActivityStore((state) => state.clearLiveEvents);
  const [liveEnabled, setLiveEnabled] = useState(false);

  useEffect(() => {
    if (platforms.length === 0) {
      void fetchPlatforms();
    }
  }, [fetchPlatforms, platforms.length]);

  const filters = useMemo<ActivityRunsFilters>(
    () => ({
      runId: searchParams.get("run_id") ?? undefined,
      platformId: searchParams.get("platform_id") ?? undefined,
      surface: (searchParams.get("surface") as ActivitySurface | null) ?? undefined,
      operation:
        (searchParams.get("operation") as ActivityOperation | null) ?? undefined,
      itemType: (searchParams.get("item_type") as ItemType | null) ?? undefined,
      status: (searchParams.get("status") as ActivityRunStatus | null) ?? undefined,
      targetScope:
        (searchParams.get("target_scope") as "global" | "project" | null) ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: positiveInt(searchParams.get("page"), 1),
      pageSize: positiveInt(searchParams.get("page_size"), 20),
    }),
    [searchParams],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchRuns(filters, controller.signal);
    return () => controller.abort();
  }, [fetchRuns, filters]);

  useEffect(() => {
    if (!liveEnabled) {
      stopLiveTail();
      return;
    }
    startLiveTail({
      platformId: filters.platformId,
      surface: filters.surface,
      operation: filters.operation,
      runId: filters.runId,
    });
    return () => stopLiveTail();
  }, [
    liveEnabled,
    filters.platformId,
    filters.surface,
    filters.operation,
    filters.runId,
    startLiveTail,
    stopLiveTail,
  ]);

  const preferredPlatform = useMemo(() => {
    const platformId = filters.platformId;
    return (
      platforms.find((platform) => platform.id === platformId) ??
      platforms[0] ??
      null
    );
  }, [filters.platformId, platforms]);

  const setFilter = (updates: Record<string, string | null | undefined>, resetPage = true) => {
    setSearchParams((current) => updateSearchParams(current, updates, resetPage), {
      replace: true,
    });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const filterRail = (
    <ResponsiveFilterRail
      title={t("common.filters")}
      sections={[
        {
          id: "activity-filters",
          content: (
            <Stack spacing={1.25}>
              <TextField
                size="small"
                label={t("common.search")}
                placeholder={t("activity.searchPlaceholder")}
                value={filters.search ?? ""}
                onChange={(event) => setFilter({ search: event.target.value || null })}
              />
              <TextField
                size="small"
                select
                label={t("activity.filterSurface")}
                value={filters.surface ?? ""}
                onChange={(event) => setFilter({ surface: event.target.value || null })}
              >
                <MenuItem value="">{t("activity.allSurfaces")}</MenuItem>
                <MenuItem value="local">{t("activity.surface.local")}</MenuItem>
                <MenuItem value="npx_skills">{t("activity.surface.npx_skills")}</MenuItem>
              </TextField>
              <TextField
                size="small"
                select
                label={t("activity.filterOperation")}
                value={filters.operation ?? ""}
                onChange={(event) => setFilter({ operation: event.target.value || null })}
              >
                <MenuItem value="">{t("activity.allOperations")}</MenuItem>
                <MenuItem value="install">{t("activity.operation.install")}</MenuItem>
                <MenuItem value="uninstall">{t("activity.operation.uninstall")}</MenuItem>
                <MenuItem value="remove">{t("activity.operation.remove")}</MenuItem>
                <MenuItem value="check">{t("activity.operation.check")}</MenuItem>
                <MenuItem value="update">{t("activity.operation.update")}</MenuItem>
                <MenuItem value="update_packages">{t("activity.operation.update_packages")}</MenuItem>
              </TextField>
              <TextField
                size="small"
                select
                label={t("activity.filterStatus")}
                value={filters.status ?? ""}
                onChange={(event) => setFilter({ status: event.target.value || null })}
              >
                <MenuItem value="">{t("activity.allStatuses")}</MenuItem>
                <MenuItem value="success">{t("activity.status.success")}</MenuItem>
                <MenuItem value="warning">{t("activity.status.warning")}</MenuItem>
                <MenuItem value="error">{t("activity.status.error")}</MenuItem>
              </TextField>
              <TextField
                size="small"
                select
                label={t("activity.filterItemType")}
                value={filters.itemType ?? ""}
                onChange={(event) => setFilter({ item_type: event.target.value || null })}
              >
                <MenuItem value="">{t("activity.allItemTypes")}</MenuItem>
                <MenuItem value="skill">{t("common.skills")}</MenuItem>
                <MenuItem value="agent">{t("common.agents")}</MenuItem>
              </TextField>
              <TextField
                size="small"
                select
                label={t("activity.filterTargetScope")}
                value={filters.targetScope ?? ""}
                onChange={(event) => setFilter({ target_scope: event.target.value || null })}
              >
                <MenuItem value="">{t("activity.allScopes")}</MenuItem>
                <MenuItem value="global">{t("activity.scope.global")}</MenuItem>
                <MenuItem value="project">{t("activity.scope.project")}</MenuItem>
              </TextField>
              <TextField
                size="small"
                select
                label={t("common.platform")}
                value={filters.platformId ?? ""}
                onChange={(event) => setFilter({ platform_id: event.target.value || null })}
              >
                <MenuItem value="">{t("common.all")}</MenuItem>
                {platforms.map((platform) => (
                  <MenuItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="text" onClick={clearFilters}>
                {t("activity.clearFilters")}
              </Button>
            </Stack>
          ),
        },
      ]}
      mobileOpen={filterDrawerOpen}
      onCloseMobile={() => setFilterDrawerOpen(false)}
    />
  );

  return (
    <AppShell
      variant="monitor"
      title={t("activity.pageTitle")}
      subtitle={t("activity.heroSubtitle")}
      onBack={() => navigateDeferred("/dashboard")}
      onHome={() => navigateDeferred("/")}
      filterRail={filterRail}
      actions={
        <>
          {isMobile ? (
            <MobileFilterButton onClick={() => setFilterDrawerOpen(true)} />
          ) : null}
          <Button
            variant={liveEnabled ? "contained" : "outlined"}
            color={liveEnabled ? "primary" : "inherit"}
            startIcon={<BoltIcon />}
            onClick={() => setLiveEnabled((value) => !value)}
          >
            {liveEnabled
              ? liveConnected
                ? t("activity.liveOn")
                : t("activity.liveConnecting")
              : t("activity.liveOff")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void refreshRuns(filters)}
            disabled={loading}
          >
            {t("common.refresh")}
          </Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <SectionHero
          variant="monitor"
          eyebrow={t("activity.pageTitle")}
          title={t("activity.heroBody")}
          description={t("activity.heroSubtitle")}
          actions={
            <Button variant="text" onClick={clearFilters}>
              {t("activity.clearFilters")}
            </Button>
          }
        />

        <MetricStrip
          tone="monitor"
          items={[
            {
              key: "total",
              label: t("activity.summary.total"),
              value: data?.summary.total_runs ?? 0,
              emphasis: true,
            },
            {
              key: "errors",
              label: t("activity.summary.errors"),
              value: data?.summary.error_runs ?? 0,
            },
            {
              key: "local",
              label: t("activity.summary.local"),
              value: data?.summary.local_runs ?? 0,
            },
            {
              key: "npx",
              label: t("activity.summary.npx"),
              value: data?.summary.npx_runs ?? 0,
            },
          ]}
        />

        <ListSurface tone="monitor">
          <Stack spacing={1.25}>
            <Typography variant="overline" color="text.secondary">
              {t("activity.quickFilters")}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button
                variant={filters.operation === "install" ? "contained" : "outlined"}
                onClick={() => setFilter({ operation: "install" })}
              >
                {t("activity.quickInstalls")}
              </Button>
              <Button
                variant={filters.status === "error" ? "contained" : "outlined"}
                onClick={() => setFilter({ status: "error" })}
              >
                {t("activity.quickFailures")}
              </Button>
              <Button
                variant={filters.surface === "local" ? "contained" : "outlined"}
                onClick={() => setFilter({ surface: "local" })}
              >
                {t("activity.quickLocal")}
              </Button>
              <Button
                variant={
                  filters.surface === "npx_skills" && filters.operation === "install"
                    ? "contained"
                    : "outlined"
                }
                onClick={() => setFilter({ surface: "npx_skills", operation: "install" })}
              >
                {t("activity.quickNpxInstall")}
              </Button>
              {preferredPlatform ? (
                <Button
                  variant={filters.platformId === preferredPlatform.id ? "contained" : "outlined"}
                  onClick={() => setFilter({ platform_id: preferredPlatform.id })}
                >
                  {t("activity.quickCurrentPlatform")}: {preferredPlatform.name}
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </ListSurface>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {liveEnabled ? (
          <ListSurface tone="monitor">
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                <Typography variant="overline" color="text.secondary">
                  {t("activity.liveTitle")}
                </Typography>
                <Chip
                  size="small"
                  color={liveConnected ? "success" : "warning"}
                  label={
                    liveConnected
                      ? t("activity.liveConnected")
                      : t("activity.liveConnecting")
                  }
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={t("activity.liveEventCount", { count: liveEvents.length })}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Button size="small" variant="text" onClick={clearLiveEvents}>
                  {t("activity.liveClear")}
                </Button>
              </Stack>
              {liveError ? (
                <Alert severity="warning">{liveError}</Alert>
              ) : null}
              {liveEvents.length === 0 ? (
                <Alert severity="info">{t("activity.liveEmpty")}</Alert>
              ) : (
                <Box
                  sx={{
                    maxHeight: 320,
                    overflowY: "auto",
                    fontFamily: "var(--font-family-mono)",
                    fontSize: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  {liveEvents
                    .slice()
                    .reverse()
                    .map((event) => (
                      <LiveEventLine key={`${event.run_id}-${event.seq}`} event={event} />
                    ))}
                </Box>
              )}
            </Stack>
          </ListSurface>
        ) : null}

        {loading && !data ? (
          <PageLoadingState message={t("common.loading")} minHeight={320} />
        ) : data ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                {t("activity.runsTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t("activity.runsSubtitle", { count: data.filtered_total })}
              </Typography>
            </Box>

            {data.runs.length === 0 ? (
              <Alert severity="info">
                <Typography variant="subtitle2">{t("activity.emptyTitle")}</Typography>
                <Typography variant="body2" sx={{ mt: 0.75 }}>
                  {t("activity.emptyDescription")}
                </Typography>
              </Alert>
            ) : (
              data.runs.map((run) => (
                <ActivityRunCard
                  key={run.run_id}
                  run={run}
                  t={t}
                  expanded={expandedRunIds.has(run.run_id)}
                  onToggleExpanded={() =>
                    setExpandedRunIds((previous) => {
                      const next = new Set(previous);
                      if (next.has(run.run_id)) next.delete(run.run_id);
                      else next.add(run.run_id);
                      return next;
                    })
                  }
                  platform={platforms.find((platform) => platform.id === run.platform_id) ?? null}
                />
              ))
            )}

            {data.total_pages > 1 ? (
              <Pagination
                page={data.page}
                count={data.total_pages}
                onChange={(_, value) => setFilter({ page: String(value) }, false)}
              />
            ) : null}
          </Stack>
        ) : null}
      </Stack>
      <NotificationSnackbar />
    </AppShell>
  );
}

function ActivityRunCard({
  run,
  t,
  expanded,
  onToggleExpanded,
  platform,
}: {
  run: ActivityRunDto;
  t: ReturnType<typeof useI18n>["t"];
  expanded: boolean;
  onToggleExpanded: () => void;
  platform: PlatformDisplay | null;
}) {
  return (
    <ListSurface tone="monitor">
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <PlatformIdentity
              platformId={run.platform_id}
              name={run.platform_name}
              fallbackIcon={platform?.icon}
              subtitle={run.run_id}
              size={42}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {t("activity.runAt", { value: formatTimestamp(run.started_at_ms) })} ·{" "}
              {t("activity.runCompletedAt", {
                value: formatTimestamp(run.completed_at_ms),
              })} · {t("activity.runDuration", { value: run.duration_ms })}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              variant="outlined"
              label={formatRunSurface(run.surface, t)}
            />
            <Chip
              size="small"
              variant="outlined"
              label={formatRunOperation(run.operation, t)}
            />
            <Chip
              size="small"
              color={chipColorForStatus(run.status)}
              label={formatRunStatus(run.status, t)}
            />
            <Chip
              size="small"
              variant="outlined"
              label={t(`activity.scope.${run.install_target.scope}`)}
            />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            size="small"
            color="success"
            variant="outlined"
            label={t("installHub.successCount", { count: run.success_count })}
          />
          <Chip
            size="small"
            color={run.failure_count > 0 ? "error" : "default"}
            variant="outlined"
            label={t("installHub.failedCount", { count: run.failure_count })}
          />
          <Chip
            size="small"
            variant="outlined"
            label={t("activity.runItems", { count: run.item_count })}
          />
          {run.run_config?.cli_mode ? (
            <Chip size="small" variant="outlined" label={`CLI: ${run.run_config.cli_mode}`} />
          ) : null}
          {run.run_config?.link_mode ? (
            <Chip size="small" variant="outlined" label={`Link: ${run.run_config.link_mode}`} />
          ) : null}
          {run.run_config?.agents?.length ? (
            <Chip
              size="small"
              variant="outlined"
              label={`Agents: ${run.run_config.agents.join(", ")}`}
            />
          ) : null}
        </Stack>

        <Button variant="text" onClick={onToggleExpanded} sx={{ alignSelf: "flex-start" }}>
          {expanded ? t("npxSkills.itemHideDetails") : t("activity.itemDetails")}
        </Button>

        {expanded ? (
          <Stack spacing={1}>
            {run.items.length === 0 ? (
              <Alert severity="info">{t("activity.noItemDetails")}</Alert>
            ) : (
              run.items.map((item) => (
                <Box
                  key={`${run.run_id}-${item.label}`}
                  sx={{
                    borderRadius: 2.5,
                    border: "1px solid var(--mcs-shell-divider)",
                    backgroundColor: "var(--mcs-panel-fill)",
                    p: 1.5,
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.label}
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip
                          size="small"
                          label={item.item_type}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          color={item.success ? "success" : "error"}
                          label={item.success ? t("activity.status.success") : t("activity.status.error")}
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={t("activity.runDuration", { value: item.duration_ms })}
                        />
                      </Stack>
                    </Stack>
                    <Typography variant="body2">{item.message}</Typography>
                    {item.package_ref ? (
                      <MetadataRow label={t("activity.packageRef")} value={item.package_ref} />
                    ) : null}
                    {item.skill_flags?.length ? (
                      <MetadataRow
                        label={t("activity.skillFlags")}
                        value={item.skill_flags.join(", ")}
                      />
                    ) : null}
                    {item.source_path ? (
                      <MetadataRow label={t("activity.sourcePath")} value={item.source_path} />
                    ) : null}
                    {item.target_path ? (
                      <MetadataRow label={t("activity.targetPath")} value={item.target_path} />
                    ) : null}
                    {item.error ? (
                      <DetailBlock label={t("activity.errorLabel")} value={item.error} />
                    ) : null}
                    {item.output ? (
                      <DetailBlock label={t("activity.outputLabel")} value={item.output} />
                    ) : null}
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        ) : null}
      </Stack>
    </ListSurface>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
        {value}
      </Typography>
    </Box>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid var(--mcs-shell-divider)",
        backgroundColor: "var(--mcs-surface-muted)",
        p: 1.25,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          fontFamily: "var(--font-family-mono)",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function formatLiveTimestamp(ms: number): string {
  const date = new Date(ms);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const millis = String(date.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${millis}`;
}

function liveEventColor(level: ActivityEventDto["level"]): string {
  switch (level) {
    case "error":
      return "#f44336";
    case "warning":
      return "#ff9800";
    default:
      return "#90caf9";
  }
}

function LiveEventLine({ event }: { event: ActivityEventDto }) {
  const label = summarizeLivePayload(event);
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "baseline",
        borderBottom: "1px dashed var(--mcs-shell-divider)",
        py: 0.25,
      }}
    >
      <Typography component="span" sx={{ color: "text.secondary", fontFamily: "inherit" }}>
        {formatLiveTimestamp(event.ts_ms)}
      </Typography>
      <Chip
        size="small"
        label={event.kind}
        sx={{
          height: 18,
          fontSize: 10,
          backgroundColor: liveEventColor(event.level),
          color: "#0b0b0b",
          fontFamily: "inherit",
        }}
      />
      <Typography component="span" sx={{ fontFamily: "inherit", overflowWrap: "anywhere" }}>
        {label}
      </Typography>
    </Box>
  );
}

function summarizeLivePayload(event: ActivityEventDto): string {
  const payload = event.payload ?? {};
  const parts: string[] = [];
  parts.push(event.run_id);
  if (event.operation) parts.push(String(event.operation));
  if (typeof payload.label === "string") parts.push(payload.label);
  if (typeof payload.success === "boolean") parts.push(payload.success ? "ok" : "fail");
  if (typeof payload.duration_ms === "number") parts.push(`${payload.duration_ms}ms`);
  if (typeof payload.total === "number") parts.push(`n=${payload.total}`);
  if (typeof payload.error === "string" && payload.error.length > 0) parts.push(`err=${payload.error}`);
  return parts.join(" · ");
}
