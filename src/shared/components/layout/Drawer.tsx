import React from 'react';
import {
  Drawer as MuiDrawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LayoutGrid, Store, Network, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { brand } from '@app/theme/tokens';
import { useUIStore } from '@stores/ui';

const DRAWER_WIDTH = 220;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const mainNav: NavItem[] = [
  { label: 'Apps', icon: <LayoutGrid size={20} />, path: '/' },
  { label: 'Marketplace', icon: <Store size={20} />, path: '/marketplace' },
  { label: 'Service Mesh', icon: <Network size={20} />, path: '/service-mesh' },
];

const bottomNav: NavItem[] = [
  { label: 'System', icon: <Settings size={20} />, path: '/system' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    return (
      <ListItemButton
        key={item.path}
        selected={isActive}
        onClick={() => navigate(item.path)}
        sx={{
          borderRadius: 2,
          mx: 2,
          mb: 1,
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
        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
        <ListItemText
          primary={item.label}
          slotProps={{ primary: { variant: 'body2', fontWeight: isActive ? 600 : 400 } }}
        />
      </ListItemButton>
    );
  };

  return (
    <MuiDrawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? sidebarOpen : true}
      onClose={isMobile ? toggleSidebar : undefined}
      ModalProps={isMobile ? { keepMounted: true } : undefined}
      sx={{
        width: isMobile ? 0 : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        },
      }}
    >
      {/* Toolbar spacer */}
      <Box sx={{ height: 64 }} />

      <nav aria-label="Main navigation">
        {/* Main nav */}
        <List sx={{ pt: 2, flex: 1 }}>
          {mainNav.map(renderNavItem)}
        </List>

        <Divider sx={{ mx: 3 }} />

        {/* Bottom nav */}
        <List sx={{ pb: 2 }}>
          {bottomNav.map(renderNavItem)}
        </List>
      </nav>
    </MuiDrawer>
  );
}
