import type { InstanceDetailVolume } from '@generated/core/schemas';

interface VolumesTableProps {
  volumes: InstanceDetailVolume[];
}

export default function VolumesTable({ volumes }: VolumesTableProps) {
  return (
    <table data-testid="details-table" className="w-full text-sm" aria-label="instances-details">
      <thead><tr className="border-b border-white/10"><td data-testid="table-header-name" className="px-4 py-2">Name</td><td data-testid="table-header-path" className="px-4 py-2">Path</td></tr></thead>
      <tbody>
        {volumes?.map((volume: InstanceDetailVolume) => (
          <tr key={volume.name}><td className="px-4 py-2">{volume.name}</td><td className="px-4 py-2">{volume.path}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
