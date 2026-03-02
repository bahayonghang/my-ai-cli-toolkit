import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import type { PlatformDisplay } from "@/types";
import type { PlatformSelection } from "./types";

interface Props {
  platforms: PlatformDisplay[];
  selectedPlatforms: PlatformSelection;
  disabled: boolean;
  onTogglePlatform: (platformId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export function PlatformTargetPanel({
  platforms,
  selectedPlatforms,
  disabled,
  onTogglePlatform,
  onSelectAll,
  onClearSelection,
}: Props) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        title="Target Platforms"
        subheader={`Available ${platforms.length}`}
        action={
          <Chip
            color="primary"
            label={`${selectedPlatforms.size} selected`}
            variant="outlined"
          />
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack direction="row" spacing={1} mb={2}>
          <Button size="small" variant="outlined" onClick={onSelectAll} disabled={disabled || platforms.length === 0}>
            Select All
          </Button>
          <Button size="small" variant="text" onClick={onClearSelection} disabled={disabled || selectedPlatforms.size === 0}>
            Clear Selection
          </Button>
        </Stack>
        <PlatformList
          disabled={disabled}
          platforms={platforms}
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={onTogglePlatform}
        />
      </CardContent>
    </Card>
  );
}

interface PlatformListProps {
  platforms: PlatformDisplay[];
  selectedPlatforms: PlatformSelection;
  disabled: boolean;
  onTogglePlatform: (platformId: string) => void;
}

function PlatformList({
  platforms,
  selectedPlatforms,
  disabled,
  onTogglePlatform,
}: PlatformListProps) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        maxHeight: 420,
        overflow: "auto",
      }}
    >
      {platforms.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary">No platforms found.</Typography>
        </Box>
      ) : (
        <List dense disablePadding>
          {platforms.map((platform) => (
            <ListItem key={platform.id} disablePadding divider>
              <ListItemButton
                selected={selectedPlatforms.has(platform.id)}
                disabled={disabled}
                onClick={() => onTogglePlatform(platform.id)}
              >
                <Checkbox checked={selectedPlatforms.has(platform.id)} tabIndex={-1} />
                <ListItemText
                  primary={`${platform.icon} ${platform.name}`}
                  secondary={platform.base_dir}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
