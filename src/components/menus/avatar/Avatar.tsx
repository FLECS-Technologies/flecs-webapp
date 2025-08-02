import { Login, Person } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import React from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { appBarIconColors } from '../../../styles/tokens';

export default function Avatar() {
  const [anchorElMenu, setAnchorElMenu] = React.useState<HTMLElement | null>(null);
  const user = useAuth();
  const navigate = useNavigate();

  interface MenuEventHandler {
    (event: React.MouseEvent<HTMLElement>): void;
  }

  const handleMenu: MenuEventHandler = (event) => {
    setAnchorElMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorElMenu(null);
  };

  const handleSignout = async () => {
    user.signoutRedirect({
      extraQueryParams: {
        post_logout_redirect_uri: `${window.location.origin}`,
      },
    });

    setAnchorElMenu(null);
  };

  const handleSignIn = () => {
    navigate('/splash-screen');
  };

  const handleProfile = () => {
    navigate('/profile');
    setAnchorElMenu(null);
  };

  // React.useEffect(() => {}, [user]);
  return (
    <div>
      <IconButton
        aria-label="avatar-button"
        component="span"
        onClick={user?.user ? handleMenu : handleSignIn}
        size="small"
        sx={{ color: appBarIconColors.primary }}
      >
        {user?.user ? (
          <Person aria-label="user-menu-button" />
        ) : (
          <Login aria-label="login-button" />
        )}
      </IconButton>
      <Menu
        id="user-menu"
        aria-label="user-menu"
        anchorEl={anchorElMenu}
        keepMounted
        open={Boolean(anchorElMenu)}
        onClose={handleCloseMenu}
      >
        <MenuItem divider={true} style={{ pointerEvents: 'none' }}>
          <Stack>
            <Typography variant="caption">Signed in as</Typography>
            <Typography variant="caption" style={{ fontWeight: 600 }}>
              {user?.user?.profile.preferred_username}
            </Typography>
          </Stack>
        </MenuItem>
        <MenuItem onClick={handleProfile}>Profile</MenuItem>
        <MenuItem onClick={handleSignout}>Sign out</MenuItem>
      </Menu>
    </div>
  );
}
