/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Aug 05 2025
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Login, Person } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { appBarIconColors } from '../../../styles/tokens';
import { useOAuth4WebApiAuth } from '@contexts/auth/OAuth4WebApiAuthProvider';

export default function Avatar() {
  const [anchorElMenu, setAnchorElMenu] = React.useState<HTMLElement | null>(null);
  const user = useOAuth4WebApiAuth();
  const { signOut } = user;
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
    signOut();

    setAnchorElMenu(null);
  };

  const handleSignIn = () => {
    navigate('/device-login');
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
              {user.user?.preferred_username || 'anonymous'}
            </Typography>
          </Stack>
        </MenuItem>
        <MenuItem onClick={handleProfile}>Profile</MenuItem>
        <MenuItem onClick={handleSignout}>Sign out</MenuItem>
      </Menu>
    </div>
  );
}
