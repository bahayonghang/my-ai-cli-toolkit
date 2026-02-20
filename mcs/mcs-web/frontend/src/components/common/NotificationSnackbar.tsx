import { Snackbar, Alert } from "@mui/material";
import { useUiStore } from "@/stores/uiStore";

export function NotificationSnackbar() {
  const { notification, clearNotification } = useUiStore();

  return (
    <Snackbar
      open={notification !== null}
      autoHideDuration={4000}
      onClose={clearNotification}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      {notification ? (
        <Alert
          onClose={clearNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
}
