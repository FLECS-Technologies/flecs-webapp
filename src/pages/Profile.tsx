import { Typography } from '@mui/material';
import React from 'react';
import { useAuth } from 'react-oidc-context';

export default function Profile() {
  const auth = useAuth();
  return (
    <div>
      <Typography>{JSON.stringify(auth, null, 2)}</Typography>
    </div>
  );
}
