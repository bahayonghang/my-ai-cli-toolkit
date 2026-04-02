import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useTheme } from "@mui/material/styles";
import { EditorView, basicSetup } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { getAgentDetail, updateAgentContent } from "@/api/client";
import { useI18n } from "@/i18n";
import { useUiStore } from "@/stores/uiStore";

interface Props {
  open: boolean;
  platformId: string;
  agentName: string;
  onClose: () => void;
  onSaved: () => void;
}

export function AgentEditorDrawer({
  open,
  platformId,
  agentName,
  onClose,
  onSaved,
}: Props) {
  const { t } = useI18n();
  const theme = useTheme();
  const showNotification = useUiStore((state) => state.showNotification);
  const [editorContainer, setEditorContainer] = useState<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const originalContentRef = useRef("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!open || !editorContainer) return;

    const isDark = theme.palette.mode === "dark";
    const view = new EditorView({
      doc: "",
      extensions: [
        basicSetup,
        ...(isDark ? [oneDark] : []),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "0.8125rem",
            fontFamily: '"JetBrains Mono", monospace',
          },
          ".cm-scroller": { overflow: "auto", height: "100%" },
          ".cm-content": { padding: "16px" },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setIsDirty(update.state.doc.toString() !== originalContentRef.current);
          }
        }),
      ],
      parent: editorContainer,
    });

    viewRef.current = view;
    setLoading(true);
    setIsDirty(false);
    originalContentRef.current = "";

    getAgentDetail(platformId, agentName)
      .then((detail) => {
        const content = detail.content ?? "";
        originalContentRef.current = content;
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: content },
        });
      })
      .catch((error) => {
        showNotification((error as Error).message, "error");
      })
      .finally(() => setLoading(false));

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [agentName, editorContainer, open, platformId, showNotification, theme.palette.mode]);

  const handleSave = async () => {
    if (!viewRef.current) return;
    const content = viewRef.current.state.doc.toString();
    setSaving(true);
    try {
      await updateAgentContent(platformId, agentName, content);
      originalContentRef.current = content;
      setIsDirty(false);
      onSaved();
    } catch (e) {
      showNotification((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm(t("dialogs.unsavedChangesConfirm"))) {
      return;
    }
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 640 },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <IconButton onClick={handleClose} aria-label={t("common.close")}>
          <CloseIcon />
        </IconButton>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: '"JetBrains Mono", monospace', flexGrow: 1 }}
        >
          {agentName}
        </Typography>
        <Button
          variant={isDirty ? "contained" : "outlined"}
          size="small"
          startIcon={
            saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />
          }
          onClick={handleSave}
          disabled={!isDirty || saving}
        >
          {t("dialogs.save")}
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: "hidden", position: "relative" }}>
        {loading ? (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              backgroundColor: "background.paper",
            }}
          >
            <CircularProgress />
          </Box>
        ) : null}
        <Box
          ref={setEditorContainer}
          sx={{
            height: "100%",
            "& .cm-editor": { height: "100%" },
            "& .cm-editor.cm-focused": {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: -2,
            },
          }}
        />
      </Box>
    </Drawer>
  );
}
