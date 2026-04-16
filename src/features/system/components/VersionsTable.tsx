import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { GetSystemVersion200, SystemDistro, SystemKernel } from '@generated/core/schemas';
import sbomHref from '@assets/sbom.json?url';

interface VersionsTableProps { coreVersion?: GetSystemVersion200; webappVersion?: string; distro?: SystemDistro; kernel?: SystemKernel; }

const VersionsTable: React.FC<VersionsTableProps> = ({ coreVersion = {}, webappVersion = 'N/A', distro = { name: 'Distro', version: 'N/A' }, kernel = { version: 'N/A' } }) => {
  const versions = React.useMemo(() => [
    { component: 'Core', version: coreVersion?.core },
    { component: 'API', version: coreVersion?.api },
    { component: 'UI', version: webappVersion, sbom: sbomHref },
    { component: distro?.name || 'Distro', version: distro?.version },
    { component: 'Kernel', version: kernel?.version },
  ], [coreVersion, webappVersion, distro, kernel]);

  return (
    <table data-testid="versions-table" className="w-full text-sm">
      <thead><tr className="border-b border-white/10"><td className="px-4 py-2 font-semibold" colSpan={3}>Versions</td></tr></thead>
      <tbody>{versions.map(({ component, version, sbom }) => (
        <tr key={`${component}-${version}`}><td className="px-4 py-2">{component}</td><td className="px-4 py-2">{version || 'N/A'}</td><td className="px-4 py-2">{sbom && <a href={sbom} target="_blank" className="text-brand hover:underline inline-flex items-center gap-1 text-xs">SBOM <ExternalLink size={12} /></a>}</td></tr>
      ))}</tbody>
    </table>
  );
};
export default VersionsTable;
