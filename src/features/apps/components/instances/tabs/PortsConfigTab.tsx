import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import SinglePortMapping from './SinglePortMapping';
import PortRangeMapping from './PortRangeMapping';
import AddSinglePortMappingButton from './AddSinglePortMappingButton';
import AddPortRangeMappingButton from './AddPortRangeMappingButton';
import { InstancePortMapping, InstancePortMappingRange, InstancePortMappingSingle, InstancePorts, TransportProtocol } from '@generated/core/schemas';
import { useGetInstancesInstanceIdConfigPorts, usePutInstancesInstanceIdConfigPortsTransportProtocol } from '@generated/core/instances/instances';
import HelpButton from '@app/layout/HelpButton';
import { instancedeviceconfig } from '@app/layout/helplinks';

interface PortsConfigTabProps { instanceId: string; onChange: (hasChanges: boolean) => void; }
interface PortWithProtocol { protocol: TransportProtocol; port: InstancePortMappingSingle | InstancePortMappingRange; }

const PortsConfigTab: React.FC<PortsConfigTabProps> = ({ instanceId, onChange }) => {
  const [ports, setPorts] = useState<PortWithProtocol[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [save, setSave] = useState(false);
  const { data: portsResponse, isLoading } = useGetInstancesInstanceIdConfigPorts(instanceId);
  const { mutateAsync: putPorts } = usePutInstancesInstanceIdConfigPortsTransportProtocol();

  useEffect(() => { if (portsResponse?.data && !initialized) { const portData = portsResponse.data as InstancePorts; setPorts([...portData.tcp.map((port: InstancePortMapping): PortWithProtocol => ({ protocol: TransportProtocol.tcp, port })), ...portData.udp.map((port: InstancePortMapping): PortWithProtocol => ({ protocol: TransportProtocol.udp, port }))]); setInitialized(true); } }, [portsResponse, initialized]);
  useEffect(() => { if (save) { handleSave(); setSave(false); } }, [save]);

  const handlePortChange = (index: number, field: keyof InstancePortMappingSingle | keyof InstancePortMappingRange, value: number | { start?: number; end?: number }) => { setPorts((prev) => { const u = [...prev]; const p = u[index]; if ('host_port' in p.port) { p.port = { ...p.port, [field]: value } as InstancePortMappingSingle; } else if ('host_ports' in p.port) { p.port = { ...p.port, [field]: { ...(field in p.port ? (p.port[field as keyof InstancePortMappingRange] as object) : {}), ...(value as object) } } as InstancePortMappingRange; } return u; }); };
  const handleProtocolChange = (index: number, protocol: TransportProtocol) => { setPorts((prev) => { const u = [...prev]; u[index].protocol = protocol; return u; }); };
  const handleSave = async () => { try { const tcp = ports.filter(p => p.protocol === TransportProtocol.tcp).map(p => p.port); const udp = ports.filter(p => p.protocol === TransportProtocol.udp).map(p => p.port); if (tcp.length > 0) await putPorts({ instanceId, transportProtocol: TransportProtocol.tcp, data: tcp }); if (udp.length > 0) await putPorts({ instanceId, transportProtocol: TransportProtocol.udp, data: udp }); onChange(true); toast.success('Port mappings saved!'); } catch (error) { toast.error((error as Error).message); } };
  const handleDeletePort = (index: number) => { setPorts(prev => { const u = [...prev]; u.splice(index, 1); return u; }); setSave(true); };

  if (isLoading) return <div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full" />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><h6 className="text-base font-semibold">Port Mappings</h6><HelpButton url={instancedeviceconfig} /></div>
      <div className="flex gap-2 mb-4">
        <AddSinglePortMappingButton onAdd={() => setPorts(prev => [...prev, { protocol: TransportProtocol.tcp, port: { host_port: 0, container_port: 0 } as InstancePortMappingSingle }])} defaultProtocol={TransportProtocol.tcp} />
        <AddPortRangeMappingButton onAdd={() => setPorts(prev => [...prev, { protocol: TransportProtocol.tcp, port: { host_ports: { start: 0, end: 0 }, container_ports: { start: 0, end: 0 } } as InstancePortMappingRange }])} defaultProtocol={TransportProtocol.tcp} />
      </div>
      <div>
        {ports.length === 0 && <p className="text-sm text-muted">No ports configured.</p>}
        {ports.map((p, index) => 'host_port' in p.port ? <SinglePortMapping key={index} port={p.port as InstancePortMappingSingle} protocol={p.protocol} index={index} onChange={handlePortChange} handleDeletePort={handleDeletePort} handleSavePort={handleSave} handleProtocolChange={handleProtocolChange} /> : <PortRangeMapping key={index} port={p.port as InstancePortMappingRange} protocol={p.protocol} index={index} onChange={handlePortChange} handleDeletePort={handleDeletePort} handleSavePort={handleSave} handleProtocolChange={handleProtocolChange} />)}
      </div>
    </div>
  );
};
export default PortsConfigTab;
