import { useEffect, useRef, useState } from 'react';
import Logo from '@app/layout/Logo';
import { useTenant } from '@app/theme/TenantContext';

export type StepStatus = 'pending' | 'active' | 'done';

export interface BootStep {
  label: string;
  sublabel: string;
  status: StepStatus;
}

const STUCK_THRESHOLD_MS = 8_000;

export function BootScreen({ steps }: { steps: BootStep[] }) {
  const { app_title, branding } = useTenant();
  const startTimesRef = useRef<(number | undefined)[]>(steps.map(() => undefined));
  const frozenMsRef = useRef<(number | undefined)[]>(steps.map(() => undefined));
  const stuckTimersRef = useRef<(ReturnType<typeof setTimeout> | undefined)[]>(
    steps.map(() => undefined),
  );
  // Initialize all to 'pending' so the first render detects an active step as a real transition.
  const prevStatusesRef = useRef<StepStatus[]>(steps.map(() => 'pending'));

  const [liveMs, setLiveMs] = useState<Record<number, number>>({});
  const [stuckFlags, setStuckFlags] = useState<boolean[]>(steps.map(() => false));

  const statusKey = steps.map((s) => s.status).join(',');

  // Detect step transitions — start timers when active, freeze elapsed when done
  useEffect(() => {
    const prev = prevStatusesRef.current;
    const now = Date.now();

    steps.forEach((step, i) => {
      if (step.status === 'active' && prev[i] !== 'active') {
        startTimesRef.current[i] = now;
        stuckTimersRef.current[i] = setTimeout(() => {
          setStuckFlags((f) => {
            const n = [...f];
            n[i] = true;
            return n;
          });
        }, STUCK_THRESHOLD_MS);
      }
      if (step.status === 'done' && prev[i] === 'active') {
        const start = startTimesRef.current[i];
        if (start !== undefined) frozenMsRef.current[i] = now - start;
        clearTimeout(stuckTimersRef.current[i]);
        stuckTimersRef.current[i] = undefined;
        setStuckFlags((f) => {
          const n = [...f];
          n[i] = false;
          return n;
        });
      }
    });

    prevStatusesRef.current = steps.map((s) => s.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusKey]);

  // Tick live elapsed time for active steps
  useEffect(() => {
    const activeIndices = steps
      .map((s, i) => (s.status === 'active' ? i : -1))
      .filter((i) => i >= 0);
    if (activeIndices.length === 0) return;

    const id = setInterval(() => {
      const now = Date.now();
      setLiveMs((prev) => {
        const next = { ...prev };
        activeIndices.forEach((i) => {
          const start = startTimesRef.current[i];
          if (start !== undefined) next[i] = now - start;
        });
        return next;
      });
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusKey]);

  const doneCount = steps.filter((s) => s.status === 'done').length;
  const hasActive = steps.some((s) => s.status === 'active');
  const progressPct = Math.min(
    100,
    Math.round((doneCount / steps.length) * 100 + (hasActive ? (100 / steps.length) * 0.35 : 0)),
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo className="h-10 w-10" fallbackSize={40} />
          {branding.show_app_title && (
            <p className="text-base font-semibold tracking-tight text-text-primary">{app_title}</p>
          )}
          <p className="text-xs tracking-wide text-muted">Initializing platform</p>
        </div>

        <div className="mb-5 space-y-2">
          {steps.map((step, i) => {
            const frozen = frozenMsRef.current[i];
            const live = liveMs[i];
            const msDisplay =
              step.status === 'done' ? frozen : step.status === 'active' ? live : undefined;
            const elapsedStr =
              step.status === 'done' && msDisplay !== undefined
                ? `${(msDisplay / 1000).toFixed(1)}s`
                : undefined;
            const isStuck = stuckFlags[i] ?? false;

            return (
              <div
                key={i}
                className={[
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-300',
                  step.status === 'done' && 'bg-success/10',
                  step.status === 'active' && 'bg-brand/10',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div
                  className={[
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300',
                    step.status === 'done' && 'bg-success text-white',
                    step.status === 'active' && 'bg-brand text-white',
                    step.status === 'pending' && 'bg-surface-raised text-muted',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step.status === 'done' && '✓'}
                  {step.status === 'active' && (
                    <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {step.status === 'pending' && String(i + 1)}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      'text-sm font-medium leading-none',
                      step.status === 'done' && 'text-success',
                      step.status === 'active' && 'text-text-primary',
                      step.status === 'pending' && 'text-muted',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 truncate font-mono text-[10px] text-muted">
                    {isStuck ? 'Taking longer than expected — checking again…' : step.sublabel}
                  </p>
                </div>

                {elapsedStr && (
                  <p className="shrink-0 font-mono text-[10px] tabular-nums text-muted">
                    {elapsedStr}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="h-px w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
