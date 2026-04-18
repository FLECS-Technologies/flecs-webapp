interface HostContainerMapping {
  host: string;
  container: string;
}

interface HostContainerTableProps {
  data: HostContainerMapping[];
}

export default function HostContainerTable({ data }: HostContainerTableProps) {
  return (
    <table data-testid="details-table" className="w-full text-sm" aria-label="instances-details">
      <thead><tr className="border-b border-white/10"><td data-testid="table-header-host" className="px-4 py-2">Exposed to the host</td><td data-testid="table-header-container" className="px-4 py-2">Inside the container</td></tr></thead>
      <tbody>
        {data?.map((mapping: HostContainerMapping) => (
          <tr key={`${mapping.host}\u0000${mapping.container}`}><td className="px-4 py-2">{mapping.host}</td><td className="px-4 py-2">{mapping.container}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
