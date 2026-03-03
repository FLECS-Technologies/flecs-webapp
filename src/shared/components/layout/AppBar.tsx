import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Stack,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Sun, Moon, Bell, HelpCircle, LogIn, User, Menu as MenuIcon } from 'lucide-react';
import { useDarkMode } from '@app/theme/ThemeHandler';
import { useOAuth4WebApiAuth } from '@features/auth/providers/OAuth4WebApiAuthProvider';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@stores/notifications';
import { useUIStore } from '@stores/ui';
import FLECSLogo from './FLECSLogo';
import { brand } from '@app/theme/tokens';

export default function TopBar() {
  const { isDarkMode, setDarkMode } = useDarkMode();
  const user = useOAuth4WebApiAuth();
  const navigate = useNavigate();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [notifAnchor, setNotifAnchor] = React.useState<HTMLElement | null>(null);
  const notifications = useNotificationStore((s) => s.notifications);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: brand.dark,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Hamburger menu (mobile only) */}
        {isMobile && (
          <IconButton
            size="small"
            sx={{ color: brand.muted }}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <MenuIcon size={24} />
          </IconButton>
        )}

        {/* Logo */}
        <IconButton disabled sx={{ opacity: 1 }}>
          <FLECSLogo logoColor={brand.primary} />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ color: brand.white }}>
          FLECS
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Help */}
        <IconButton
          size="small"
          sx={{ color: brand.muted }}
          onClick={() => window.open('https://flecs.tech/docs', '_blank')}
          aria-label="Open documentation"
        >
          <HelpCircle size={20} />
        </IconButton>

        {/* Notifications */}
        <IconButton
          size="small"
          sx={{ color: brand.muted }}
          onClick={(e) => {
            setNotifAnchor(e.currentTarget);
            markAllRead();
          }}
          aria-label="Notifications"
        >
          <Badge badgeContent={unreadCount} color="error" max={9}>
            <Bell size={20} />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          slotProps={{ paper: { sx: { width: 320, maxHeight: 400 } } }}
        >
          {notifications.length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </MenuItem>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <MenuItem key={n.id} onClick={() => setNotifAnchor(null)}>
                <Stack>
                  <Typography variant="body2" fontWeight={600}>
                    {n.title}
                  </Typography>
                  {n.message && (
                    <Typography variant="caption" color="text.secondary">
                      {n.message}
                    </Typography>
                  )}
                </Stack>
              </MenuItem>
            ))
          )}
        </Menu>

        {/* Theme toggle */}
        <IconButton
          size="small"
          sx={{ color: brand.muted }}
          onClick={() => setDarkMode(!isDarkMode)}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>

        {/* Avatar / Sign in */}
        <IconButton
          size="small"
          sx={{ color: brand.muted }}
          onClick={user?.user ? (e) => setAnchorEl(e.currentTarget) : () => navigate('/device-login')}
          aria-label={user?.user ? 'User menu' : 'Sign in'}
        >
          {user?.user ? <User size={20} /> : <LogIn size={20} />}
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem divider sx={{ pointerEvents: 'none' }}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Signed in as
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {user.user?.preferred_username || 'anonymous'}
              </Typography>
            </Stack>
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate('/profile');
              setAnchorEl(null);
            }}
          >
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              user.signOut();
              setAnchorEl(null);
            }}
          >
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
