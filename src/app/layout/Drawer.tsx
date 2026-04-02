import { useState, useEffect } from 'react';
import { Search, Download, Network, Settings, User, LogIn, ShieldCheck, ShieldAlert, Sun, Moon, ChevronsLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { brand } from '@app/theme/tokens';
import { useUIStore } from '@stores/ui';
import { useAppList } from '@features/apps/hooks/app-queries';
import { useGetApiV2ProductsApps } from '@generated/console/products/products';
import { useOAuth4WebApiAuth } from '@features/auth/AuthProvider';
import { useGetDeviceLicenseActivationStatus } from '@generated/core/device/device';
import { useDarkMode } from '@app/theme/ThemeHandler';
import FLECSLogo from './FLECSLogo';

const NAV = {
  apps: [
    { label: 'Browse', icon: <Search size={18} />, path: '/marketplace' },
    { label: 'Installed', icon: <Download size={18} />, path: '/' },
  ],
  device: [
    { label: 'Service Mesh', icon: <Network size={18} />, path: '/service-mesh' },
    { label: 'System', icon: <Settings size={18} />, path: '/system' },
  ],
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);
  const { appList } = useAppList();
  const { data: mpRes } = useGetApiV2ProductsApps(undefined, { query: { staleTime: 300_000 } });
  const auth = useOAuth4WebApiAuth();
  const { data: licData } = useGetDeviceLicenseActivationStatus({ query: { staleTime: 60_000 } });
  const activated = (licData as any)?.data?.isValid ?? false;
  const { isDarkMode, setDarkMode } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const products = (mpRes as any)?.data?.data?.products ?? (mpRes as any)?.data?.products ?? [];

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const isCol = !isMobile && collapsed;
  const w = isCol ? 60 : 220;
  const installedCount = (appList ?? []).filter((a: any) => a?.status === 'installed').length;

  const NavItem = ({ label, icon, path, badge }: { label: string; icon: React.ReactNode; path: string; badge?: number }) => {
    const active = pathname === path;
    return (
      <button
        title={isCol ? label : undefined}
        onClick={() => { navigate(path); if (isMobile) toggleSidebar(); }}
        className={`flex items-center rounded-md mb-0.5 transition ${isCol ? 'mx-1.5 justify-center py-2' : 'mx-2 py-1.5 px-3'} ${active ? 'bg-brand/12 text-brand' : 'hover:bg-white/5'}`}
      >
        <span className={isCol ? '' : 'w-8 flex justify-center shrink-0'}>{icon}</span>
        {!isCol && <span className={`flex-1 text-left text-[0.85rem] ${active ? 'font-semibold' : ''}`}>{label}</span>}
        {!isCol && badge ? <span className={`text-[0.65rem] font-semibold rounded px-1 ${active ? 'bg-brand/20 text-brand' : 'bg-white/10 text-muted'}`}>{badge}</span> : null}
      </button>
    );
  };

  return (
    <>
      {isMobile && sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar} />}
      <aside style={{ width: isMobile ? 220 : w }} className={`fixed top-0 left-0 h-full flex flex-col border-r border-white/8 bg-dark transition-[width,transform] duration-200 z-50 ${isMobile && !sidebarOpen ? '-translate-x-full' : ''}`}>
        {/* Header */}
        <div className={`flex items-center min-h-[48px] py-2 ${isCol ? 'justify-center' : 'px-3'}`}>
          {isCol ? (
            <button title="Expand" onClick={toggleCollapsed} className="p-1.5 rounded-lg hover:bg-white/10 text-muted"><FLECSLogo logoColor={brand.primary} /></button>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-1 pl-1"><FLECSLogo logoColor={brand.primary} /><span className="text-sm font-bold">FLECS</span></div>
              <button onClick={toggleCollapsed} className="p-1.5 rounded-lg hover:bg-white/10 text-muted/50"><ChevronsLeft size={16} /></button>
            </>
          )}
        </div>

        <nav className="flex flex-col flex-1">
          {!isCol && <span className="px-5 pt-2 pb-0.5 text-[0.6rem] uppercase tracking-widest text-muted/50 font-semibold">APPS</span>}
          <NavItem {...NAV.apps[0]} badge={products.length} />
          <NavItem {...NAV.apps[1]} badge={installedCount} />

          {!isCol ? <span className="px-5 pt-3 pb-0.5 text-[0.6rem] uppercase tracking-widest text-muted/50 font-semibold">DEVICE</span> : <hr className="border-white/10 mx-2 my-1" />}
          {NAV.device.map((item) => <NavItem key={item.path} {...item} />)}

          <div className="flex-1" />

          {/* Profile */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className={`flex items-center w-full border-t border-white/10 hover:bg-white/5 transition ${isCol ? 'justify-center py-3' : 'gap-3 px-3 py-2 text-left'}`}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: auth.isAuthenticated ? brand.primary : 'rgba(255,255,255,0.1)' }}>
                {auth.isAuthenticated ? (auth.user?.sub?.[0] ?? 'U').toUpperCase() : <LogIn size={14} />}
              </div>
              {!isCol && (
                <div className="flex-1 min-w-0">
                  <p className="text-[0.8rem] font-semibold truncate">{auth.isAuthenticated ? (auth.user?.sub ?? 'User') : 'Sign in'}</p>
                  <div className="flex items-center gap-1">
                    {activated ? <ShieldCheck size={11} color={brand.primary} /> : <ShieldAlert size={11} className="opacity-50" />}
                    <span className="text-[0.65rem] text-muted truncate">{window.location.hostname}</span>
                  </div>
                </div>
              )}
            </button>
            {menuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-[200px] rounded-xl bg-dark-end border border-white/10 shadow-xl z-50 py-1">
                <button onClick={() => { setDarkMode(!isDarkMode); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-white/5">
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} {isDarkMode ? 'Light mode' : 'Dark mode'}
                </button>
                {auth.isAuthenticated && <button onClick={() => { navigate('/profile'); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-white/5"><User size={16} /> Profile</button>}
                <hr className="border-white/10" />
                {auth.isAuthenticated ? (
                  <button onClick={() => auth.signOut()} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-white/5"><LogIn size={16} /> Sign out</button>
                ) : (
                  <button onClick={() => { auth.signIn(); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-white/5"><LogIn size={16} /> Sign in</button>
                )}
              </div>
            )}
          </div>
        </nav>
      </aside>
      {!isMobile && <div style={{ width: w, flexShrink: 0 }} />}
    </>
  );
}
