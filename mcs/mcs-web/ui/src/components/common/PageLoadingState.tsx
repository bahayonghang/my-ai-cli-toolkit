import type { ReactNode } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function PageLoadingState({
  message,
  minHeight = "100dvh",
}: {
  message: ReactNode;
  minHeight?: string | number;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      minHeight={minHeight}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
