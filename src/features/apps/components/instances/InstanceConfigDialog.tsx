import React, { useState } from 'react';
import { X, Usb, Network, Cable, Variable, ExternalLink, GitBranch } from 'lucide-react';
import UsbConfigTab from './tabs/UsbConfigTab';
import NetworkConfigTab from './tabs/NetworkConfigTab';
import PortsConfigTab from './tabs/PortsConfigTab';
import EnvironmentConfigTab from './tabs/EnvironmentConfigTab';
import EditorConfigTab from './tabs/EditorConfigTab';
import { postInstancesInstanceIdStop, postInstancesInstanceIdStart } from '@generated/core/instances/instances';

interface InstanceConfigDialogProps { instanceId: string; instanceName: string; open: boolean; onClose: () => void; versionSection?: React.ReactNode; }

const sections = [
  { key: 'usb', label: 'USB Devices', icon: Usb },
  { key: 'network', label: 'Network', icon: Network },
  { key: 'ports', label: 'Ports', icon: Cable },
  { key: 'env', label: 'Environment', icon: Variable },
  { key: 'editors', label: 'Editors', icon: ExternalLink },
] as const;

type SectionKey = (typeof sections)[number]['key'] | 'version';

const InstanceConfigDialog: React.FC<InstanceConfigDialogProps> = ({ instanceId, instanceName, open, onClose, versionSection }) => {
  const [activeSection, setActiveSection] = useState<SectionKey>(versionSection ? 'version' : 'usb');
  const [hasChanges, setHasChanges] = useState(false);

  const handleClose = async () => {
    if (hasChanges) { try { await postInstancesInstanceIdStop(instanceId); await postInstancesInstanceIdStart(instanceId); } catch {} }
    setHasChanges(false); onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-dark-end rounded-2xl overflow-hidden flex shadow-2xl border border-white/10 w-full max-w-3xl" style={{ height: '70vh', maxHeight: 640 }}>
        {/* Sidebar */}
        <div className="w-[220px] shrink-0 border-r border-white/10 flex flex-col bg-white/2">
          <div className="px-4 py-4">
            <span className="text-sm font-bold truncate block">{instanceName}</span>
            <span className="text-xs text-muted">Settings</span>
          </div>
          <hr className="border-white/10" />
          <nav className="flex-1 py-1">
            {versionSection && (
              <button onClick={() => setActiveSection('version')} className={`flex items-center gap-2 w-full mx-1 px-3 py-2 rounded-lg text-sm transition ${activeSection === 'version' ? 'bg-white/8 font-medium' : 'hover:bg-white/5'}`}>
                <GitBranch size={16} /> Version
              </button>
            )}
            {sections.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveSection(key)} className={`flex items-center gap-2 w-full mx-1 px-3 py-2 rounded-lg text-sm transition ${activeSection === key ? 'bg-white/8 font-medium' : 'hover:bg-white/5'}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
          <hr className="border-white/10" />
          <div className="p-3">
            <button onClick={handleClose} className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition ${hasChanges ? 'bg-brand text-white hover:bg-brand-end' : 'border border-white/10 hover:bg-white/5'}`}>
              {hasChanges ? 'Save & Restart' : 'Close'}
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto relative">
          <button onClick={handleClose} className="absolute right-3 top-3 z-10 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><X size={16} /></button>
          <div className="p-6">
            <h6 className="text-base font-bold mb-1">{activeSection === 'version' ? 'Version' : sections.find(s => s.key === activeSection)?.label}</h6>
            <p className="text-sm text-muted mb-4">
              {activeSection === 'version' && 'Change or update the app version.'}
              {activeSection === 'usb' && 'Configure USB device passthrough.'}
              {activeSection === 'network' && 'Configure network interfaces.'}
              {activeSection === 'ports' && 'Configure port mappings.'}
              {activeSection === 'env' && 'Configure environment variables.'}
              {activeSection === 'editors' && 'Configure editor URLs and reverse proxy.'}
            </p>
            <hr className="border-white/10 mb-4" />
            {activeSection === 'version' && versionSection}
            {activeSection === 'usb' && <UsbConfigTab instanceId={instanceId} onChange={setHasChanges} />}
            {activeSection === 'network' && <NetworkConfigTab instanceId={instanceId} onChange={setHasChanges} />}
            {activeSection === 'ports' && <PortsConfigTab instanceId={instanceId} onChange={setHasChanges} />}
            {activeSection === 'env' && <EnvironmentConfigTab instanceId={instanceId} onChange={setHasChanges} />}
            {activeSection === 'editors' && <EditorConfigTab instanceId={instanceId} onChange={setHasChanges} />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default InstanceConfigDialog;
