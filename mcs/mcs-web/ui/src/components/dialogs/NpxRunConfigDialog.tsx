import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CloseIcon from "@mui/icons-material/Close";
import type {
  InstallTarget,
  NpxSkillsCliMode,
  NpxSkillsRunConfig,
} from "@/types";
import { useI18n } from "@/i18n";
import { pickFolder } from "@/api/client";
import { useUiStore } from "@/stores/uiStore";

interface Props {
  open: boolean;
  loading?: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor?: "primary" | "warning" | "error" | "info" | "success";
  agentOptions: string[];
  defaultConfig: NpxSkillsRunConfig;
  recentProjects: string[];
  packageRef?: string;
  skillFlagsInput?: string;
  onClose: () => void;
  onConfirm: (payload: {
    config: NpxSkillsRunConfig;
    packageRef: string;
    skillFlagsInput: string;
  }) => Promise<void> | void;
}

export function NpxRunConfigDialog({
  open,
  loading = false,
  title,
  description,
  confirmLabel,
  confirmColor = "primary",
  agentOptions,
  defaultConfig,
  recentProjects,
  packageRef = "",
  skillFlagsInput = "",
  onClose,
  onConfirm,
}: Props) {
  const { t } = useI18n();
  const showNotification = useUiStore((state) => state.showNotification);
  const [agents, setAgents] = useState<string[]>(defaultConfig.agents);
  const [cliMode, setCliMode] = useState<NpxSkillsCliMode>(defaultConfig.cliMode);
  const [installTarget, setInstallTarget] = useState<InstallTarget>(defaultConfig.installTarget);
  const [draftPackageRef, setDraftPackageRef] = useState(packageRef);
  const [draftSkillFlagsInput, setDraftSkillFlagsInput] = useState(skillFlagsInput);
  const [pickingFolder, setPickingFolder] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setAgents(defaultConfig.agents);
    setCliMode(defaultConfig.cliMode);
    setInstallTarget(defaultConfig.installTarget);
    setDraftPackageRef(packageRef);
    setDraftSkillFlagsInput(skillFlagsInput);
  }, [defaultConfig, open, packageRef, skillFlagsInput]);

  const needsPackageRef = packageRef !== undefined;
  const trimmedProjectPath = installTarget.project_path?.trim() ?? "";
  const disableConfirm =
    loading ||
    agents.length === 0 ||
    (needsPackageRef && !draftPackageRef.trim()) ||
    (installTarget.scope === "project" && !trimmedProjectPath) ||
    pickingFolder;

  const helperSummary = useMemo(
    () => [
      t("npxSkills.runConfigThisRunOnly"),
      t("npxSkills.runConfigDefaultsStayUntouched"),
    ],
    [t]
  );

  const handlePickFolder = async () => {
    try {
      setPickingFolder(true);
      const result = await pickFolder();
      if (result.path) {
        setInstallTarget({ scope: "project", project_path: result.path });
      }
    } catch (error) {
      showNotification((error as Error).message, "error");
    } finally {
      setPickingFolder(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <IconButton aria-label={t("common.close")} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Alert severity="info" variant="outlined">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
              {helperSummary.map((line) => (
                <Typography key={line} variant="body2">
                  {line}
                </Typography>
              ))}
            </Stack>
          </Alert>

          {needsPackageRef && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {t("npxSkills.runConfigPackageSection")}
                  </Typography>
                  <TextField
                    label={t("npxSkills.packageRef")}
                    placeholder={t("npxSkills.packageRefPlaceholder")}
                    value={draftPackageRef}
                    onChange={(event) => setDraftPackageRef(event.target.value)}
                    fullWidth
                    disabled={loading}
                  />
                  <TextField
                    label={t("npxSkills.skillFlags")}
                    placeholder={t("npxSkills.skillFlagsPlaceholder")}
                    value={draftSkillFlagsInput}
                    onChange={(event) => setDraftSkillFlagsInput(event.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                    disabled={loading}
                  />
                </Stack>
              </CardContent>
            </Card>
          )}

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {t("npxSkills.targetAgents")}
                </Typography>
                <Autocomplete
                  multiple
                  freeSolo
                  options={agentOptions}
                  value={agents}
                  onChange={(_, next) => setAgents(next)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...rest } = getTagProps({ index });
                      return (
                        <Chip key={key} label={option} color="primary" variant="outlined" {...rest} />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("npxSkills.targetAgents")}
                      helperText={t("npxSkills.runConfigAgentsHelp")}
                    />
                  )}
                />
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {t("npxSkills.summaryCliMode")}
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={cliMode}
                  onChange={(_, value: NpxSkillsCliMode | null) => {
                    if (value) {
                      setCliMode(value);
                    }
                  }}
                >
                  <ToggleButton value="auto">{t("npxSkills.cliModeAuto")}</ToggleButton>
                  <ToggleButton value="npx">{t("npxSkills.cliModeNpx")}</ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" color="text.secondary">
                  {cliMode === "auto"
                    ? t("npxSkills.cliModeAutoHelp")
                    : t("npxSkills.cliModeNpxHelp")}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {t("common.installTarget")}
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={installTarget.scope}
                  onChange={(_, value: InstallTarget["scope"] | null) => {
                    if (!value) {
                      return;
                    }
                    setInstallTarget(
                      value === "project"
                        ? { scope: "project", project_path: trimmedProjectPath }
                        : { scope: "global" }
                    );
                  }}
                >
                  <ToggleButton value="global">{t("dialogs.installTargetGlobal")}</ToggleButton>
                  <ToggleButton value="project">{t("dialogs.installTargetProject")}</ToggleButton>
                </ToggleButtonGroup>

                {installTarget.scope === "project" && (
                  <Stack spacing={1.5}>
                    <TextField
                      label={t("dialogs.projectPathLabel")}
                      placeholder={t("dialogs.projectPathPlaceholder")}
                      value={trimmedProjectPath}
                      onChange={(event) =>
                        setInstallTarget({
                          scope: "project",
                          project_path: event.target.value,
                        })
                      }
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={t("dialogs.chooseLocalFolder")}
                              onClick={handlePickFolder}
                            >
                              <FolderOpenIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {recentProjects.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {recentProjects.map((project) => (
                          <Chip
                            key={project}
                            label={project}
                            variant="outlined"
                            onClick={() =>
                              setInstallTarget({
                                scope: "project",
                                project_path: project,
                              })
                            }
                          />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", gap: 1, px: 3 }}>
        <Typography variant="caption" color="text.secondary">
          {t("npxSkills.runConfigConfirmHint")}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            color={confirmColor}
            disabled={disableConfirm}
            onClick={() =>
              void onConfirm({
                config: {
                  agents,
                  cliMode,
                  installTarget:
                    installTarget.scope === "project"
                      ? {
                          scope: "project",
                          project_path: trimmedProjectPath,
                        }
                      : { scope: "global" },
                },
                packageRef: draftPackageRef.trim(),
                skillFlagsInput: draftSkillFlagsInput,
              })
            }
          >
            {confirmLabel}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
