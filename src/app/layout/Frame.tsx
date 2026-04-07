import React from 'react';
import AppBar from './AppBar';
import Drawer from './Drawer';
import CommandPalette from './CommandPalette';
import JobsRail from '@features/notifications/JobsRail';
import { useSearchParams } from 'react-router-dom';

const Frame = ({ children }: { children: React.ReactNode }) => {
  const [searchParams] = useSearchParams();
  const hideChrome = searchParams.get('hideappbar')?.toLowerCase() === 'true';

  if (hideChrome) return <div className="p-4">{children}</div>;

  return (
    <div className="flex min-h-screen">
      <AppBar />
      <Drawer />
      <main className="grow min-w-0 p-4 max-md:p-2 max-md:pt-9">{children}</main>
      <JobsRail />
      <CommandPalette />
    </div>
  );
};

export default Frame;
