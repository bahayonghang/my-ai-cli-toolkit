import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 2,
      }}
    >
      <Typography variant="h3" fontWeight={700}>
        404
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t("common.pageNotFound")}
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        {t("common.goHome")}
      </Button>
    </Box>
  );
}
