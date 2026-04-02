import React from 'react';
import { useQuestStore } from '@stores/quests';
import { useQuestPolling } from '../hooks';
import { QuestLogEntry } from './QuestLogEntry';

export const QuestLog: React.FC = () => {
  const mainQuestIds = useQuestStore((s) => s.mainQuestIds);
  useQuestPolling();

  return (
    <div className="mt-4 mx-auto max-w-3xl">
      {mainQuestIds.map((id) => (
        <QuestItem key={id} id={id} />
      ))}
      {mainQuestIds.length === 0 && (
        <p className="text-muted mb-2">No quests present</p>
      )}
    </div>
  );
};
