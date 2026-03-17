import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

export interface NpxSummaryCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export default function NpxSummaryCard({ label, value, icon }: NpxSummaryCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
