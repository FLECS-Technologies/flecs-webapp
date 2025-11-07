import { Typography } from '@mui/material';
import React from 'react';
import { useOAuth4WebApiAuth } from '../components/providers/OAuth4WebApiAuthProvider';

export default function Profile() {
  const auth = useOAuth4WebApiAuth();
  return (
    <div>
      <Typography>{JSON.stringify(auth, null, 2)}</Typography>
    </div>
  );
}
