import { useEffect, useRef, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useTheme } from "@mui/material/styles";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { getSkillDetail, updateSkillContent } from "@/api/client";
import { useI18n } from "@/i18n";

interface Props {
  open: boolean;
  platformId: string;
  skillName: string;
  onClose: () => void;
  onSaved: () => void;
}

export function SkillEditorDrawer({
  open,
  platformId,
  skillName,
  onClose,
  onSaved,
}: Props) {
  const { t } = useI18n();
  const theme = useTheme();
  const [editorContainer, setEditorContainer] = useState<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const originalContentRef = useRef("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize editor and load content whenever the drawer opens or theme changes or container mounts
  useEffect(() => {
    if (!open || !editorContainer) return;

    const isDark = theme.palette.mode === "dark";

    const view = new EditorView({
      doc: "",
      extensions: [
        basicSetup,
        markdown(),
        ...(isDark ? [oneDark] : []),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "13px",
            fontFamily: '"JetBrains Mono", monospace',
          },
          ".cm-scroller": { overflow: "auto", height: "100%" },
          ".cm-content": { padding: "16px" },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setIsDirty(
              update.state.doc.toString() !== originalContentRef.current
            );
          }
        }),
      ],
      parent: editorContainer,
    });

    viewRef.current = view;

    // Load content from API
    setLoading(true);
    setIsDirty(false);
    originalContentRef.current = "";

    getSkillDetail(platformId, skillName)
      .then((detail) => {
        const content = detail.content ?? "";
        originalContentRef.current = content;
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: content },
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [open, theme.palette.mode, platformId, skillName, editorContainer]);

  const handleSave = async () => {
    if (!viewRef.current) return;
    const content = viewRef.current.state.doc.toString();
    setSaving(true);
    try {
      await updateSkillContent(platformId, skillName, content);
      originalContentRef.current = content;
      setIsDirty(false);
      onSaved();
    } catch (e) {
      console.error("Failed to save:", e);
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
          width: 640,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
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
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: '"JetBrains Mono", monospace', flexGrow: 1 }}
        >
          {skillName}/SKILL.md
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

      {/* Editor area */}
      <Box sx={{ flexGrow: 1, overflow: "hidden", position: "relative" }}>
        {loading && (
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
        )}
        <Box
          ref={setEditorContainer}
          sx={{
            height: "100%",
            "& .cm-editor": { height: "100%" },
            "& .cm-editor.cm-focused": { outline: "none" },
          }}
        />
      </Box>
    </Drawer>
  );
}
