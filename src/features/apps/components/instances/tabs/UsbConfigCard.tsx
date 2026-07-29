import { Usb } from 'lucide-react';
import type { UsbDraft } from '../useInstanceConfigDraft';

interface UsbConfigCardProps {
  device: UsbDraft;
  onToggle: (port: string) => void;
}

const UsbConfigCard = ({ device, onToggle }: UsbConfigCardProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3">
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-muted">
      <Usb size={18} aria-hidden="true" />
    </span>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className="truncate text-sm font-medium">{device.name}</p>
        {!device.device_connected && (
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
            Disconnected
          </span>
        )}
      </div>
      <p className="truncate text-xs text-muted">
        {device.vendor} · Port {device.port}
      </p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={device.enabled}
      aria-label={`${device.name} access`}
      onClick={() => onToggle(device.port)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised ${
        device.enabled ? 'bg-brand' : 'bg-border-strong'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform ${
          device.enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export default UsbConfigCard;
