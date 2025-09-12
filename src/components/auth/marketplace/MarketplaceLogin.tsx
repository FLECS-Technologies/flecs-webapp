import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import MarketplaceAuthService from '../../../api/marketplace/MarketplaceAuthService';
import { useMarketplaceUser } from '../../providers/MarketplaceUserProvider';

const MarketplaceLogin: React.FC = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const { setUser } = useMarketplaceUser();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const user = await MarketplaceAuthService.login(username, password);
			setUser(user);
		} catch (err: any) {
			setError(err.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box component="form" onSubmit={handleLogin} sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
			<Typography variant="h5" mb={2}>Marketplace Login</Typography>
			<TextField
				label="Username"
				value={username}
				onChange={e => setUsername(e.target.value)}
				fullWidth
				margin="normal"
				required
			/>
			<TextField
				label="Password"
				type="password"
				value={password}
				onChange={e => setPassword(e.target.value)}
				fullWidth
				margin="normal"
				required
			/>
			{error && <Typography color="error" mb={2}>{error}</Typography>}
			<Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
				{loading ? 'Logging in...' : 'Login'}
			</Button>
		</Box>
	);
};

export default MarketplaceLogin;