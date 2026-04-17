import { Snackbar, Alert, Button } from "@mui/material";
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
          action={
            notification.action ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  notification.action?.onClick();
                  clearNotification();
                }}
              >
                {notification.action.label}
              </Button>
            ) : undefined
          }
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
