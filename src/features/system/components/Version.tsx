import React from 'react';
import VersionsTable from './VersionsTable';
import { VersionSelector } from '@app/components/VersionSelector';
import { useGetSystemInfo, useGetSystemVersion } from '@generated/core/system/system';
import type { GetSystemVersion200 } from '@generated/core/schemas';

function isLaterThan(a?: string, b?: string): boolean { if (!a || !b) return false; const pa = a.replace(/^v/, '').split('.').map(Number); const pb = b.replace(/^v/, '').split('.').map(Number); for (let i = 0; i < Math.max(pa.length, pb.length); i++) { const na = pa[i] ?? 0; const nb = pb[i] ?? 0; if (na > nb) return true; if (na < nb) return false; } return false; }
async function fetchLatestGithubVersion(): Promise<{ version: string } | null> { try { const res = await fetch('https://api.github.com/repos/FLECS-Technologies/flecs-public/releases/latest'); if (!res.ok) return null; const data = await res.json(); const tag = data?.tag_name as string | undefined; return tag ? { version: tag.replace(/^v/, '') } : null; } catch { return null; } }

export default function Version() {
  const { data: infoResponse } = useGetSystemInfo({ query: { staleTime: 60_000 } });
  const systemInfo = infoResponse?.data;
  const { data: versionResponse, isLoading: loadingVersion, isError: versionError, error: versionErrorObj } = useGetSystemVersion();
  const version = versionResponse?.data as GetSystemVersion200 | undefined;
  const [loadingLatestVersion, setLoadingLatestVersion] = React.useState(false);
  const [latestVersion, setLatestVersion] = React.useState<{ version: string } | undefined>();
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | undefined>();
  const executedRef = React.useRef(false);

  React.useEffect(() => { if (executedRef.current) return; if (!loadingLatestVersion) fetchLatestVersion(); executedRef.current = true; }, []);
  React.useEffect(() => { if (versionError) { setError(true); setErrorText((versionErrorObj as any)?.message); } }, [versionError, versionErrorObj]);

  const fetchLatestVersion = async () => { setLoadingLatestVersion(true); fetchLatestGithubVersion().then(r => { if (r) setLatestVersion(r); setError(false); }).catch(e => { setErrorText(e.message); setError(true); }).finally(() => setLoadingLatestVersion(false)); };

  return (
    <div>
      <div>
        {error && (loadingVersion || loadingLatestVersion) && <p className="text-center text-sm">Oops... {errorText}</p>}
        {(loadingVersion || loadingLatestVersion) && <div className="h-1 bg-white/10 rounded"><div className="h-full bg-brand rounded animate-pulse" style={{width: '60%'}} /></div>}
        {(loadingVersion || loadingLatestVersion) && <p className="text-center text-sm">Checking for updates...</p>}
      </div>
      <div>
        {isLaterThan(latestVersion?.version, version?.core) && (
          <div className="px-4 py-3 rounded-lg bg-accent/10 text-accent mb-4">
            <p className="font-semibold mb-1">Info</p>
            <p className="text-sm">There is a newer version for FLECS available:</p>
            <VersionSelector availableVersions={[latestVersion as any]} selectedVersion={latestVersion as any} setSelectedVersion={() => {}} />
            <p className="text-sm">Install this update by running <i>curl -fsSL install.flecs.tech | bash</i> in the terminal of this device ({window.location.hostname}).</p>
          </div>
        )}
      </div>
      <VersionsTable coreVersion={version} webappVersion={import.meta.env.VITE_APP_VERSION} distro={systemInfo?.distro} kernel={systemInfo?.kernel} />
    </div>
  );
}
