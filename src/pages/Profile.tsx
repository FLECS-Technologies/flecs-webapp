import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Container,
  Divider,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import { Person, Security, ExitToApp, AdminPanelSettings } from '@mui/icons-material';
import React, { useState } from 'react';
import { useOAuth4WebApiAuth } from '@contexts/auth/OAuth4WebApiAuthProvider';
import { colors } from '../whitelabeling/custom-tokens';

export default function Profile() {
  const auth = useOAuth4WebApiAuth();
  const user = auth.user;
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTokenExpiration = (exp?: number) => {
    if (!exp) return 'Unknown';
    const expDate = new Date(exp * 1000);
    return expDate.toLocaleString();
  };

  const getRoles = () => {
    const roles = new Set<string>();

    // Add realm roles
    user?.realm_access?.roles?.forEach((role) => roles.add(role));

    // Add resource roles
    if (user?.resource_access) {
      Object.values(user.resource_access).forEach((resource) => {
        resource.roles?.forEach((role) => roles.add(role));
      });
    }

    return Array.from(roles);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={2} sx={{ overflow: 'hidden' }}>
        {/* Header Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.background || '#764ba2'} 100%)`,
            color: 'white',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              bgcolor: `${colors.accent}33`,
              fontSize: '2rem',
              fontWeight: 'bold',
            }}
          >
            {user?.preferred_username ? getInitials(user.preferred_username) : <Person />}
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom>
            {user?.preferred_username || 'Anonymous'}
          </Typography>
          {user?.email && (
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {/*{user.email}*/}
            </Typography>
          )}
        </Box>

        {/* Content Section */}
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            {/* User Information */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Person color="primary" />
                User Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography color="text.secondary">Username:</Typography>
                  <Typography fontWeight="medium">
                    {user?.preferred_username || 'Not available'}
                  </Typography>
                </Box>
                {user?.email && (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography color="text.secondary">Email:</Typography>
                    <Typography fontWeight="medium">{/*{user.email}*/}-</Typography>
                  </Box>
                )}
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography color="text.secondary">User ID:</Typography>
                  <Typography fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                    -{/*{user?.sub || 'Not available'}*/}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Roles and Permissions */}
            {getRoles().length > 0 && (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <AdminPanelSettings color="primary" />
                  Roles & Permissions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {getRoles().map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      color="primary"
                      variant="outlined"
                      size="small"
                      icon={<Security />}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Session Information */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Security color="primary" />
                Login Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography color="text.secondary">Login Expires:</Typography>
                  <Typography fontWeight="medium">{formatTokenExpiration(user?.exp)}</Typography>
                </Box>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography color="text.secondary">Authentication Status:</Typography>
                  <Chip
                    label={auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                    color={auth.isAuthenticated ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Stack>
            </Box>
          </Stack>
        </CardContent>

        <Divider />
        <CardActions sx={{ justifyContent: 'center', p: 3 }}>
          <Button
            variant="contained"
            startIcon={<ExitToApp />}
            onClick={handleSignOut}
            disabled={isSigningOut}
            loading={isSigningOut}
          >
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
}
