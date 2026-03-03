import React from 'react';
import { useRoutes } from 'react-router-dom';
import InstalledApps from './InstalledApps';
import Marketplace from './Marketplace';
import ServiceMesh from './ServiceMesh';
import System from './System';
import NotFound from './NotFound';
import OpenSource from './OpenSource';
import DeviceLogin from './DeviceLogin';
import Profile from './Profile';
import OAuthCallback from './OAuthCallback';
import Onboarding from './Onboarding';

const UIRoutes: React.FC = () => {
  const routes = useRoutes([
    { path: '/', element: <InstalledApps /> },
    { path: '/onboarding', element: <Onboarding /> },
    { path: '/marketplace', element: <Marketplace /> },
    { path: 'service-mesh', element: <ServiceMesh /> },
    { path: '/system', element: <System /> },
    { path: '/open-source', element: <OpenSource /> },
    { path: '/profile', element: <Profile /> },
    { path: '/device-login', element: <DeviceLogin /> },
    { path: '/oauth/callback', element: <OAuthCallback /> },
    { path: '*', element: <NotFound /> },
  ]);

  return <>{routes}</>;
};

export { UIRoutes };
