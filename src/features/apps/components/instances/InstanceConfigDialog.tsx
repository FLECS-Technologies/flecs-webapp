import { createPortal } from 'react-dom';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X, Usb, Network, Cable, Variable, ExternalLink, GitBranch } from 'lucide-react';
import { getErrorMessage } from '@app/api/fetch-error';
import UsbConfigTab from './tabs/UsbConfigTab';
import NetworkConfigTab from './tabs/NetworkConfigTab';
import PortsConfigTab from './tabs/PortsConfigTab';
import EnvironmentConfigTab from './tabs/EnvironmentConfigTab';
import EditorConfigTab from './tabs/EditorConfigTab';
import {
  postInstancesInstanceIdStop,
  postInstancesInstanceIdStart,
} from '@generated/core/instances/instances';

interface InstanceConfigDialogProps {
  instanceId: string;
  instanceName: string;
  open: boolean;
  onClose: () => void;
  versionSection?: React.ReactNode;
  initialSection?: SectionKey;
}

const sections = [
  { key: 'usb', label: 'USB Devices', icon: Usb },
  { key: 'network', label: 'Network', icon: Network },
  { key: 'ports', label: 'Ports', icon: Cable },
  { key: 'env', label: 'Environment', icon: Variable },
  { key: 'editors', label: 'Editors', icon: ExternalLink },
] as const;

export type SectionKey = (typeof sections)[number]['key'] | 'version';

const InstanceConfigDialog: React.FC<InstanceConfigDialogProps> = ({
  instanceId,
  instanceName,
  open,
  onClose,
  versionSection,
  initialSection,
}) => {
  const defaultSection: SectionKey = versionSection ? 'version' : 'usb';
  const [activeSection, setActiveSection] = useState<SectionKey>(initialSection ?? defaultSection);
  const [hasChanges, setHasChanges] = useState(false);

  // The dialog stays mounted while closed, so activeSection would otherwise
  // retain the last-visited tab. Reset to the requested section each time it
  // opens so e.g. "Update" always lands on the Version tab.
  useEffect(() => {
    if (open) setActiveSection(initialSection ?? defaultSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialSection]);

  const handleClose = () => {
    const needsRestart = hasChanges;
    setHasChanges(false);
    // Close immediately. The restart (stop → start) is an instance reboot that can
    // take several seconds; awaiting it before onClose() left the dialog open and
    // unresponsive (the X also runs handleClose, so it appeared frozen) until the
    // instance came back. Run it in the background and report the outcome via toast.
    onClose();
    if (needsRestart) {
      void (async () => {
        const toastId = toast.loading(`Restarting ${instanceName}…`);
        try {
          await postInstancesInstanceIdStop(instanceId);
          await postInstancesInstanceIdStart(instanceId);
          toast.success(`${instanceName} restarted`, { id: toastId });
        } catch (error) {
          toast.error(getErrorMessage(error), { id: toastId });
        }
      })();
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-surface-raised rounded-2xl overflow-hidden flex shadow-2xl border border-border w-full max-w-4xl"
        style={{ height: '70vh', maxHeight: 640 }}
      >
        {/* Sidebar */}
        <div className="w-[220px] shrink-0 border-r border-border flex flex-col bg-surface-subtle">
          <div className="px-4 py-4">
            <span className="text-sm font-bold truncate block">{instanceName}</span>
            <span className="text-xs text-muted">Settings</span>
          </div>
          <hr className="border-border" />
          <nav className="flex-1 py-1">
            {versionSection && (
              <button
                onClick={() => setActiveSection('version')}
                className={`flex items-center gap-3 w-52 mx-1 px-3 py-3 rounded-lg text-sm transition ${activeSection === 'version' ? 'bg-surface-hover font-medium' : 'hover:bg-surface-hover'}`}
              >
                <GitBranch size={16} /> Version
              </button>
            )}
            {sections.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`flex items-center gap-3 w-52 mx-1 px-3 py-3 rounded-lg text-sm transition ${activeSection === key ? 'bg-surface-hover font-medium' : 'hover:bg-surface-hover'}`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
          <hr className="border-border" />
          <div className="p-3">
            <button
              onClick={handleClose}
              className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition ${hasChanges ? 'bg-brand text-white hover:bg-brand-end' : 'border border-border hover:bg-surface-hover'}`}
            >
              {hasChanges ? 'Save & Restart' : 'Close'}
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto relative">
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 z-10 p-1.5 rounded-lg bg-surface-hover hover:bg-surface-hover transition"
          >
            <X size={16} />
          </button>
          <div className="p-6">
            <h6 className="text-base font-bold mb-1">
              {activeSection === 'version'
                ? 'Version'
                : sections.find((s) => s.key === activeSection)?.label}
            </h6>
            <p className="text-sm text-muted mb-4">
              {activeSection === 'version' && 'Change or update the app version.'}
              {activeSection === 'usb' && 'Configure USB device passthrough.'}
              {activeSection === 'network' && 'Configure network interfaces.'}
              {activeSection === 'ports' && 'Configure port mappings.'}
              {activeSection === 'env' && 'Configure environment variables.'}
              {activeSection === 'editors' && 'Configure editor URLs and reverse proxy.'}
            </p>
            <hr className="border-border mb-4" />
            {activeSection === 'version' && versionSection}
            {activeSection === 'usb' && (
              <UsbConfigTab instanceId={instanceId} onChange={setHasChanges} />
            )}
            {activeSection === 'network' && (
              <NetworkConfigTab instanceId={instanceId} onChange={setHasChanges} />
            )}
            {activeSection === 'ports' && (
              <PortsConfigTab instanceId={instanceId} onChange={setHasChanges} />
            )}
            {activeSection === 'env' && (
              <EnvironmentConfigTab instanceId={instanceId} onChange={setHasChanges} />
            )}
            {activeSection === 'editors' && (
              <EditorConfigTab instanceId={instanceId} onChange={setHasChanges} />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
export default InstanceConfigDialog;
