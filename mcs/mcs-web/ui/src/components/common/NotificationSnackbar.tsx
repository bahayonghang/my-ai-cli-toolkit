import { Snackbar, Alert } from "@mui/material";
import { useUiStore } from "@/stores/uiStore";

export function NotificationSnackbar() {
  const notification = useUiStore((state) => state.notification);
  const clearNotification = useUiStore((state) => state.clearNotification);

  return (
    <Snackbar
      open={notification !== null}
      autoHideDuration={4000}
      onClose={clearNotification}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{
        bottom: { xs: 12, sm: 20 },
        right: { xs: 12, sm: 20 },
      }}
    >
      {notification ? (
        <Alert
          onClose={clearNotification}
          severity={notification.severity}
          variant="outlined"
          sx={{
            width: "100%",
            minWidth: { xs: 280, sm: 340 },
            bgcolor: "var(--mcs-panel-fill-strong)",
            boxShadow: "var(--mcs-shadow-md)",
            alignItems: "center",
          }}
        >
          {notification.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
}
