import React from 'react';
import {
  Drawer as MuiDrawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Stack,
  IconButton,
  Badge,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search,
  Download,
  Network,
  Settings,
  User,
  LogIn,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Sun,
  Moon,
  ChevronsLeft,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { brand } from '@app/theme/tokens';
import { useUIStore } from '@stores/ui';
import { useAppList } from '@shared/hooks/app-queries';
import { useMarketplaceProducts } from '@shared/hooks/marketplace-queries';
import { useOAuth4WebApiAuth } from '@features/auth/providers/OAuth4WebApiAuthProvider';
import { DeviceActivationContext } from '@shared/contexts/DeviceActivationContext';
import { useNotificationStore } from '@stores/notifications';
import { useDarkMode } from '@app/theme/ThemeHandler';
import FLECSLogo from './FLECSLogo';

const DRAWER_WIDTH = 220;
const COLLAPSED_WIDTH = 60;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const appsNav: NavItem[] = [
  { label: 'Browse', icon: <Search size={18} />, path: '/marketplace' },
  { label: 'Installed', icon: <Download size={18} />, path: '/' },
];

const deviceNav: NavItem[] = [
  { label: 'Service Mesh', icon: <Network size={18} />, path: '/service-mesh' },
  { label: 'System', icon: <Settings size={18} />, path: '/system' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);
  const { appList } = useAppList();
  const { data: marketplaceProducts } = useMarketplaceProducts();
  const user = useOAuth4WebApiAuth();
  const { activated } = React.useContext(DeviceActivationContext);
  const { isDarkMode, setDarkMode } = useDarkMode();
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<HTMLElement | null>(null);

  // Notifications
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const notifications = useNotificationStore((s) => s.notifications);
  const [notifAnchor, setNotifAnchor] = React.useState<HTMLElement | null>(null);

  const installedCount = (appList ?? []).filter((a: any) => a?.status === 'installed').length;
  const browseCount = (marketplaceProducts ?? []).length;

  // On mobile, never use collapsed mode
  const isCollapsed = !isMobile && collapsed;
  const drawerWidth = isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const renderNavItem = (item: NavItem, badge?: number) => {
    const isActive = location.pathname === item.path;
    const button = (
      <ListItemButton
        key={item.path}
        selected={isActive}
        onClick={() => navigate(item.path)}
        sx={{
          borderRadius: 1.5,
          mx: isCollapsed ? 0.75 : 1,
          mb: 0.25,
          py: 0.75,
          px: isCollapsed ? 0 : 1.5,
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          '&.Mui-selected': {
            bgcolor: 'rgba(255, 46, 99, 0.12)',
            color: brand.primary,
            '& .MuiListItemIcon-root': { color: brand.primary },
          },
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.06)',
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: isCollapsed ? 0 : 32,
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {!isCollapsed && (
          <ListItemText
            primary={item.label}
            slotProps={{ primary: { variant: 'body2', fontWeight: isActive ? 600 : 400, fontSize: '0.85rem' } }}
          />
        )}
        {!isCollapsed && badge !== undefined && badge > 0 && (
          <Chip
            label={badge}
            size="small"
            sx={{
              height: 18,
              minWidth: 18,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: isActive ? `${brand.primary}30` : 'action.selected',
              color: isActive ? brand.primary : 'text.secondary',
            }}
          />
        )}
        {isCollapsed && badge !== undefined && badge > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              right: isCollapsed ? 8 : undefined,
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: isActive ? brand.primary : 'text.disabled',
            }}
          />
        )}
      </ListItemButton>
    );

    return isCollapsed ? (
      <Tooltip key={item.path} title={item.label} placement="right" arrow>
        {button}
      </Tooltip>
    ) : (
      button
    );
  };

  return (
    <MuiDrawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? sidebarOpen : true}
      onClose={isMobile ? toggleSidebar : undefined}
      ModalProps={isMobile ? { keepMounted: true } : undefined}
      sx={{
        width: isMobile ? 0 : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isMobile ? DRAWER_WIDTH : drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          transition: 'width 200ms ease',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Logo header */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{ px: isCollapsed ? 0 : 1.5, py: 1, minHeight: 48, justifyContent: isCollapsed ? 'center' : 'flex-start' }}
      >
        {isCollapsed ? (
          <Tooltip title="Expand sidebar" placement="right" arrow>
            <IconButton size="small" onClick={toggleCollapsed} sx={{ color: 'text.secondary' }}>
              <FLECSLogo logoColor={brand.primary} />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, pl: 0.5 }}>
              <FLECSLogo logoColor={brand.primary} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: brand.white }}>
                FLECS
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                setNotifAnchor(e.currentTarget);
                markAllRead();
              }}
              sx={{ color: 'text.secondary' }}
              aria-label="Notifications"
            >
              <Badge badgeContent={unreadCount} color="error" max={9}>
                <Bell size={16} />
              </Badge>
            </IconButton>
            <IconButton
              size="small"
              onClick={toggleCollapsed}
              sx={{ color: 'text.disabled', ml: 0.25 }}
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft size={16} />
            </IconButton>
          </>
        )}
      </Stack>

      {/* Notification popover */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 300, maxHeight: 400, borderRadius: 2 } } }}
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

      <nav aria-label="Main navigation" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* APPS section */}
        {!isCollapsed && (
          <Typography variant="overline" color="text.disabled" sx={{ px: 2.5, pt: 1, pb: 0.25, display: 'block', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
            APPS
          </Typography>
        )}
        {isCollapsed && <Box sx={{ pt: 0.5 }} />}
        <List sx={{ pt: 0, pb: 0 }}>
          {renderNavItem(appsNav[0], browseCount)}
          {renderNavItem(appsNav[1], installedCount)}
        </List>

        {/* DEVICE section */}
        {!isCollapsed ? (
          <Typography variant="overline" color="text.disabled" sx={{ px: 2.5, pt: 1.5, pb: 0.25, display: 'block', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
            DEVICE
          </Typography>
        ) : (
          <Divider sx={{ mx: 1, my: 0.5 }} />
        )}
        <List sx={{ pt: 0, pb: 0 }}>
          {deviceNav.map((item) => renderNavItem(item))}
        </List>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Collapsed: bell icon above profile */}
        {isCollapsed && (
          <Tooltip title="Notifications" placement="right" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                setNotifAnchor(e.currentTarget);
                markAllRead();
              }}
              sx={{ color: 'text.secondary', alignSelf: 'center', mb: 0.5 }}
              aria-label="Notifications"
            >
              <Badge badgeContent={unreadCount} color="error" max={9}>
                <Bell size={16} />
              </Badge>
            </IconButton>
          </Tooltip>
        )}

        {/* Profile footer */}
        {isCollapsed ? (
          <Tooltip title={user?.user ? user.user.preferred_username : 'Sign in'} placement="right" arrow>
            <Box
              component="button"
              onClick={(e: React.MouseEvent<HTMLElement>) => setUserMenuAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                py: 1.5,
                border: 'none',
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'transparent',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: user?.user ? brand.primary : 'action.selected',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {user?.user ? (user.user.preferred_username?.[0] ?? '').toUpperCase() : <LogIn size={14} />}
              </Avatar>
            </Box>
          </Tooltip>
        ) : (
          <Box
            component="button"
            onClick={(e: React.MouseEvent<HTMLElement>) => setUserMenuAnchor(e.currentTarget)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: '100%',
              px: 1.5,
              py: 1,
              border: 'none',
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: user?.user ? brand.primary : 'action.selected',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {user?.user ? (user.user.preferred_username?.[0] ?? '').toUpperCase() : <LogIn size={14} />}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} fontSize="0.8rem" noWrap>
                {user?.user ? user.user.preferred_username : 'Sign in'}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {activated ? (
                  <ShieldCheck size={11} color={brand.primary} />
                ) : (
                  <ShieldAlert size={11} style={{ opacity: 0.5 }} />
                )}
                <Typography variant="caption" color="text.disabled" fontSize="0.65rem" noWrap>
                  {window.location.hostname}
                </Typography>
              </Stack>
            </Box>
          </Box>
        )}

        {/* Profile menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={() => setUserMenuAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: isCollapsed ? 'right' : 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: isCollapsed ? 'left' : 'center' }}
          slotProps={{ paper: { sx: { width: 200, borderRadius: 2 } } }}
        >
          {user?.user && (
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  Signed in as
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {user.user.preferred_username}
                </Typography>
              </Stack>
            </MenuItem>
          )}
          {user?.user && (
            <MenuItem
              onClick={() => {
                navigate('/profile');
                setUserMenuAnchor(null);
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}><User size={16} /></ListItemIcon>
              Profile
            </MenuItem>
          )}
          <Divider />
          <MenuItem
            onClick={() => {
              setDarkMode(!isDarkMode);
              setUserMenuAnchor(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </ListItemIcon>
            {isDarkMode ? 'Light mode' : 'Dark mode'}
          </MenuItem>
          <Divider />
          {user?.user ? (
            <MenuItem
              onClick={() => {
                user.signOut();
                setUserMenuAnchor(null);
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: 'error.main' }}><LogIn size={16} /></ListItemIcon>
              Sign out
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                navigate('/device-login');
                setUserMenuAnchor(null);
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}><LogIn size={16} /></ListItemIcon>
              Sign in
            </MenuItem>
          )}
        </Menu>
      </nav>
    </MuiDrawer>
  );
}
