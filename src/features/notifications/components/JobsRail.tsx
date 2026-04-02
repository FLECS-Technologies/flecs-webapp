import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useQuestActions, useQuestPolling } from '@features/notifications/quests/hooks';
import { useQuestStore } from '@stores/quests';
import { QuestItem } from '@features/notifications/quests/QuestItem';

export default function JobsRail() {
  const mainQuestIds = useQuestStore((s) => s.mainQuestIds);
  const { clearQuests } = useQuestActions();
  useQuestPolling();
  const [expanded, setExpanded] = useState(false);

  const questCount = mainQuestIds.length;
  const hasQuests = questCount > 0;

  if (!hasQuests) return null;

  return (
    <div
      aria-label="Active jobs"
      className="fixed bottom-0 left-0 md:left-[220px] right-0 z-50 rounded-t-xl bg-dark-end overflow-hidden shadow-lg"
    >
      <div
        className="flex items-center px-2 py-1 cursor-pointer hover:bg-white/5 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm font-semibold flex-1">Jobs</span>
        <span className="px-2 py-0.5 rounded-full bg-brand/20 text-brand text-xs font-medium mr-1" role="status">
          {questCount}
        </span>
        <button
          className="p-1.5 rounded-lg hover:bg-white/10 transition mr-0.5"
          title="Clear finished"
          onClick={(e) => {
            e.stopPropagation();
            clearQuests();
          }}
        >
          <Trash2 size={16} />
        </button>
        <button
          className="p-1.5 rounded-lg hover:bg-white/10 transition"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse jobs' : 'Expand jobs'}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="max-h-[300px] overflow-y-auto px-1 pb-2">
          {mainQuestIds.map((id) => (
            <QuestItem key={id} id={id} />
          ))}
        </div>
      )}
    </div>
  );
}
