import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

export interface NpxSummaryCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export default function NpxSummaryCard({
  label,
  value,
  icon,
}: NpxSummaryCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "var(--mcs-summary-tile-fill)",
        borderColor: "var(--mcs-summary-tile-stroke)",
        boxShadow: "none",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.75,
          minHeight: 108,
          p: 2.25,
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(180deg, var(--mcs-workbench-accent-soft) 0%, var(--mcs-workbench-surface-muted) 100%)",
            border: "1px solid var(--mcs-workbench-outline)",
            boxShadow:
              "inset 0 1px 0 var(--mcs-glass-highlight), var(--mcs-glass-shadow)",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{
              color: "var(--mcs-workbench-muted)",
              display: "block",
              mb: 0.35,
              lineHeight: 1.2,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
