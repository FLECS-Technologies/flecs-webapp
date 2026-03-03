import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Menu as MenuIcon } from 'lucide-react';
import { useUIStore } from '@stores/ui';
import FLECSLogo from './FLECSLogo';
import { brand } from '@app/theme/tokens';

export default function MobileBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  if (!isMobile) return null;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: brand.dark,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: 48 }}>
        <IconButton
          size="small"
          sx={{ color: brand.muted }}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <MenuIcon size={22} />
        </IconButton>
        <FLECSLogo logoColor={brand.primary} />
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: brand.white }}>
          FLECS
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
