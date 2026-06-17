import React from 'react';
import { useRoutes } from 'react-router-dom';
import InstalledApps from './InstalledApps';
import Marketplace from './Marketplace';
import System from './System';
import NotFound from './NotFound';
import OpenSource from './OpenSource';
import Profile from './Profile';
import OAuthCallback from './OAuthCallback';

const UIRoutes: React.FC = () => {
  const routes = useRoutes([
    { path: '/', element: <InstalledApps /> },
    { path: '/marketplace', element: <Marketplace /> },
    { path: '/system', element: <System /> },
    { path: '/open-source', element: <OpenSource /> },
    { path: '/profile', element: <Profile /> },
    { path: '/oauth/callback', element: <OAuthCallback /> },
    { path: '*', element: <NotFound /> },
  ]);

  return <>{routes}</>;
};

export { UIRoutes };
