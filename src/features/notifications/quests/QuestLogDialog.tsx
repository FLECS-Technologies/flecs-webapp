import { createPortal } from 'react-dom';
import React from 'react';
import { Trash2 } from 'lucide-react';
import { QuestLog } from './QuestLog';
import { useQuestActions } from '../hooks';
import { useQuestStore } from '@stores/quests';

interface QuestLogProps {
  open: boolean;
  onClose: () => void;
}

const QuestLogDialog: React.FC<QuestLogProps> = ({ open, onClose }) => {
  const { clearQuests } = useQuestActions();
  const hasQuests = useQuestStore((s) => s.mainQuestIds.length > 0);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50" onClick={onClose}>
      <div className="bg-dark-end rounded-xl w-full max-w-3xl mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Quest Log</h2>
        </div>
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <QuestLog />
        </div>
        <div className="flex justify-end gap-2 px-6 py-3 border-t border-white/10">
          {hasQuests && (
            <button onClick={() => clearQuests()} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg hover:bg-white/10 transition">
              <Trash2 size={16} /> Remove finished
            </button>
          )}
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-muted rounded-lg hover:bg-white/10 transition">Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuestLogDialog;
