import { useState, useEffect, useRef, Fragment } from 'react';
import {
  Search,
  Download,
  Settings,
  User,
  LogIn,
  ShieldCheck,
  ShieldAlert,
  Sun,
  Moon,
  PanelLeftClose,
  ChevronDown,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '@stores/ui';
import { useAppList } from '@features/apps/app-queries';
import { flattenEditors } from '@features/apps/editor-nav';
import { createUrl } from '@features/apps/components/actions/EditorButton';
import { useOAuth4WebApiAuth } from '@features/auth/AuthProvider';
import { useGetDeviceLicenseActivationStatus } from '@generated/core/device/device';
import { useDarkMode } from '@app/theme/ThemeHandler';
import { unwrapSuccess } from '@app/api/unwrap';
import Logo from './Logo';
import { useTenant } from '@app/theme/TenantContext';

const NAV = [
  {
    section: 'Apps',
    items: [
      {
        label: 'Browse',
        icon: Search,
        path: '/marketplace',
        badgeKey: 'products' as string | undefined,
      },
      {
        label: 'Installed',
        icon: Download,
        path: '/',
        badgeKey: 'installed' as string | undefined,
      },
    ],
  },
  {
    section: 'Device',
    items: [
      {
        label: 'System',
        icon: Settings,
        path: '/system',
        badgeKey: undefined as string | undefined,
      },
    ],
  },
];

/** Max editor rows shown before the "All editors" overflow link */
const MAX_EDITORS = 8;

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);
  const { appList, products } = useAppList();
  const auth = useOAuth4WebApiAuth();
  const { data: licData } = useGetDeviceLicenseActivationStatus({ query: { staleTime: 60_000 } });
  const activated = unwrapSuccess(licData)?.isValid ?? false;
  const { isDarkMode, setDarkMode } = useDarkMode();
  const { app_title } = useTenant();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const installedCount = (appList ?? []).filter((a) => a?.status === 'installed').length;
  const badges: Record<string, number> = { products: products.length, installed: installedCount };
  const editorItems = flattenEditors(appList);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const isCol = !isMobile && collapsed;
  const w = isCol ? 56 : 240;

  return (
    <>
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar} />
      )}

      <aside
        style={{ width: isMobile ? 240 : w }}
        className={`fixed top-0 left-0 h-full flex flex-col bg-surface border-r border-border transition-[width,transform] duration-200 z-50 ${isMobile && !sidebarOpen ? '-translate-x-full' : ''}`}
      >
        {/* Logo */}
        <div className={`flex items-center h-14 shrink-0 ${isCol ? 'justify-center' : 'px-4'}`}>
          {isCol ? (
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-lg hover:bg-surface-hover transition cursor-pointer"
            >
              <Logo />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Logo />
                <span className="text-[15px] font-bold tracking-tight text-text-primary truncate">
                  {app_title}
                </span>
              </div>
              <button
                onClick={toggleCollapsed}
                className="p-1.5 rounded-md hover:bg-surface-hover transition text-muted cursor-pointer"
                title="Collapse"
              >
                <PanelLeftClose size={16} />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-1">
          {NAV.map(({ section, items }) => (
            <Fragment key={section}>
              <div className="mb-1">
                {!isCol && (
                  <p className="px-3 pt-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                    {section}
                  </p>
                )}
                {isCol && section !== NAV[0].section && <hr className="border-border mx-1 my-2" />}
                {items.map(({ label, icon: Icon, path, badgeKey }) => {
                  const active = pathname === path;
                  const badge = badgeKey ? badges[badgeKey] : undefined;
                  return (
                    <button
                      key={path}
                      title={isCol ? label : undefined}
                      onClick={() => {
                        navigate(path);
                        if (isMobile) toggleSidebar();
                      }}
                      className={`flex items-center w-full rounded-lg mb-0.5 transition-colors cursor-pointer ${isCol ? 'justify-center py-2.5 mx-auto' : 'py-2 px-3 gap-3'} ${active ? 'bg-surface-hover text-text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}
                    >
                      <Icon size={18} className={active ? 'text-brand' : ''} />
                      {!isCol && (
                        <span
                          className={`flex-1 text-left text-[13px] ${active ? 'font-semibold' : 'font-medium'}`}
                        >
                          {label}
                        </span>
                      )}
                      {!isCol && badge ? (
                        <span
                          className={`text-[11px] font-medium tabular-nums rounded-md px-1.5 py-0.5 ${active ? 'bg-brand/15 text-brand' : 'bg-surface-hover text-muted'}`}
                        >
                          {badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Editors — dynamic launcher for editors of running instances.
                  Section disappears entirely when nothing is running. */}
              {section === 'Apps' && editorItems.length > 0 && (
                <div className="mb-1">
                  {!isCol && (
                    <p className="px-3 pt-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                      Editors
                    </p>
                  )}
                  {isCol && <hr className="border-border mx-1 my-2" />}
                  {editorItems.slice(0, MAX_EDITORS).map((item) => (
                    <button
                      key={item.key}
                      title={isCol ? item.label : `Open ${item.label} in a new tab`}
                      onClick={() => {
                        window.open(createUrl(item.url));
                        if (isMobile) toggleSidebar();
                      }}
                      className={`group flex items-center w-full rounded-lg mb-0.5 transition-colors cursor-pointer text-text-secondary hover:bg-surface-hover hover:text-text-primary ${isCol ? 'justify-center py-2.5 mx-auto' : 'py-2 px-3 gap-3'}`}
                    >
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt=""
                          className="w-[18px] h-[18px] rounded shrink-0 object-cover"
                        />
                      ) : (
                        <span className="w-[18px] h-[18px] rounded bg-brand/15 text-brand text-[10px] font-bold flex items-center justify-center shrink-0">
                          {item.label[0]?.toUpperCase()}
                        </span>
                      )}
                      {!isCol && (
                        <>
                          <span className="flex-1 text-left text-[13px] font-medium truncate">
                            {item.label}
                          </span>
                          <ExternalLink
                            size={14}
                            className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          />
                        </>
                      )}
                    </button>
                  ))}
                  {!isCol && editorItems.length > MAX_EDITORS && (
                    <button
                      onClick={() => {
                        navigate('/');
                        if (isMobile) toggleSidebar();
                      }}
                      className="flex items-center w-full rounded-lg mb-0.5 py-2 px-3 gap-3 transition-colors cursor-pointer text-muted hover:bg-surface-hover hover:text-text-primary"
                    >
                      <MoreHorizontal size={18} />
                      <span className="flex-1 text-left text-[13px] font-medium">
                        All editors ({editorItems.length})
                      </span>
                    </button>
                  )}
                </div>
              )}
            </Fragment>
          ))}
        </nav>

        {/* Profile */}
        <div ref={profileRef} className="relative shrink-0 border-t border-border">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center w-full transition-colors cursor-pointer hover:bg-surface-hover ${isCol ? 'justify-center py-3' : 'gap-3 px-4 py-3'}`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{
                background: auth.isAuthenticated
                  ? 'var(--color-brand)'
                  : 'var(--color-surface-hover)',
              }}
            >
              {auth.isAuthenticated ? (
                (auth.user?.sub?.[0] ?? 'U').toUpperCase()
              ) : (
                <LogIn size={14} />
              )}
            </div>
            {!isCol && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-semibold text-text-primary truncate">
                    {auth.isAuthenticated ? (auth.user?.sub ?? 'User') : 'Sign in'}
                  </p>
                  <div className="flex items-center gap-1">
                    {activated ? (
                      <ShieldCheck size={10} className="text-success" />
                    ) : (
                      <ShieldAlert size={10} className="text-muted" />
                    )}
                    <span className="text-[11px] text-muted truncate">
                      {window.location.hostname}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>

          {profileOpen && (
            <div
              className={`absolute mb-1 w-52 rounded-xl bg-surface-raised border border-border shadow-xl z-[9999] py-1.5 ${isCol ? 'bottom-0 left-full ml-2' : 'bottom-full left-2 right-2 w-auto'}`}
            >
              <button
                onClick={() => {
                  setDarkMode(!isDarkMode);
                  setProfileOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-[13px] text-text-secondary hover:bg-surface-hover hover:text-text-primary transition cursor-pointer"
              >
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}{' '}
                {isDarkMode ? 'Light mode' : 'Dark mode'}
              </button>
              {auth.isAuthenticated && (
                <button
                  onClick={() => {
                    navigate('/profile');
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-[13px] text-text-secondary hover:bg-surface-hover hover:text-text-primary transition cursor-pointer"
                >
                  <User size={15} /> Profile
                </button>
              )}
              <hr className="border-border my-1" />
              {auth.isAuthenticated ? (
                <button
                  onClick={() => auth.signOut()}
                  className="flex items-center gap-3 w-full px-4 py-2 text-[13px] text-error hover:bg-surface-hover transition cursor-pointer"
                >
                  <LogIn size={15} /> Sign out
                </button>
              ) : (
                <button
                  onClick={() => {
                    auth.signIn();
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-[13px] text-text-secondary hover:bg-surface-hover hover:text-text-primary transition cursor-pointer"
                >
                  <LogIn size={15} /> Sign in
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Spacer */}
      {!isMobile && <div style={{ width: w, flexShrink: 0 }} />}
    </>
  );
}
