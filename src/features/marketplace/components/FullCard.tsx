import { useState } from 'react';
import { toast } from 'sonner';
import parse from 'html-react-parser';
import { X, CheckCircle2, RefreshCw, Star, BookOpen, ExternalLink, AlertTriangle } from 'lucide-react';
import { useGetSystemInfo } from '@generated/core/system/system';
import { isBlacklisted } from '@features/marketplace/api/product-service';
import { VersionSelector } from '@app/components/VersionSelector';
import { EditorButtons } from '@features/apps/components/actions/EditorButtons';
import UninstallButton from '@features/apps/components/actions/UninstallButton';
import InstallButton from '@features/apps/components/actions/InstallButton';
import UpdateButton from '@features/apps/components/actions/UpdateButton';
import type { AppVersion, EnrichedApp } from '@features/apps/types';
import type { MarketplaceCardProps } from './Card';
import type { ProductCategory } from '@generated/console/schemas';

interface FullCardProps { app: MarketplaceCardProps; open: boolean; onClose: () => void; }

export default function FullCard({ app, open, onClose }: FullCardProps) {
  const { data: infoResponse } = useGetSystemInfo({ query: { staleTime: 60_000 } });
  const systemInfo = infoResponse?.data;
  const installed = app.status === 'installed';
  const versions: AppVersion[] = app.versions ?? [];
  const [selectedVersion, setSelectedVersion] = useState<AppVersion>(versions[0] ?? { version: '', installed: false });
  const installable = app.requirement && systemInfo?.arch && app.requirement.includes(systemInfo.arch);
  const blackListed = isBlacklisted(systemInfo, app.blacklist);
  const updateAvailable = versions.length > 0 && !versions[0]?.installed && installed;
  const selectedNotInstalled = installed && !selectedVersion?.installed;
  const rating = parseFloat(app.average_rating || '0');
  const isFree = !app.price || parseFloat(app.price) === 0;
  const enrichedApp = app as unknown as EnrichedApp;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-surface-raised rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl border border-border flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header — app icon + name + meta */}
        <div className="relative px-6 pt-8 pb-5 text-center shrink-0">
          <button onClick={onClose} className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-surface-hover transition cursor-pointer text-muted">
            <X size={18} />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center overflow-hidden mx-auto mb-4">
            {app.avatar ? <img src={app.avatar} alt={app.title} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-muted">{app.title?.charAt(0)}</span>}
          </div>

          <h2 className="text-lg font-bold text-text-primary mb-1">{app.title}</h2>
          <p className="text-xs text-muted mb-3">by {app.author || 'Unknown'}</p>

          {/* Status badges */}
          <div className="flex items-center justify-center gap-3 text-xs">
            {installed && !updateAvailable && (
              <span className="flex items-center gap-1 text-success font-medium"><CheckCircle2 size={13} /> Installed</span>
            )}
            {updateAvailable && (
              <span className="flex items-center gap-1 text-accent font-medium"><RefreshCw size={13} /> Update</span>
            )}
            <span className="flex items-center gap-1 text-muted">
              <Star size={12} fill={rating > 0 ? '#F59E0B' : 'none'} color={rating > 0 ? '#F59E0B' : 'currentColor'} />
              {rating.toFixed(1)} ({app.rating_count || 0})
            </span>
            <span className={`font-semibold ${isFree ? 'text-success' : 'text-text-primary'}`}>
              {isFree ? 'Free' : `$${app.price}`}
            </span>
          </div>

          {/* Category tags */}
          {app.categories && app.categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {app.categories.map((c: ProductCategory, i: number) => (
                <span key={c.id || i} className="px-2 py-0.5 rounded-full text-[11px] text-muted border border-border">{c.name}</span>
              ))}
            </div>
          )}
        </div>

        {/* Action bar — version + install/update */}
        <div className="px-6 py-4 border-y border-border bg-surface shrink-0">
          {versions.length > 0 && (
            <div className="mb-3">
              <VersionSelector availableVersions={versions} selectedVersion={selectedVersion} setSelectedVersion={setSelectedVersion} />
            </div>
          )}

          {!installed && (
            <InstallButton app={enrichedApp} version={selectedVersion} disabled={!installable || blackListed} showSelectedVersion fullWidth />
          )}

          {installed && (
            <div className="flex flex-wrap gap-2">
              {app.instances?.[0] && <EditorButtons instance={app.instances[0]} />}
              {selectedNotInstalled && <UpdateButton app={enrichedApp} to={selectedVersion} showSelectedVersion />}
              <UninstallButton app={enrichedApp} selectedVersion={selectedVersion} variant="button"
                onUninstallComplete={(success: boolean, msg: string, err?: string) => success ? toast.success(msg) : toast.error(msg, { description: err })} />
            </div>
          )}

          {!installable && app.requirement && (
            <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-error/10 text-error text-xs">
              <AlertTriangle size={14} />
              <span>Not compatible with {systemInfo?.arch}. Requires {app.requirement.join(' or ')}.</span>
            </div>
          )}
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* About */}
          <div className="px-6 py-5">
            <h3 className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-3">About</h3>
            <div className="text-sm text-text-secondary leading-relaxed [&_h1]:text-base [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2 [&_li]:mb-1">
              {parse(app.description || app.short_description || 'No description available.')}
            </div>
          </div>

          {/* Links */}
          {(app.documentationUrl || app.permalink) && (
            <div className="px-6 pb-5 flex gap-2">
              {app.documentationUrl && (
                <a href={app.documentationUrl} target="_blank" rel="noopener" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted font-medium hover:bg-surface-hover hover:text-text-primary transition">
                  <BookOpen size={13} /> Docs
                </a>
              )}
              {app.permalink && (
                <a href={app.permalink} target="_blank" rel="noopener" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted font-medium hover:bg-surface-hover hover:text-text-primary transition">
                  <ExternalLink size={13} /> Store
                </a>
              )}
            </div>
          )}

          {/* System requirements */}
          {app.requirement && app.requirement.length > 0 && (
            <div className="px-6 pb-5 border-t border-border pt-4">
              <h3 className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2">Requirements</h3>
              <div className="flex flex-wrap gap-1.5">
                {app.requirement.map((req: string) => {
                  const ok = systemInfo?.arch && req.toLowerCase().includes(systemInfo.arch.toLowerCase());
                  return <span key={req} className={`px-2.5 py-1 rounded-full text-xs font-medium ${ok ? 'bg-success/15 text-success' : 'border border-border text-muted'}`}>{req}</span>;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
