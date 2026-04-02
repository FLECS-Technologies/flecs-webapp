import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Hourglass, Ban, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { Quest, QuestState, QuestProgress } from '@generated/core/schemas';
import { getQuest } from '@stores/quests';

// ── State helpers (inlined from utils/) ──

const isFinished = (s: QuestState) => s !== QuestState.failing && s !== QuestState.ongoing && s !== QuestState.pending;
export const isFinishedOk = (s: QuestState) => s === QuestState.success || s === QuestState.skipped;
export const questStateFinishedOk = isFinishedOk;
const isRunning = (s: QuestState) => s === QuestState.failing || s === QuestState.ongoing;
const hasFailedSub = (q: Quest): boolean => q.subquests?.some((s) => s.state === QuestState.failed || s.state === QuestState.failing || hasFailedSub(s)) ?? false;
export const questFinished = (q: Quest) => isFinished(q.state);

const borderColor = (s: QuestState) => {
  if (s === QuestState.failed || s === QuestState.failing) return 'border-error/75';
  if (s === QuestState.success) return 'border-success/75';
  return 'border-transparent';
};

const progressBg = (s: QuestState) => {
  if (s === QuestState.failed || s === QuestState.failing) return 'bg-error';
  if (s === QuestState.success) return 'bg-success';
  return 'bg-accent';
};

// ── Icon ──

function QuestIcon({ state }: { state: QuestState }) {
  switch (state) {
    case QuestState.failed: case QuestState.failing: return <AlertCircle size={18} className="text-error shrink-0" />;
    case QuestState.success: return <CheckCircle2 size={18} className="text-success shrink-0" />;
    case QuestState.pending: return <Hourglass size={18} className="opacity-50 shrink-0" />;
    case QuestState.skipped: return <Ban size={18} className="opacity-50 shrink-0" />;
    default: return <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full shrink-0" />;
  }
}

// ── Progress bar ──

function Progress({ progress, state }: { progress: QuestProgress; state: QuestState }) {
  const pct = (100 * progress.current) / (progress.total || progress.current);
  return (
    <div className="w-full mt-1">
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${progressBg(state)}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[11px] text-muted">{progress.current} of {progress.total ?? '?'}</span>
        <span className="text-[11px] text-muted">{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

// ── Subquest progress ──

function SubProgress({ subquests, state }: { subquests: Quest[]; state: QuestState }) {
  if (!subquests.length) return null;
  const total = subquests.length;
  const done = subquests.filter(questFinished).length;
  const running = subquests.filter((q) => isRunning(q.state)).length;
  const pct = (done / total) * 100;
  return (
    <div className="w-full mt-1">
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${progressBg(state)}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-0.5 text-[11px] text-muted">
        <span>{done} done</span><span>{running} running</span><span>{total - done - running} pending</span>
      </div>
    </div>
  );
}

// ── Quest Item (recursive) ──

export function QuestItem({ id, level = 0 }: { id: number; level?: number }) {
  const quest = getQuest(id);
  const [open, setOpen] = useState(false);
  if (!quest) return null;

  const hasSubs = (quest.subquests?.length ?? 0) > 0;

  return (
    <div className={`ml-2 border-l-4 ${borderColor(quest.state)} pl-2 py-1`}>
      <div
        className={`flex flex-col gap-0.5 ${hasSubs ? 'cursor-pointer' : ''}`}
        onClick={hasSubs ? () => setOpen(!open) : undefined}
      >
        <div className="flex items-center gap-2">
          <QuestIcon state={quest.state} />
          {quest.state !== QuestState.failed && hasFailedSub(quest) && <AlertTriangle size={16} className="text-warning shrink-0" />}
          <span className="text-sm flex-1">{quest.description}</span>
          {hasSubs && (open ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </div>
        {quest.detail && <span className="text-[11px] text-muted ml-6">{quest.detail}</span>}
        {quest.progress && !isFinishedOk(quest.state) && <Progress progress={quest.progress} state={quest.state} />}
        {quest.subquests && !isFinishedOk(quest.state) && <SubProgress subquests={quest.subquests} state={quest.state} />}
      </div>
      {open && hasSubs && level < 10 && (
        <div className="mt-1">
          {quest.subquests!.map((sub) => <QuestItem key={sub.id} id={sub.id} level={level + 1} />)}
        </div>
      )}
    </div>
  );
}
