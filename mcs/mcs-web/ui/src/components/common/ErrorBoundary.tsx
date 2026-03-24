import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useI18n } from "@/i18n";
import type { TranslateFn } from "@/i18n";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryInnerProps extends Props {
  t: TranslateFn;
}

class ErrorBoundaryInner extends Component<ErrorBoundaryInnerProps, State> {
  constructor(props: ErrorBoundaryInnerProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100dvh",
            gap: 2,
            p: 3,
          }}
        >
          <Typography variant="h5" color="error">
            {this.props.t("common.somethingWentWrong")}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 480, textAlign: "center" }}
          >
            {this.state.error?.message ?? this.props.t("common.unexpectedError")}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            {this.props.t("common.reload")}
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default function ErrorBoundary({ children }: Props) {
  const { t } = useI18n();
  return <ErrorBoundaryInner t={t}>{children}</ErrorBoundaryInner>;
}
