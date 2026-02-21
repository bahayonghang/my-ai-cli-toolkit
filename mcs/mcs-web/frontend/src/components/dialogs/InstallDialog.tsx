import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, Box, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText,
  Chip, Collapse, CircularProgress,
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
import type { PlatformDisplay } from "@/types";

type Phase = "confirm" | "installing" | "completed";

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
  onClose,
  onCompleted,
}: Props) {
  const [phase, setPhase] = useState<Phase>("confirm");
  const [results, setResults] = useState<ItemResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  const handleEnter = () => {
    setPhase("confirm");
    setResults(
      itemNames.map((name) => ({
        name,
        category: itemCategories[name] ?? null,
        status: "pending",
      }))
    );
    setCurrentIndex(0);
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

  const successCount = results.filter((r) => r.status === "success").length;
  const failureCount = results.filter((r) => r.status === "error").length;
  const progress =
    results.length > 0
      ? ((successCount + failureCount) / results.length) * 100
      : 0;

  const handleInstall = async () => {
    setPhase("installing");
    const fn = itemType === "skills" ? installSkills : installCommands;

    for (let i = 0; i < itemNames.length; i++) {
      const name = itemNames[i];
      setCurrentIndex(i);
      setResults((prev) =>
        prev.map((r) => (r.name === name ? { ...r, status: "installing" } : r))
      );

      try {
        const result = await fn(platformId, [name]);
        const itemResult = result.results[0];
        setResults((prev) =>
          prev.map((r) =>
            r.name === name
              ? {
                  ...r,
                  status: itemResult?.success !== false ? "success" : "error",
                  errorMessage: itemResult?.error ?? undefined,
                }
              : r
          )
        );
      } catch (e) {
        setResults((prev) =>
          prev.map((r) =>
            r.name === name
              ? { ...r, status: "error", errorMessage: (e as Error).message }
              : r
          )
        );
      }
    }

    setPhase("completed");
  };

  return (
    <Dialog
      open={open}
      onClose={phase === "installing" ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      {phase === "confirm" && (
        <ConfirmPhase
          platform={platform}
          results={results}
          itemType={itemType}
          onCancel={onClose}
          onInstall={handleInstall}
        />
      )}
      {phase === "installing" && (
        <InstallingPhase
          results={results}
          currentIndex={currentIndex}
          progress={progress}
          successCount={successCount}
          failureCount={failureCount}
        />
      )}
      {phase === "completed" && (
        <CompletedPhase
          results={results}
          successCount={successCount}
          failureCount={failureCount}
          progress={progress}
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
  onCancel: () => void;
  onInstall: () => void;
}

function ConfirmPhase({ platform, results, itemType, onCancel, onInstall }: ConfirmPhaseProps) {
  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <InstallDesktopIcon color="primary" />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          Install Items
        </Typography>
        <IconButton size="small" onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Platform:
          </Typography>
          <Chip
            label={platform ? `${platform.icon} ${platform.name}` : "Unknown"}
            color="primary"
            size="small"
            variant="outlined"
          />
        </Box>

        <List dense disablePadding sx={{ maxHeight: 240, overflow: "auto" }}>
          {results.map((item) => (
            <ListItem key={item.name} disablePadding sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <RadioButtonUncheckedIcon
                  sx={{ fontSize: 14, color: "text.disabled" }}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2">{item.name}</Typography>
                    {item.category && (
                      <Chip
                        label={item.category}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: "0.65rem", borderRadius: 1 }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
        <Typography variant="caption" color="text.secondary">
          {results.length} {itemType} will be installed
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            variant="contained"
            onClick={onInstall}
            startIcon={<InstallDesktopIcon />}
          >
            Install
          </Button>
        </Box>
      </DialogActions>
    </>
  );
}

interface InstallingPhaseProps {
  results: ItemResult[];
  currentIndex: number;
  progress: number;
  successCount: number;
  failureCount: number;
}

function InstallingPhase({
  results,
  currentIndex,
  progress,
  successCount,
  failureCount,
}: InstallingPhaseProps) {
  const total = results.length;
  const done = successCount + failureCount;
  const currentItem = results[currentIndex];

  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CircularProgress size={20} thickness={4} />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          Installing...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {done} / {total}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(139, 92, 246, 0.15)",
              "& .MuiLinearProgress-bar": { borderRadius: 4 },
            }}
          />
        </Box>

        {currentItem && (
          <Typography
            variant="caption"
            color="primary"
            sx={{ display: "block", mb: 2 }}
          >
            ▶ {currentItem.name}
          </Typography>
        )}

        <List dense disablePadding sx={{ maxHeight: 260, overflow: "auto" }}>
          {results.map((item) => (
            <ListItem key={item.name} disablePadding sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                {item.status === "success" && (
                  <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                )}
                {item.status === "error" && (
                  <CancelIcon sx={{ fontSize: 16, color: "error.main" }} />
                )}
                {item.status === "installing" && (
                  <CircularProgress size={14} thickness={4} />
                )}
                {item.status === "pending" && (
                  <RadioButtonUncheckedIcon
                    sx={{ fontSize: 14, color: "text.disabled" }}
                  />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    color={
                      item.status === "success"
                        ? "success.main"
                        : item.status === "error"
                        ? "error.main"
                        : item.status === "installing"
                        ? "primary.main"
                        : "text.secondary"
                    }
                  >
                    {item.name}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </>
  );
}

interface CompletedPhaseProps {
  results: ItemResult[];
  successCount: number;
  failureCount: number;
  progress: number;
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
          {hasErrors ? "Completed with errors" : "Installation Complete"}
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
            label={`${successCount} installed`}
            color="success"
            size="small"
            variant="outlined"
          />
          {hasErrors && (
            <Chip
              icon={<CancelIcon />}
              label={`${failureCount} failed`}
              color="error"
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <List dense disablePadding sx={{ maxHeight: 260, overflow: "auto" }}>
          {results.map((item) => (
            <Box key={item.name}>
              <ListItem
                disablePadding
                sx={{
                  py: 0.25,
                  cursor: item.status === "error" ? "pointer" : "default",
                }}
                onClick={() => item.status === "error" && onToggleError(item.name)}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {item.status === "success" ? (
                    <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                  ) : (
                    <CancelIcon sx={{ fontSize: 16, color: "error.main" }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      color={
                        item.status === "success" ? "success.main" : "error.main"
                      }
                    >
                      {item.name}
                    </Typography>
                  }
                />
                {item.status === "error" &&
                  (expandedErrors.has(item.name) ? (
                    <ExpandLessIcon fontSize="small" color="action" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" color="action" />
                  ))}
              </ListItem>

              {item.status === "error" && item.errorMessage && (
                <Collapse in={expandedErrors.has(item.name)}>
                  <Box
                    sx={{
                      ml: 4,
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: "rgba(239, 83, 80, 0.12)",
                    }}
                  >
                    <Typography variant="caption" color="error.main">
                      {item.errorMessage}
                    </Typography>
                  </Box>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </>
  );
}
