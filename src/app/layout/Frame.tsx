import React from 'react';
import AppBar from './AppBar';
import Drawer from './Drawer';
import CommandPalette from './CommandPalette';
import JobsRail from '@features/notifications/components/JobsRail';
import { useSearchParams } from 'react-router-dom';
import { useQuestStore } from '@stores/quests';

interface FrameProps {
  children: React.ReactNode;
}

const Frame = ({ children }: FrameProps) => {
  const [searchParams] = useSearchParams();
  const hideChrome = searchParams.get('hideappbar')?.toLowerCase() === 'true';
  const hasQuests = useQuestStore((s) => s.mainQuestIds.length > 0);

  if (hideChrome) {
    return <div className="p-4">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <AppBar />
      <Drawer />
      <main
        className={`grow min-w-0 p-4 max-md:p-2 max-md:pt-9 ${hasQuests ? 'pb-8' : ''}`}
      >
        {children}
      </main>
      <JobsRail />
      <CommandPalette />
    </div>
  );
};

export default Frame;
