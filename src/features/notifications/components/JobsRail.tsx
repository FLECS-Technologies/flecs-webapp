import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Stack,
  Chip,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useQuestActions, useQuestPolling } from '@shared/quests/hooks';
import { useQuestStore } from '@stores/quests';
import { QuestLogEntry } from '@shared/quests/components/QuestLogEntry';

export default function JobsRail() {
  const mainQuestIds = useQuestStore((s) => s.mainQuestIds);
  const setFetching = useQuestStore((s) => s.setFetching);
  const { clearQuests } = useQuestActions();
  useQuestPolling();
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setFetching(true);
    return () => setFetching(false);
  }, []);

  const questCount = mainQuestIds.length;
  const hasQuests = questCount > 0;

  if (!hasQuests) return null;

  return (
    <Paper
      elevation={4}
      aria-label="Active jobs"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: isMobile ? 0 : 220,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: 2,
          py: 1,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>
          Jobs
        </Typography>
        <Chip label={questCount} size="small" color="primary" role="status" sx={{ mr: 1 }} />
        <Tooltip title="Clear finished">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              clearQuests();
            }}
            sx={{ mr: 0.5 }}
          >
            <Trash2 size={16} />
          </IconButton>
        </Tooltip>
        <IconButton
          size="small"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse jobs' : 'Expand jobs'}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </IconButton>
      </Stack>

      <Collapse in={expanded}>
        <Box
          sx={{
            maxHeight: 300,
            overflowY: 'auto',
            px: 1,
            pb: 2,
          }}
        >
          {mainQuestIds.map((id) => (
            <QuestLogEntry key={id} id={id} level={0} />
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
}
