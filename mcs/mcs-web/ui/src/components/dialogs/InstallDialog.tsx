import { useEffect, useRef, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, Box, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText,
  Chip, Collapse, CircularProgress, Paper,
  ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { installSkills, installCommands } from "@/api/client";
import type { InstallTarget, PlatformDisplay } from "@/types";
import { useI18n } from "@/i18n";

type Phase = "confirm" | "installing" | "completed";
type LinkMode = "auto" | "symlink" | "copy";

type ItemResult = {
  name: string;
  category?: string | null;
  status: "pending" | "installing" | "success" | "error";
  errorMessage?: string;
};

interface Props {
  open: boolean;
  platformId: string;
  platform?: PlatformDisplay;
  itemNames: string[];
  itemCategories?: Record<string, string | null>;
  itemType: "skills" | "commands";
  installTarget?: InstallTarget;
  onClose: () => void;
  onCompleted: (successCount: number, failureCount: number) => void;
}

export function InstallDialog({
  open,
  platformId,
  platform,
  itemNames,
  itemCategories = {},
  itemType,
  installTarget,
  onClose,
  onCompleted,
}: Props) {
  const [phase, setPhase] = useState<Phase>("confirm");
  const [linkMode, setLinkMode] = useState<LinkMode>("auto");
  const [results, setResults] = useState<ItemResult[]>([]);
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const installAbortRef = useRef<AbortController | null>(null);

  const handleEnter = () => {
    installAbortRef.current?.abort();
    installAbortRef.current = null;
    setPhase("confirm");
    setLinkMode("auto");
    setResults(
      itemNames.map((name) => ({
        name,
        category: itemCategories[name] ?? null,
        status: "pending",
      }))
    );
    setExpandedErrors(new Set());
  };

  const toggleError = (name: string) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  useEffect(() => () => installAbortRef.current?.abort(), []);

  const isAbortError = (error: unknown) =>
    error instanceof DOMException
      ? error.name === "AbortError"
      : error instanceof Error && error.name === "AbortError";

  const handleCancelInstall = () => {
    installAbortRef.current?.abort();
    installAbortRef.current = null;
    onClose();
  };

  const handleDialogClose = () => {
    if (phase === "installing") {
      handleCancelInstall();
      return;
    }
    onClose();
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const failureCount = results.filter((r) => r.status === "error").length;

  const handleInstall = async () => {
    setPhase("installing");
    const controller = new AbortController();
    installAbortRef.current = controller;

    // Mark all items as installing at once (single batch request)
    setResults((prev) => prev.map((r) => ({ ...r, status: "installing" as const })));

    try {
      const response =
        itemType === "skills"
          ? await installSkills(platformId, itemNames, linkMode, installTarget, controller.signal)
          : await installCommands(platformId, itemNames, installTarget, controller.signal);

      if (controller.signal.aborted) return;

      // Map batch results back to individual items
      setResults((prev) =>
        prev.map((r) => {
          const batchItem = response.results.find((br) => br.item_name === r.name);
          return {
            ...r,
            status: batchItem?.success !== false ? "success" : "error",
            errorMessage: batchItem?.error ?? undefined,
          };
        })
      );
      setPhase("completed");
    } catch (e) {
      if (isAbortError(e) || controller.signal.aborted) return;
      setResults((prev) =>
        prev.map((r) =>
          r.status === "installing"
            ? { ...r, status: "error" as const, errorMessage: (e as Error).message }
            : r
        )
      );
      setPhase("completed");
    } finally {
      installAbortRef.current = null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      {phase === "confirm" && (
        <ConfirmPhase
          platform={platform}
          results={results}
          itemType={itemType}
          linkMode={linkMode}
          onLinkModeChange={setLinkMode}
          onCancel={handleDialogClose}
          onInstall={handleInstall}
        />
      )}
      {phase === "installing" && (
        <InstallingPhase
          results={results}
          successCount={successCount}
          failureCount={failureCount}
          onCancel={handleCancelInstall}
        />
      )}
      {phase === "completed" && (
        <CompletedPhase
          results={results}
          successCount={successCount}
          failureCount={failureCount}
          expandedErrors={expandedErrors}
          onToggleError={toggleError}
          onClose={() => {
            onCompleted(successCount, failureCount);
            onClose();
          }}
        />
      )}
    </Dialog>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

interface ConfirmPhaseProps {
  platform?: PlatformDisplay;
  results: ItemResult[];
  itemType: "skills" | "commands";
  linkMode: LinkMode;
  onLinkModeChange: (mode: LinkMode) => void;
  onCancel: () => void;
  onInstall: () => void;
}

function ConfirmPhase({ platform, results, itemType, linkMode, onLinkModeChange, onCancel, onInstall }: ConfirmPhaseProps) {
  const { t } = useI18n();
  const itemTypeLabel =
    itemType === "skills"
      ? t("dialogs.itemTypeSkills")
      : t("dialogs.itemTypeCommands");

  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <InstallDesktopIcon color="primary" />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          {t("dialogs.installItemsTitle")}
        </Typography>
        <IconButton onClick={onCancel} aria-label={t("common.close")}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t("dialogs.platformLabel")}
          </Typography>
          <Chip
            label={platform ? `${platform.icon} ${platform.name}` : t("common.unknown")}
            color="primary"
            size="small"
            variant="outlined"
          />
        </Box>

        {itemType === "skills" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t("dialogs.installLinkMode")}
            </Typography>
            <ToggleButtonGroup
              value={linkMode}
              exclusive
              onChange={(_, v) => v && onLinkModeChange(v as LinkMode)}
            >
              <ToggleButton value="auto">{t("dialogs.linkModeAuto")}</ToggleButton>
              <ToggleButton value="symlink">{t("dialogs.linkModeSymlink")}</ToggleButton>
              <ToggleButton value="copy">{t("dialogs.linkModeCopy")}</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        <Paper
          variant="outlined"
          sx={{
            maxHeight: 240,
            overflow: "auto",
            borderRadius: 2,
            backgroundColor: "var(--mcs-surface-muted)",
          }}
        >
          <List dense disablePadding>
            {results.map((item, index) => (
              <ListItem
                key={item.name}
                disablePadding
                sx={{
                  py: 0.5,
                  px: 1,
                  backgroundColor:
                    index % 2 === 0 ? "transparent" : "action.hover",
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <RadioButtonUncheckedIcon
                    sx={{ fontSize: 16, color: "text.disabled" }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {item.name}
                      </Typography>
                      {item.category && (
                        <Chip
                          label={item.category}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem", borderRadius: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
        <Typography variant="caption" color="text.secondary">
          {t("dialogs.willInstallItems", {
            count: results.length,
            itemType: itemTypeLabel,
          })}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onCancel}>{t("common.cancel")}</Button>
          <Button
            variant="contained"
            onClick={onInstall}
            startIcon={<InstallDesktopIcon />}
          >
            {t("common.install")}
          </Button>
        </Box>
      </DialogActions>
    </>
  );
}

interface InstallingPhaseProps {
  results: ItemResult[];
  successCount: number;
  failureCount: number;
  onCancel: () => void;
}

function InstallingPhase({
  results,
  successCount,
  failureCount,
  onCancel,
}: InstallingPhaseProps) {
  const { t } = useI18n();
  const total = results.length;
  const done = successCount + failureCount;

  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CircularProgress size={20} thickness={4} />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          {t("dialogs.installingTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {done} / {total}
        </Typography>
        <IconButton onClick={onCancel} aria-label={t("common.cancel")}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 1 }}>
          <LinearProgress
            variant="indeterminate"
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "var(--mcs-warning-progress)",
              "& .MuiLinearProgress-bar": { borderRadius: 4 },
            }}
          />
        </Box>

        <Typography
          variant="caption"
          color="primary"
          sx={{ display: "block", mb: 2 }}
        >
          {t("dialogs.installingBatchCount", { count: total })}
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            maxHeight: 260,
            overflow: "auto",
            borderRadius: 2,
            backgroundColor: "var(--mcs-surface-muted)",
          }}
        >
          <List dense disablePadding>
            {results.map((item, index) => (
              <ListItem
                key={item.name}
                disablePadding
                sx={{
                  py: 0.5,
                  px: 1,
                  backgroundColor:
                    index % 2 === 0 ? "transparent" : "action.hover",
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {item.status === "success" && (
                    <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
                  )}
                  {item.status === "error" && (
                    <CancelIcon sx={{ fontSize: 18, color: "error.main" }} />
                  )}
                  {item.status === "installing" && (
                    <CircularProgress size={16} thickness={4} />
                  )}
                  {item.status === "pending" && (
                    <RadioButtonUncheckedIcon
                      sx={{ fontSize: 16, color: "text.disabled" }}
                    />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={item.status === "installing" ? 600 : 500}
                      color={
                        item.status === "success"
                          ? "success.main"
                          : item.status === "error"
                            ? "error.main"
                            : item.status === "installing"
                              ? "primary.main"
                              : "text.primary"
                      }
                    >
                      {item.name}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </DialogContent>
    </>
  );
}

interface CompletedPhaseProps {
  results: ItemResult[];
  successCount: number;
  failureCount: number;
  expandedErrors: Set<string>;
  onToggleError: (name: string) => void;
  onClose: () => void;
}

function CompletedPhase({
  results,
  successCount,
  failureCount,
  expandedErrors,
  onToggleError,
  onClose,
}: CompletedPhaseProps) {
  const { t } = useI18n();
  const hasErrors = failureCount > 0;

  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {hasErrors ? (
          <WarningAmberIcon color="warning" />
        ) : (
          <CheckCircleOutlineIcon color="success" />
        )}
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          {hasErrors
            ? t("dialogs.completedWithErrors")
            : t("dialogs.installationComplete")}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={100}
            color={hasErrors ? "warning" : "success"}
            sx={{
              height: 8,
              borderRadius: 4,
              "& .MuiLinearProgress-bar": { borderRadius: 4 },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={t("installHub.successCount", { count: successCount })}
            color="success"
            size="small"
            variant="outlined"
          />
          {hasErrors && (
            <Chip
              icon={<CancelIcon />}
              label={t("installHub.failedCount", { count: failureCount })}
              color="error"
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <Paper
          variant="outlined"
          sx={{
            maxHeight: 260,
            overflow: "auto",
            borderRadius: 2,
            backgroundColor: "var(--mcs-surface-muted)",
          }}
        >
          <List dense disablePadding>
            {results.map((item, index) => (
              <Box
                key={item.name}
                sx={{
                  backgroundColor:
                    index % 2 === 0 ? "transparent" : "action.hover",
                }}
              >
                <ListItem
                  disablePadding
                  sx={{
                    py: 0.5,
                    px: 1,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {item.status === "success" ? (
                      <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
                    ) : (
                      <CancelIcon sx={{ fontSize: 18, color: "error.main" }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color={
                          item.status === "success" ? "success.main" : "error.main"
                        }
                      >
                        {item.name}
                      </Typography>
                    }
                  />
                  {item.status === "error" && (
                    <IconButton
                      aria-label={
                        expandedErrors.has(item.name)
                          ? `${t("npxSkills.itemHideDetails")} ${item.name}`
                          : `${t("npxSkills.itemShowDetails")} ${item.name}`
                      }
                      onClick={() => onToggleError(item.name)}
                    >
                      {expandedErrors.has(item.name) ? (
                        <ExpandLessIcon fontSize="small" color="action" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" color="action" />
                      )}
                    </IconButton>
                  )}
                </ListItem>

                {item.status === "error" && item.errorMessage && (
                  <Collapse in={expandedErrors.has(item.name)}>
                    <Box
                      sx={{
                        ml: 5,
                        mr: 1,
                        mb: 1,
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: "var(--mcs-error-surface)",
                        border: "1px solid",
                        borderColor: "var(--mcs-error-border)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "var(--mcs-error-text)",
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {item.errorMessage}
                      </Typography>
                    </Box>
                  </Collapse>
                )}
              </Box>
            ))}
          </List>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          {t("common.close")}
        </Button>
      </DialogActions>
    </>
  );
}
