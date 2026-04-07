import { useState } from 'react';
import { createPortal } from 'react-dom';
type Version = { version: string; installed?: boolean };
type App = any;
import { useGetSystemInfo } from '@generated/core/system/system';
import FullCard from './FullCard';
import { Check, AlertTriangle } from 'lucide-react';
import InstallButton from '@features/apps/components/actions/InstallButton';

export default function MarketplaceCard(props: App) {
  const { data: infoResponse } = useGetSystemInfo({ query: { staleTime: 60_000 } });
  const systemInfo = infoResponse?.data;
  const installed = props.status === 'installed';
  const versionsArray = props.versions ?? [];
  const [latestVersion] = useState<Version>(versionsArray[0] ?? { version: '', installed: false });
  const installable = props.requirement && systemInfo?.arch && props.requirement.includes(systemInfo.arch);
  const [fullCardOpen, setFullCardOpen] = useState(false);
  const plainDescription = (props.short_description || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
  const isFree = !props.price || parseFloat(props.price) === 0;

  return (
    <>
      <div data-testid="app-card" className="flex flex-col rounded-2xl overflow-hidden border border-white/10 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-transparent" onClick={() => setFullCardOpen(true)}>
        <div className="p-6 pt-8 flex-1 flex flex-col items-center min-h-[260px]">
          <div className="w-[72px] h-[72px] rounded-xl bg-white/5 flex items-center justify-center text-2xl font-bold border border-white/10 overflow-hidden mb-4 transition-transform duration-300 card-icon">
            {props.avatar ? <img src={props.avatar} alt={props.title} className="w-full h-full object-cover" /> : props.title?.charAt(0).toUpperCase()}
          </div>
          <span className="text-base font-bold text-center break-words mb-1">{props.title}</span>
          {props.author && <span className="text-xs text-muted">{props.author}</span>}
          <p className="text-sm text-muted mt-3 text-center line-clamp-2">{plainDescription || 'No description available'}</p>
          <div className="flex-1 min-h-4" />
          <span className={`text-xs font-semibold mt-4 ${isFree ? 'text-success' : 'text-muted'}`}>{isFree ? 'Free' : `$${props.price}`}</span>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="px-5 py-4 bg-white/2 border-t border-white/10">
          {installed ? (
            <button className="w-full px-4 py-3 border border-success text-success rounded-xl font-bold text-base hover:bg-success/5 transition inline-flex items-center justify-center gap-2" onClick={() => setFullCardOpen(true)}><Check size={18} /> Installed</button>
          ) : !installable ? (
            <button className="w-full px-4 py-3 rounded-xl font-semibold text-base opacity-50 cursor-not-allowed inline-flex items-center justify-center gap-2" disabled><AlertTriangle size={18} /> Not compatible</button>
          ) : (
            <InstallButton app={props} version={latestVersion} disabled={false} fullWidth />
          )}
        </div>
      </div>
      {fullCardOpen && createPortal(
        <FullCard app={props} open={fullCardOpen} onClose={() => setFullCardOpen(false)} />,
        document.body
      )}
    </>
  );
}
