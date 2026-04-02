import { useState } from 'react';
import parse from 'html-react-parser';
import { X, CheckCircle2, RefreshCw, ShoppingCart, Star, Cpu, BookOpen, Store } from 'lucide-react';
type App = any;
import { useGetSystemInfo } from '@generated/core/system/system';
import { isBlacklisted } from '@features/marketplace/api/product-service';
const getLatestVersion = (versions: string[]) => versions?.[0]; const createVersion = (v: string) => v; const createVersions = (v: string[]) => v;
type Version = string;
import { EditorButtons } from '@features/apps/components/actions/editors/EditorButtons';
import { VersionSelector } from '@app/components/VersionSelector';
import UninstallButton from '@features/apps/components/actions/UninstallButton';
import ActionSnackbar from '@app/components/ActionSnackbar';
import InstallButton from '@features/apps/components/actions/InstallButton';
import UpdateButton from '@features/apps/components/actions/UpdateButton';

interface FullCardProps { app: App; open: boolean; onClose: () => void; }

export default function FullCard({ app, open, onClose }: FullCardProps) {
  const { data: infoResponse } = useGetSystemInfo({ query: { staleTime: 60_000 } });
  const systemInfo = infoResponse?.data;
  const [blackListed] = useState(isBlacklisted(systemInfo, app.blacklist));
  const installed = app.status === 'installed';
  const versionsArray = app.versions ? createVersions(app.versions, app.installedVersions || []) : [];
  const initialVersion = getLatestVersion(versionsArray) ?? createVersion('');
  const [selectedVersion, setSelectedVersion] = useState<Version>(initialVersion);
  const installable = app.requirement && systemInfo?.arch && app.requirement.includes(systemInfo.arch);
  const updateAvailable = !app.installedVersions?.includes(getLatestVersion(versionsArray)?.version || '') && installed;
  const selectedVersionNotInstalled = installed && !app.installedVersions?.includes(selectedVersion.version);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({ snackbarText: '', alertSeverity: 'success' as 'success' | 'error' | 'info' | 'warning', clipBoardContent: '' });
  const rating = app.average_rating ? parseFloat(app.average_rating) : 0;
  const ratingCount = app.rating_count || 0;
  const isFree = !app.price || parseFloat(app.price) === 0;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
        <div className="bg-dark-end rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
          {/* Close */}
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute right-4 top-4 z-10 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition"><X size={18} /></button>

          {/* Hero */}
          <div className="flex flex-col items-center text-center px-8 pt-10 pb-6">
            <div className="w-[88px] h-[88px] rounded-xl bg-white/5 flex items-center justify-center text-3xl font-bold border border-white/10 overflow-hidden mb-5">
              {app.avatar ? <img src={app.avatar} alt={app.title} className="w-full h-full object-cover" /> : app.title?.charAt(0).toUpperCase()}
            </div>
            <h5 className="text-xl font-extrabold tracking-tight mb-1">{app.title}</h5>
            <p className="text-sm text-muted mb-4">by {app.author || 'Unknown'}</p>
            <div className="flex items-center gap-4 mb-5 text-xs">
              {installed && !updateAvailable && <span className="flex items-center gap-1 text-success font-semibold"><CheckCircle2 size={15} /> Installed</span>}
              {updateAvailable && <span className="flex items-center gap-1 text-accent font-semibold"><RefreshCw size={15} /> Update available</span>}
              <span className="flex items-center gap-1 font-semibold"><Star size={14} fill="#F59E0B" color="#F59E0B" /> {rating.toFixed(1)} <span className="text-muted">({ratingCount})</span></span>
              <span className={`font-bold ${isFree ? 'text-success' : ''}`}>{isFree ? 'Free' : `$${app.price}`}</span>
            </div>
            <div className="flex items-center gap-0.5 mb-4">{[1,2,3,4,5].map(s => <Star key={s} size={18} fill={s <= rating ? '#F59E0B' : 'none'} color={s <= rating ? '#F59E0B' : '#6B7280'} />)}</div>
            {app.categories?.length > 0 && <div className="flex flex-wrap justify-center gap-1.5">{app.categories.map((c: any, i: number) => <span key={c.id || i} className="px-2 py-0.5 rounded-full border border-white/10 text-xs text-muted">{c.name || c}</span>)}</div>}
          </div>

          {/* CTA */}
          <div className="px-8 py-5 bg-white/2 border-y border-white/10">
            {versionsArray.length > 0 && <div className="mb-4"><VersionSelector availableVersions={versionsArray} selectedVersion={selectedVersion} setSelectedVersion={setSelectedVersion} /></div>}
            {!installed && <InstallButton app={app} version={selectedVersion} disabled={!installable || blackListed} showSelectedVersion fullWidth />}
            {installed && <div className="flex flex-wrap gap-3">{app.instances && <EditorButtons instance={app.instances[0]} />}{selectedVersionNotInstalled && <UpdateButton app={app} to={selectedVersion} showSelectedVersion />}<UninstallButton app={app} selectedVersion={selectedVersion} variant="button" onUninstallComplete={(success, message, error) => { setSnackbarState({ alertSeverity: success ? 'success' : 'error', snackbarText: message, clipBoardContent: error || '' }); setSnackbarOpen(true); }} /></div>}
            {app.purchasable && app.permalink && Number(app.price) > 0 && <a href={app.permalink} target="_blank" className="mt-3 w-full px-4 py-2.5 border border-brand text-brand rounded-xl font-semibold hover:bg-brand/10 transition inline-flex items-center justify-center gap-2"><ShoppingCart size={16} /> Purchase License</a>}
            {!installable && app.requirement && <div className="px-4 py-3 rounded-lg bg-error/10 text-error mt-4"><p className="text-sm">Not compatible with {systemInfo?.arch}. Requires {app.requirement.join(' or ')}.</p></div>}
          </div>

          {/* Description */}
          <div className="px-8 py-5">
            <span className="text-[0.65rem] uppercase tracking-widest text-muted font-bold block mb-3">About</span>
            <div className="text-sm text-muted leading-relaxed prose-sm">{parse(app.description || app.short_description || 'No description available.')}</div>
            {(app.documentationUrl || app.permalink) && <div className="flex gap-2 mt-5">{app.documentationUrl && <a href={app.documentationUrl} target="_blank" className="px-3 py-1.5 border border-white/10 text-muted rounded-lg text-xs font-semibold hover:bg-white/5 transition inline-flex items-center gap-1"><BookOpen size={14} /> Docs</a>}{app.permalink && <a href={app.permalink} target="_blank" className="px-3 py-1.5 border border-white/10 text-muted rounded-lg text-xs font-semibold hover:bg-white/5 transition inline-flex items-center gap-1"><Store size={14} /> Store</a>}</div>}
          </div>

          {/* Requirements */}
          {app.requirement?.length > 0 && (
            <><hr className="border-white/10" /><div className="px-8 py-5"><div className="flex items-center gap-2 mb-3"><Cpu size={14} className="opacity-50" /><span className="text-[0.65rem] uppercase tracking-widest text-muted font-bold">System Requirements</span></div><div className="flex flex-wrap gap-1.5">{app.requirement.map((req: string) => { const compatible = systemInfo?.arch && req.toLowerCase().includes(systemInfo.arch.toLowerCase()); return <span key={req} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${compatible ? 'bg-success text-white' : 'border border-white/10 text-muted'}`}>{req}</span>; })}</div></div></>
          )}
        </div>
      </div>
      <ActionSnackbar text={snackbarState.snackbarText} errorText={snackbarState.clipBoardContent} open={snackbarOpen} setOpen={setSnackbarOpen} alertSeverity={snackbarState.alertSeverity} />
    </>
  );
}
