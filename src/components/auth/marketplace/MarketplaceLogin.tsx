import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import MarketplaceAuthService from '../../../api/marketplace/MarketplaceAuthService';
import { useMarketplaceUser } from '../../providers/MarketplaceUserProvider';
import { useProtectedApi } from '../../../components/providers/ApiProvider';

const MarketplaceLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useMarketplaceUser();
  const api = useProtectedApi();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await MarketplaceAuthService.login(username, password);
      setUser(user);

      if (user) {
        await api.console.consoleAuthenticationPut({
          user: {
            ID: user.ID || 0,
            display_name: user.display_name || '',
            user_email: user.user_email || '',
            user_login: user.user_login || '',
          },
          feature_flags: user.feature_flags || { isVendor: false, isWhitelabeled: false },
          jwt: user.jwt || { token: '', token_expires: 0 },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleLogin} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </Box>
  );
};

export default MarketplaceLogin;
