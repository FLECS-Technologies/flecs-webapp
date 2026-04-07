import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { UsbDevice as SystemUsbDevice, InstanceConfigUsbDevice } from '@generated/core/schemas';
import { useGetInstancesInstanceIdConfigDevicesUsb, usePutInstancesInstanceIdConfigDevicesUsbPort, useDeleteInstancesInstanceIdConfigDevicesUsbPort } from '@generated/core/instances/instances';
import { useGetSystemDevicesUsb } from '@generated/core/system/system';
import { useQueryClient } from '@tanstack/react-query';
import HelpButton from '@app/layout/HelpButton';
import { instancedeviceconfig } from '@app/layout/helplinks';
import UsbConfigCard from './UsbConfigCard';

export interface UsbDevice { port: string; name: string; vendor: string; device_connected: boolean; enabled: boolean; }
interface UsbConfigTabProps { instanceId: string; onChange: (hasChanges: boolean) => void; }

const UsbConfigTab: React.FC<UsbConfigTabProps> = ({ instanceId, onChange }) => {
  const queryClient = useQueryClient();
  const { data: systemDevicesResponse, isLoading: loadingSystem } = useGetSystemDevicesUsb();
  const { data: instanceDevicesResponse, isLoading: loadingInstance } = useGetInstancesInstanceIdConfigDevicesUsb(instanceId);
  const { mutateAsync: enableUsb } = usePutInstancesInstanceIdConfigDevicesUsbPort();
  const { mutateAsync: disableUsb } = useDeleteInstancesInstanceIdConfigDevicesUsbPort();
  const loading = loadingSystem || loadingInstance;

  const usbDevices: UsbDevice[] = useMemo(() => {
    const systemData = systemDevicesResponse?.data as SystemUsbDevice[] | undefined;
    const instanceData = instanceDevicesResponse?.data as InstanceConfigUsbDevice[] | undefined;
    if (!systemData || !instanceData) return [];
    const devices: UsbDevice[] = systemData.map(d => { const inst = instanceData.find(i => i.port === d.port); return { port: d.port, name: d.name ?? 'Unknown', vendor: d.vendor ?? 'Unknown', device_connected: inst?.device_connected ?? true, enabled: !!inst }; });
    instanceData.forEach(inst => { if (!systemData.some(s => s.port === inst.port)) devices.push({ port: inst.port, name: inst.name ?? 'Unknown', vendor: inst.vendor ?? 'Unknown', device_connected: false, enabled: true }); });
    devices.sort((a, b) => a.port.localeCompare(b.port));
    return devices;
  }, [systemDevicesResponse, instanceDevicesResponse]);

  const handleToggle = async (port: string, enabled: boolean) => {
    try { if (!enabled) await enableUsb({ instanceId, port }); else await disableUsb({ instanceId, port }); onChange(true); queryClient.invalidateQueries({ queryKey: [`/instances/${instanceId}/config/devices/usb`] }); queryClient.invalidateQueries({ queryKey: [`/system/devices/usb`] }); toast.success('USB config saved!'); }
    catch { toast.error('Failed to save USB config!'); }
  };

  if (loading) return <div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full" />;
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><h6 className="text-base font-semibold">USB Devices</h6><HelpButton url={instancedeviceconfig} /></div>
      <div>{usbDevices.length === 0 && <p className="text-sm">No USB devices available.</p>}{usbDevices.map(d => <UsbConfigCard key={d.port} device={d} onEnable={handleToggle} />)}</div>
    </div>
  );
};
export default UsbConfigTab;
