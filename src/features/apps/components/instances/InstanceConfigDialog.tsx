import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Cable,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitBranch,
  LoaderCircle,
  Network,
  Usb,
  Variable,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@app/api/fetch-error';
import { unwrapSuccess } from '@app/api/unwrap';
import ConfirmDialog from '@app/components/ConfirmDialog';
import {
  getGetInstancesQueryKey,
  postInstancesInstanceIdStart,
  postInstancesInstanceIdStop,
} from '@generated/core/instances/instances';
import type { Quest } from '@generated/core/schemas';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { isFinishedOk } from '@features/notifications/quests/QuestItem';
import EditorConfigTab from './tabs/EditorConfigTab';
import EnvironmentConfigTab from './tabs/EnvironmentConfigTab';
import NetworkConfigTab from './tabs/NetworkConfigTab';
import PortsConfigTab from './tabs/PortsConfigTab';
import UsbConfigTab from './tabs/UsbConfigTab';
import { useInstanceConfigDraft, type DraftSection } from './useInstanceConfigDraft';

interface InstanceConfigDialogProps {
  instanceId: string;
  instanceName: string;
  instanceIsRunning: boolean;
  onClose: () => void;
  versionSection?: ReactNode;
  initialSection?: SectionKey;
}

type ConfigSectionKey = 'usb' | 'network' | 'ports' | 'env' | 'editors';
type ConfigSection = {
  key: ConfigSectionKey;
  label: string;
  description: string;
  icon: typeof Usb;
  staged?: DraftSection;
};

const sections: readonly ConfigSection[] = [
  {
    key: 'usb',
    label: 'USB Devices',
    description: 'Choose which host devices this instance can access.',
    icon: Usb,
    staged: 'usb',
  },
  {
    key: 'network',
    label: 'Network',
    description: 'Connect this instance to a host network interface. Changes apply immediately.',
    icon: Network,
  },
  {
    key: 'ports',
    label: 'Ports',
    description: 'Map host traffic to ports inside this instance.',
    icon: Cable,
    staged: 'ports',
  },
  {
    key: 'env',
    label: 'Environment',
    description: 'Set values the app receives when it starts.',
    icon: Variable,
    staged: 'env',
  },
  {
    key: 'editors',
    label: 'Editors',
    description: 'Manage editor addresses and path prefixes. Changes apply immediately.',
    icon: ExternalLink,
  },
] as const;

export type SectionKey = ConfigSectionKey | 'version';
type ApplyState = 'idle' | 'saving' | 'stopping' | 'starting';
type RestartStep = 'stop' | 'start' | null;

const sectionLabels: Record<DraftSection, string> = {
  usb: 'USB Devices',
  ports: 'Ports',
  env: 'Environment',
};

const InstanceConfigDialog = ({
  instanceId,
  instanceName,
  instanceIsRunning,
  onClose,
  versionSection,
  initialSection,
}: InstanceConfigDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const applyLockRef = useRef(false);
  const queryClient = useQueryClient();
  const { waitForQuest } = useQuestActions();
  const config = useInstanceConfigDraft(instanceId);
  const [activeSection, setActiveSection] = useState<SectionKey>(initialSection ?? 'usb');
  const [discardOpen, setDiscardOpen] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [applyState, setApplyState] = useState<ApplyState>('idle');
  const [restartStep, setRestartStep] = useState<RestartStep>(null);
  const [actionError, setActionError] = useState<string>();
  const isBusy = applyState !== 'idle';
  const hasChanges = config.dirtySections.length > 0;
  const activeMetadata = sections.find(({ key }) => key === activeSection);
  const showConfigActions =
    Boolean(activeMetadata?.staged) || hasChanges || Boolean(restartStep) || Boolean(actionError);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open) dialog?.showModal();
  }, []);

  const requestClose = () => {
    if (isBusy) return;
    if (hasChanges) {
      setDiscardOpen(true);
      return;
    }
    onClose();
  };

  const waitForLifecycle = async (
    response: Awaited<
      ReturnType<typeof postInstancesInstanceIdStop | typeof postInstancesInstanceIdStart>
    >,
  ) => {
    const jobId = unwrapSuccess(response)?.jobId;
    if (!jobId) throw new Error('The device did not return a restart job.');
    const result: Quest = await waitForQuest(jobId);
    if (!isFinishedOk(result.state)) {
      throw new Error(result.detail || result.description || 'The restart could not be completed.');
    }
  };

  const applyChanges = async () => {
    if ((!hasChanges && !restartStep) || config.validationError || isBusy || applyLockRef.current)
      return;
    applyLockRef.current = true;
    setActionError(undefined);

    try {
      if (hasChanges) {
        setApplyState('saving');
        await config.apply();
      }

      if (instanceIsRunning) {
        const nextStep = restartStep ?? 'stop';
        if (nextStep === 'stop') {
          setRestartStep('stop');
          setApplyState('stopping');
          await waitForLifecycle(await postInstancesInstanceIdStop(instanceId));
          setRestartStep('start');
        }

        setApplyState('starting');
        await waitForLifecycle(await postInstancesInstanceIdStart(instanceId));
        setRestartStep(null);
      }

      await queryClient.invalidateQueries({ queryKey: getGetInstancesQueryKey() });
      toast.success(
        instanceIsRunning
          ? `${instanceName} settings applied and instance restarting`
          : `${instanceName} settings applied`,
      );
      onClose();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      applyLockRef.current = false;
      setApplyState('idle');
    }
  };

  const buttonLabel =
    applyState === 'saving'
      ? 'Applying...'
      : applyState === 'stopping'
        ? 'Stopping...'
        : applyState === 'starting'
          ? 'Starting...'
          : restartStep === 'start'
            ? 'Start instance'
            : restartStep
              ? 'Restart now'
              : instanceIsRunning
                ? 'Apply & restart'
                : 'Apply changes';

  const renderSection = () => {
    if (activeSection === 'version') return versionSection;
    if (activeSection === 'network') return <NetworkConfigTab instanceId={instanceId} />;
    if (activeSection === 'editors') return <EditorConfigTab instanceId={instanceId} />;

    if (config.loading) {
      return (
        <div className="flex min-h-64 items-center justify-center" aria-label="Loading settings">
          <LoaderCircle className="animate-spin text-brand" size={24} />
        </div>
      );
    }

    if (config.loadError || !config.draft) {
      return (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-border bg-surface-subtle px-6 text-center">
          <AlertCircle className="text-error" size={24} />
          <p className="mt-3 text-sm font-semibold">Settings could not be loaded</p>
          <p className="mt-1 max-w-sm text-xs text-muted">{getErrorMessage(config.loadError)}</p>
          <button
            type="button"
            onClick={() => void config.reload()}
            className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            Try again
          </button>
        </div>
      );
    }

    if (activeSection === 'usb') {
      return <UsbConfigTab devices={config.draft.usb} onToggle={config.toggleUsb} />;
    }
    if (activeSection === 'ports') {
      return <PortsConfigTab rows={config.draft.ports} onChange={config.updatePorts} />;
    }
    if (activeSection === 'env') {
      return (
        <EnvironmentConfigTab rows={config.draft.environment} onChange={config.updateEnvironment} />
      );
    }
    return null;
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        aria-labelledby="instance-settings-title"
        aria-describedby="instance-settings-description"
        onCancel={(event) => {
          event.preventDefault();
          requestClose();
        }}
        onClose={() => {
          onClose();
        }}
        className="m-auto h-[min(720px,92vh)] w-[min(1040px,94vw)] max-w-none overflow-hidden rounded-2xl border border-border bg-surface-raised p-0 text-text-primary shadow-2xl backdrop:bg-black/60"
      >
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
            <div className="min-w-0">
              <h2 id="instance-settings-title" className="truncate text-base font-semibold">
                Instance settings
              </h2>
              <p className="truncate text-xs text-muted">{instanceName}</p>
            </div>
            <button
              type="button"
              aria-label="Close instance settings"
              title="Close"
              disabled={isBusy}
              onClick={requestClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40"
            >
              <X size={18} />
            </button>
          </header>

          <div
            className={`flex min-h-0 flex-1 transition-opacity ${isBusy ? 'opacity-70' : ''}`}
            inert={isBusy}
            aria-busy={isBusy}
          >
            <aside className="w-[224px] shrink-0 border-r border-border bg-surface-subtle p-3">
              <nav aria-label="Instance settings sections">
                <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Configuration
                </p>
                <div className="space-y-1">
                  {versionSection && (
                    <button
                      type="button"
                      aria-current={activeSection === 'version' ? 'page' : undefined}
                      onClick={() => setActiveSection('version')}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        activeSection === 'version'
                          ? 'bg-surface-raised font-semibold text-text-primary shadow-sm ring-1 ring-border'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`}
                    >
                      <GitBranch
                        size={16}
                        className={activeSection === 'version' ? 'text-brand' : 'text-muted'}
                      />
                      <span className="flex-1">Version</span>
                    </button>
                  )}
                  {sections.map(({ key, label, icon: Icon, staged }) => {
                    const active = activeSection === key;
                    const dirty = staged && config.dirtySections.includes(staged);
                    return (
                      <button
                        type="button"
                        key={key}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setActiveSection(key)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          active
                            ? 'bg-surface-raised font-semibold text-text-primary shadow-sm ring-1 ring-border'
                            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                        }`}
                      >
                        <Icon size={16} className={active ? 'text-brand' : 'text-muted'} />
                        <span className="min-w-0 flex-1 truncate">{label}</span>
                        {dirty && (
                          <span
                            className="h-2 w-2 rounded-full bg-brand"
                            title="Unsaved changes"
                            aria-label="Unsaved changes"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>
            </aside>

            <main className="min-w-0 flex-1 overflow-auto">
              <div className="mx-auto max-w-3xl px-7 py-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">
                    {activeSection === 'version' ? 'Version' : activeMetadata?.label}
                  </h3>
                  <p id="instance-settings-description" className="mt-1 text-sm text-muted">
                    {activeSection === 'version'
                      ? 'Choose the version this app and its instances use.'
                      : activeMetadata?.description}
                  </p>
                </div>
                {renderSection()}
              </div>
            </main>
          </div>

          <footer className="shrink-0 border-t border-border bg-surface-raised">
            {showReview && hasChanges && (
              <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-subtle px-5 py-3">
                <span className="mr-1 text-xs font-medium text-muted">Will update:</span>
                {config.dirtySections.map((section) => (
                  <span
                    key={section}
                    className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs font-medium"
                  >
                    {sectionLabels[section]}
                  </span>
                ))}
              </div>
            )}
            {showConfigActions ? (
              <div className="flex min-h-18 items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1" aria-live="polite">
                  {actionError ? (
                    <div className="flex items-center gap-2 text-sm text-error">
                      <AlertCircle size={16} className="shrink-0" />
                      <span className="truncate">{actionError}</span>
                    </div>
                  ) : config.validationError ? (
                    <div className="flex items-center gap-2 text-sm text-warning">
                      <AlertCircle size={16} className="shrink-0" />
                      <span className="truncate">{config.validationError}</span>
                    </div>
                  ) : restartStep ? (
                    <p className="text-sm font-medium text-warning">
                      Changes saved. Restart required.
                    </p>
                  ) : hasChanges ? (
                    <button
                      type="button"
                      onClick={() => setShowReview((value) => !value)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                      aria-expanded={showReview}
                    >
                      {config.dirtySections.length}{' '}
                      {config.dirtySections.length === 1 ? 'unsaved change' : 'unsaved changes'}
                      {showReview ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  ) : (
                    <p className="text-sm text-muted">No pending changes</p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={requestClose}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    (!hasChanges && !restartStep) ||
                    Boolean(config.validationError) ||
                    config.loading ||
                    isBusy
                  }
                  onClick={() => void applyChanges()}
                  className="inline-flex min-w-34 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isBusy && <LoaderCircle size={15} className="animate-spin" />}
                  {buttonLabel}
                </button>
              </div>
            ) : (
              <div className="flex min-h-18 items-center justify-end px-5 py-3">
                <button
                  type="button"
                  onClick={requestClose}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Done
                </button>
              </div>
            )}
          </footer>
        </div>
      </dialog>

      <ConfirmDialog
        title="Discard changes?"
        open={discardOpen}
        setOpen={setDiscardOpen}
        cancelLabel="Keep editing"
        confirmLabel="Discard changes"
        confirmDestructive
        onConfirm={() => {
          config.reset();
          onClose();
        }}
      >
        Your unsaved instance settings will be lost.
      </ConfirmDialog>
    </>
  );
};

export default InstanceConfigDialog;
