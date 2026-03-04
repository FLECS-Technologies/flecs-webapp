import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { User, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useOAuth4WebApiAuth } from '@features/auth/providers/OAuth4WebApiAuthProvider';
import { brand } from '@app/theme/tokens';
import SettingsCard from '@shared/components/SettingsCard';

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
    user?.realm_access?.roles?.forEach((role) => roles.add(role));
    if (user?.resource_access) {
      Object.values(user.resource_access).forEach((resource) => {
        resource.roles?.forEach((role) => roles.add(role));
      });
    }
    return Array.from(roles);
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* ── Account (avatar card — like Vercel) ── */}
        <SettingsCard
          title="Account"
          description="Your account identity from the identity provider."
          footer="Account details are managed by your administrator."
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" component="h1" fontWeight={700}>
                {user?.preferred_username || 'Anonymous'}
              </Typography>
              <Chip
                label={auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                color={auth.isAuthenticated ? 'success' : 'error'}
                size="small"
                sx={{ fontWeight: 600, mt: 1 }}
              />
            </Box>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: `${brand.primary}14`,
                color: brand.primary,
                fontSize: '1.75rem',
                fontWeight: 700,
                border: '2px solid',
                borderColor: `${brand.primary}28`,
              }}
            >
              {user?.preferred_username ? getInitials(user.preferred_username) : <User size={20} />}
            </Avatar>
          </Stack>
        </SettingsCard>

        {/* ── User Information ── */}
        <SettingsCard
          title="User Information"
          description="Your account details from the identity provider."
          footer="Account details are managed by your administrator."
        >
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ width: 160, flexShrink: 0 }}>
                Username:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {user?.preferred_username || 'Not available'}
              </Typography>
            </Stack>
            {user?.email && (
              <Stack direction="row" alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ width: 160, flexShrink: 0 }}>
                  Email:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {/*{user.email}*/}-
                </Typography>
              </Stack>
            )}
            <Stack direction="row" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ width: 160, flexShrink: 0 }}>
                User ID:
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                }}
              >
                -{/*{user?.sub || 'Not available'}*/}
              </Typography>
            </Stack>
          </Stack>
        </SettingsCard>

        {/* ── Roles & Permissions ── */}
        {getRoles().length > 0 && (
          <SettingsCard
            title="Roles & Permissions"
            description="Your access level and permissions on this device."
            footer="Roles are assigned by your identity provider."
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {getRoles().map((role) => (
                <Chip
                  key={role}
                  label={role}
                  color="primary"
                  variant="outlined"
                  size="small"
                  icon={<Shield size={16} />}
                  sx={{ fontWeight: 500 }}
                />
              ))}
            </Box>
          </SettingsCard>
        )}

        {/* ── Login Information ── */}
        <SettingsCard
          title="Login Information"
          description="Your current authentication session details."
          footer="Sessions are managed by your identity provider."
        >
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ width: 160, flexShrink: 0 }}>
                Login Expires:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatTokenExpiration(user?.exp)}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ width: 160, flexShrink: 0 }}>
                Authentication Status:
              </Typography>
              <Chip
                label={auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                color={auth.isAuthenticated ? 'success' : 'error'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Stack>
        </SettingsCard>

        {/* ── End Session (danger) ── */}
        <SettingsCard
          danger
          title="End Session"
          description="Sign out and end your current session on this device. You will be redirected to the login page."
          footer="This will not affect other active sessions."
          footerAction={
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogOut size={14} />}
              onClick={handleSignOut}
              disabled={isSigningOut}
              loading={isSigningOut}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2.5 }}
            >
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          }
        />
      </Stack>
    </Box>
  );
}
