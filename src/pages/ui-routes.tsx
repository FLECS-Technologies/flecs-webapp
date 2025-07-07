import React from 'react';
import { useRoutes } from 'react-router-dom';
import InstalledApps from './InstalledApps';
import Marketplace from './Marketplace';
import ServiceMesh from './ServiceMesh';
import System from './System';
import NotFound from './NotFound';
import Login from './Login';
import OpenSource from './OpenSource';

const UIRoutes: React.FC = () => {
  return useRoutes([
    { path: '/', element: <InstalledApps /> },
    { path: '/marketplace', element: <Marketplace /> },
    { path: 'service-mesh', element: <ServiceMesh /> },
    { path: '/system', element: <System /> },
    { path: '/login', element: <Login /> },
    { path: '/open-source', element: <OpenSource /> },
    { path: '*', element: <NotFound /> },
  ]);
};

export { UIRoutes };
