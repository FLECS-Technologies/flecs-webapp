import { Plus } from 'lucide-react';
import {
  TransportProtocol,
  type InstancePortMappingRange,
  type InstancePortMappingSingle,
} from '@generated/core/schemas';
import HelpButton from '@app/layout/HelpButton';
import { instancedeviceconfig } from '@app/layout/helplinks';
import type { PortDraft } from '../useInstanceConfigDraft';
import PortRangeMapping from './PortRangeMapping';
import SinglePortMapping from './SinglePortMapping';

interface PortsConfigTabProps {
  rows: PortDraft[];
  onChange: (update: (rows: PortDraft[]) => PortDraft[]) => void;
}

type PortField = keyof InstancePortMappingSingle | keyof InstancePortMappingRange;

const PortsConfigTab = ({ rows, onChange }: PortsConfigTabProps) => {
  const addSingle = () =>
    onChange((current) => [
      ...current,
      {
        protocol: TransportProtocol.tcp,
        port: { host_port: 0, container_port: 0 },
        _rowId: crypto.randomUUID(),
      },
    ]);

  const addRange = () =>
    onChange((current) => [
      ...current,
      {
        protocol: TransportProtocol.tcp,
        port: {
          host_ports: { start: 0, end: 0 },
          container_ports: { start: 0, end: 0 },
        },
        _rowId: crypto.randomUUID(),
      },
    ]);

  const updatePort = (
    index: number,
    field: PortField,
    value: number | { start?: number; end?: number },
  ) =>
    onChange((current) =>
      current.map((row, currentIndex) => {
        if (currentIndex !== index) return row;
        if ('host_port' in row.port) {
          return {
            ...row,
            port: { ...row.port, [field]: value } as InstancePortMappingSingle,
          };
        }
        const rangeField = field as 'host_ports' | 'container_ports';
        return {
          ...row,
          port: {
            ...row.port,
            [rangeField]: { ...row.port[rangeField], ...(value as object) },
          },
        };
      }),
    );

  const updateProtocol = (index: number, protocol: TransportProtocol) =>
    onChange((current) =>
      current.map((row, currentIndex) => (currentIndex === index ? { ...row, protocol } : row)),
    );

  const deletePort = (index: number) =>
    onChange((current) => current.filter((_, currentIndex) => currentIndex !== index));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium">Mappings</p>
          <HelpButton url={instancedeviceconfig} />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Add a one-to-one port mapping"
            onClick={addSingle}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            <Plus size={15} /> Add port
          </button>
          <button
            type="button"
            title="Add a range of ports"
            onClick={addRange}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            <Plus size={15} /> Add range
          </button>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-subtle px-6 text-center">
          <p className="text-sm font-medium">No port mappings</p>
          <p className="mt-1 text-xs text-muted">Add a port to make this instance reachable.</p>
          <button
            type="button"
            onClick={addSingle}
            className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            <Plus size={16} /> Add port
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) =>
            'host_port' in row.port ? (
              <SinglePortMapping
                key={row._rowId}
                port={row.port}
                protocol={row.protocol}
                index={index}
                onChange={updatePort}
                onDelete={deletePort}
                onProtocolChange={updateProtocol}
              />
            ) : (
              <PortRangeMapping
                key={row._rowId}
                port={row.port}
                protocol={row.protocol}
                index={index}
                onChange={updatePort}
                onDelete={deletePort}
                onProtocolChange={updateProtocol}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default PortsConfigTab;
