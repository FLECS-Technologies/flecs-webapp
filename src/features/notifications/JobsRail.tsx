import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useQuestActions, useQuestPolling } from '@features/notifications/quests/hooks';
import { useQuestStore, getQuest } from '@stores/quests';
import { QuestItem, questFinished } from '@features/notifications/quests/QuestItem';
import { QuestState } from '@generated/schemas';

export default function JobsRail() {
  const mainQuestIds = useQuestStore((s) => s.mainQuestIds);
  const { clearQuests } = useQuestActions();
  useQuestPolling();
  const [expanded, setExpanded] = useState(false);

  if (!mainQuestIds.length) return null;

  const quests = mainQuestIds.map(getQuest).filter(Boolean);
  const running = quests.filter((q) => q && !questFinished(q)).length;
  const total = quests.length;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      {/* Collapsed pill */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-overlay/95 backdrop-blur-sm border border-border shadow-lg hover:bg-surface-hover transition"
      >
        {running > 0 ? (
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
          </span>
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-success shrink-0" />
        )}
        <span className="text-sm font-semibold flex-1 text-left text-text-primary">
          {running > 0 ? `${running} running` : 'All done'}
        </span>
        <span className="text-xs text-muted">{total}</span>
        {expanded ? <ChevronDown size={16} className="text-muted" /> : <ChevronUp size={16} className="text-muted" />}
      </button>

      {/* Expanded quest list */}
      {expanded && (
        <div className="mt-1 rounded-xl bg-surface-overlay/95 backdrop-blur-sm border border-border shadow-lg overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto p-2">
            {mainQuestIds.map((id) => (
              <QuestItem key={id} id={id} />
            ))}
          </div>
          <div className="flex justify-end px-3 py-2 border-t border-border">
            <button
              onClick={(e) => { e.stopPropagation(); clearQuests(); }}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-text-primary transition"
            >
              <Trash2 size={12} /> Clear finished
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
