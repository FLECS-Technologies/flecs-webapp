export default function VolumesTable(props: any) {
  const { volumes } = props;
  return (
    <table data-testid="details-table" className="w-full text-sm" aria-label="instances-details">
      <thead><tr className="border-b border-white/10"><td data-testid="table-header-name" className="px-4 py-2">Name</td><td data-testid="table-header-path" className="px-4 py-2">Path</td></tr></thead>
      <tbody>
        {volumes?.map((volume: any) => (
          <tr key={volume.name}><td className="px-4 py-2">{volume.name}</td><td className="px-4 py-2">{volume.path}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
