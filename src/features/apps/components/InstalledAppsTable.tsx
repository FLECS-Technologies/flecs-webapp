import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { App } from '@shared/types/app';
import InstalledAppRow from './InstalledAppRow';

interface InstalledAppsTableProps {
  apps: App[];
}

const headerSx = {
  color: 'text.disabled',
  fontSize: '0.65rem',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  py: 1.5,
};

export default function InstalledAppsTable({ apps }: InstalledAppsTableProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerSx, width: 48, px: 1 }} />
              <TableCell sx={headerSx}>Application</TableCell>
              <TableCell sx={headerSx}>Version</TableCell>
              <TableCell sx={{ ...headerSx, display: { xs: 'none', md: 'table-cell' } }}>
                Category
              </TableCell>
              <TableCell sx={headerSx}>Status</TableCell>
              <TableCell sx={headerSx} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apps.map((app) => (
              <InstalledAppRow key={app.appKey.name + app.appKey.version} app={app} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
